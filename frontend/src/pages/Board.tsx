import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { taskApi, type Task, type TaskStatus, type TaskPriority } from "@/api/taskApi";
import { Edit2, Trash2 } from "lucide-react";

type ColumnId = "todo" | "inprogress" | "done";
type UiTask = { id: string; title: string; raw: Task };
type Columns = Record<ColumnId, UiTask[]>;

const isoFromLocalDate = (dateYMD: string) =>
  new Date(dateYMD + "T00:00:00Z").toISOString(); // lưu mốc 00:00 UTC để không lệch ngày

const Board: React.FC = () => {
  const [columns, setColumns] = useState<Columns>({ todo: [], inprogress: [], done: [] });
  const [loading, setLoading] = useState(false);

  // --- Edit modal state ---
  const [editing, setEditing] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    deadline: string; // YYYY-MM-DD
  }>({ title: "", status: "todo", priority: "medium", deadline: "" });

  const toUi = (t: Task): UiTask => ({ id: t._id, title: t.title, raw: t });

  const load = async () => {
    setLoading(true);
    try {
      const tasks = await taskApi.list();
      setColumns({
        todo: tasks.filter((t) => t.status === "todo").map(toUi),
        inprogress: tasks.filter((t) => t.status === "inprogress").map(toUi),
        done: tasks.filter((t) => t.status === "done").map(toUi),
      });
    } catch (e) {
      console.error(e);
      setColumns({ todo: [], inprogress: [], done: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const srcId = source.droppableId as ColumnId;
    const dstId = destination.droppableId as ColumnId;

    // cùng cột → chỉ reorder UI
    if (srcId === dstId) {
      const updated = { ...columns };
      const col = Array.from(updated[srcId]);
      const [moved] = col.splice(source.index, 1);
      col.splice(destination.index, 0, moved);
      updated[srcId] = col;
      setColumns(updated);
      return;
    }

    // khác cột → cập nhật UI + gọi API
    const snapshot = { ...columns }; // để rollback nếu lỗi
    const fromCol = Array.from(columns[srcId]);
    const toCol = Array.from(columns[dstId]);
    const [moved] = fromCol.splice(source.index, 1);
    toCol.splice(destination.index, 0, moved);
    setColumns({ ...columns, [srcId]: fromCol, [dstId]: toCol });

    try {
      await taskApi.update(moved.id, { status: dstId });
    } catch (e) {
      console.error(e);
      setColumns(snapshot); // rollback
    }
  };

  const createIn = async (colId: ColumnId) => {
    try {
      await taskApi.create({ title: "New Task", status: colId, priority: "medium" });
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (taskId: string) => {
    try {
      await taskApi.remove(taskId);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  // ---- Edit modal handlers ----
  const openEdit = (t: UiTask) => {
    const raw = t.raw;
    setEditing(raw);
    setEditForm({
      title: raw.title,
      status: raw.status,
      priority: raw.priority,
      deadline: raw.deadline ? new Date(raw.deadline).toISOString().slice(0, 10) : "",
    });
  };

  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await taskApi.update(editing._id, {
        title: editForm.title.trim(),
        status: editForm.status,
        priority: editForm.priority,
        deadline: editForm.deadline ? isoFromLocalDate(editForm.deadline) : null,
      });
      setEditing(null);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const colTitle = (c: ColumnId) => (c === "todo" ? "To Do" : c === "inprogress" ? "In Process" : "Done");
  const colAccent = (c: ColumnId) =>
    c === "todo" ? "border-orange-300" : c === "inprogress" ? "border-blue-300" : "border-green-300";

  return (
    <div className="min-h-screen w-full relative bg-white">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at top center, rgba(70,130,180,0.5), transparent 70%)",
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10 flex flex-col w-screen min-h-screen">
        <Header />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            {/* <h2 className="text-lg font-semibold">Kanban Board</h2> */}
            {loading && <span className="text-sm text-gray-500">Loading…</span>}
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.keys(columns) as ColumnId[]).map((colId) => (
                <Droppable droppableId={colId} key={colId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-gray-50 rounded-lg shadow-sm p-4 min-h-[420px] border ${colAccent(colId)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-700">{colTitle(colId)}</h3>
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            {columns[colId].length}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-gray-600 hover:text-purple-600"
                          onClick={() => {
                            void createIn(colId);
                          }}
                          title="Create task"
                        >
                          + Create
                        </button>
                      </div>

                      <div className="flex flex-col gap-3">
                        {columns[colId].map((t, index) => (
                          <Draggable draggableId={t.id} index={index} key={t.id}>
                            {(draggable) => (
                              <div
                                ref={draggable.innerRef}
                                {...draggable.draggableProps}
                                {...draggable.dragHandleProps}
                                className="bg-white rounded-md shadow px-3 py-2"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{t.title}</p>
                                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                                      <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
                                        #{t.raw._id.slice(-6).toUpperCase()}
                                      </span>
                                      {t.raw.deadline && (
                                        <span className="inline-block px-2 py-0.5 bg-gray-100 rounded">
                                          {new Date(t.raw.deadline).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      className="p-1 rounded hover:bg-purple-50 text-gray-500 hover:text-purple-600"
                                      onClick={() => openEdit(t)}
                                      title="Edit"
                                    >
                                      <Edit2 size={16} className="pointer-events-none" />
                                    </button>
                                    <button
                                      type="button"
                                      className="p-1 rounded hover:bg-red-50 text-gray-500 hover:text-red-600"
                                      onClick={() => {
                                        void remove(t.id);
                                      }}
                                      title="Delete"
                                    >
                                      <Trash2 size={16} className="pointer-events-none" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </main>
      </div>

      {/* ---------- Edit Modal ---------- */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-lg font-semibold mb-4">Edit task</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  value={editForm.title}
                  onChange={(e) => setEditForm((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Task title"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, status: e.target.value as TaskStatus }))
                    }
                  >
                    <option value="todo">to do</option>
                    <option value="inprogress">in process</option>
                    <option value="done">done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Priority</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm((s) => ({ ...s, priority: e.target.value as TaskPriority }))
                    }
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Deadline</label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm((s) => ({ ...s, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
                onClick={closeEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                onClick={() => {
                  void saveEdit();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
