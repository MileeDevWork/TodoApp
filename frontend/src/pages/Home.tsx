// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/header";
import { Calendar as CalendarIcon, Edit2, Trash2 } from "lucide-react";
import { taskApi, type Task, type TaskStatus, type TaskPriority } from "@/api/taskApi";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format } from "date-fns";

const PAGE_SIZE = 4;

// ===== Helpers =====
const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "");
const dateRange = (t: Task) => {
  if (t.startAt && t.endAt) return `${fmt(t.startAt)} – ${fmt(t.endAt)}`;
  if (t.startAt) return `Start: ${fmt(t.startAt)}`;
  if (t.endAt) return `End: ${fmt(t.endAt)}`;
  if (t.deadline) return new Date(t.deadline).toLocaleDateString();
  return "No schedule";
};

const combineDateTime = (date?: Date, time?: string): string | null => {
  if (!date) return null;
  const d = new Date(date);
  if (time && /^\d{2}:\d{2}$/.test(time)) {
    const [hh, mm] = time.split(":").map((x) => parseInt(x, 10));
    d.setHours(hh || 0, mm || 0, 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
};

type DateTimeState = {
  date?: Date;
  time: string; // "HH:mm"
};

// Một field Start/End: lịch shadcn + time dưới lịch
function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: DateTimeState;
  onChange: (next: DateTimeState) => void;
}) {
  const buttonText =
    value.date ? `${format(value.date, "PP")} ${value.time || ""}`.trim() : "Chọn ngày & giờ";

  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="flex flex-col items-stretch">
            <CalendarPicker
              mode="single"
              selected={value.date}
              onSelect={(d) => onChange({ ...value, date: d ?? undefined })}
              initialFocus
            />
            <div className="mt-3 flex items-center gap-2">
              <input
                type="time"
                className="border rounded-md px-2 py-1"
                value={value.time}
                onChange={(e) => onChange({ ...value, time: e.target.value })}
              />
              <Button
                variant="ghost"
                className="ml-auto"
                onClick={() => onChange({ date: undefined, time: "" })}
              >
                Clear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const Home = () => {
  const [items, setItems] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [page, setPage] = useState(1);

  // ====== Create modal ======
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<{
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    start: DateTimeState;
    end: DateTimeState;
  }>({
    title: "",
    status: "todo",
    priority: "medium",
    start: { date: undefined, time: "" },
    end: { date: undefined, time: "" },
  });

  // ====== Edit modal ======
  const [editing, setEditing] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    start: DateTimeState;
    end: DateTimeState;
  }>({
    title: "",
    status: "todo",
    priority: "medium",
    start: { date: undefined, time: "" },
    end: { date: undefined, time: "" },
  });

  // ===== Load tasks =====
  const load = async () => {
    try {
      const data = await taskApi.list();
      data.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setItems(data);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  // ===== Filters / Pagination =====
  const filtered = useMemo(
    () => (statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter)),
    [items, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const currentItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const getPages = (total: number, current: number, max = 5): (number | "...")[] => {
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    let end = start + max - 1;
    if (end > total) {
      end = total;
      start = total - max + 1;
    }
    const arr: (number | "...")[] = [];
    if (start > 1) {
      arr.push(1);
      if (start > 2) arr.push("...");
    }
    for (let i = start; i <= end; i++) arr.push(i);
    if (end < total) {
      if (end < total - 1) arr.push("...");
      arr.push(total);
    }
    return arr;
  };

  // ===== CRUD =====
  const createTask = async () => {
    const title = createForm.title.trim();
    if (!title) return;

    const startAt = combineDateTime(createForm.start.date, createForm.start.time);
    const endAt = combineDateTime(createForm.end.date, createForm.end.time);
    if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
      alert("End time phải sau Start time");
      return;
    }

    try {
      await taskApi.create({
        title,
        status: createForm.status,
        priority: createForm.priority,
        startAt,
        endAt,
      });
      setShowCreate(false);
      setCreateForm({
        title: "",
        status: "todo",
        priority: "medium",
        start: { date: undefined, time: "" },
        end: { date: undefined, time: "" },
      });
      setPage(1);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (t: Task) => {
    const toHM = (iso?: string | null) => {
      if (!iso) return "";
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    };
    setEditing(t);
    setEditForm({
      title: t.title,
      status: t.status,
      priority: t.priority,
      start: { date: t.startAt ? new Date(t.startAt) : undefined, time: toHM(t.startAt) },
      end: { date: t.endAt ? new Date(t.endAt) : undefined, time: toHM(t.endAt) },
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const startAt = combineDateTime(editForm.start.date, editForm.start.time);
    const endAt = combineDateTime(editForm.end.date, editForm.end.time);
    if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
      alert("End time phải sau Start time");
      return;
    }
    await taskApi.update(editing._id, {
      title: editForm.title.trim(),
      status: editForm.status,
      priority: editForm.priority,
      startAt,
      endAt,
    });
    setEditing(null);
    await load();
  };

  const setStatus = async (t: Task, status: TaskStatus) => {
    try {
      await taskApi.update(t._id, { status });
      await load();
    } catch (e) {
      console.error(e);
    }
  };
  const toggleDone = (t: Task) => setStatus(t, t.status === "done" ? "todo" : "done");

  const remove = async (t: Task) => {
    try {
      await taskApi.remove(t._id);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const countTodo = items.filter((x) => x.status === "todo").length;
  const countInprogress = items.filter((x) => x.status === "inprogress").length;
  const countDone = items.filter((x) => x.status === "done").length;

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* bg glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage: `radial-gradient(circle at top center, rgba(70,130,180,0.5), transparent 70%)`,
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10 flex flex-col w-screen min-h-screen">
        <Header />

        <main className="flex-1 p-6 space-y-8 max-w-4xl mx-auto w-full">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
              <p className="text-3xl font-bold text-orange-500">{countTodo}</p>
              <p className="text-gray-600">To Do</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
              <p className="text-3xl font-bold text-blue-500">{countInprogress}</p>
              <p className="text-gray-600">In Process</p>
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
              <p className="text-3xl font-bold text-green-500">{countDone}</p>
              <p className="text-gray-600">Done</p>
            </div>
          </div>

          {/* Add Task bar -> mở popup tạo */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cần phải làm gì?"
              className="flex-1 border rounded-md px-3 py-2"
              value={createForm.title}
              onChange={(e) => setCreateForm((s) => ({ ...s, title: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && setShowCreate(true)}
            />
            <Button onClick={() => setShowCreate(true)} className="px-4">
              + Thêm
            </Button>
          </div>

          {/* Task List (giữ style thẻ) */}
          <div className="space-y-4">
            {currentItems.map((t) => (
              <div
                key={t._id}
                className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={t.status === "done"}
                    onChange={() => toggleDone(t)}
                    title="Mark as done"
                  />
                  <div>
                    <p className="font-medium">{t.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          t.status === "todo"
                            ? "border-orange-400 text-orange-600"
                            : t.status === "inprogress"
                            ? "border-blue-400 text-blue-600"
                            : "border-green-500 text-green-600"
                        }`}
                      >
                        {t.status === "inprogress" ? "in process" : t.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={14} />
                        <span>{dateRange(t)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-500">
                  {t.status !== "inprogress" && t.status !== "done" && (
                    <button
                      onClick={() => setStatus(t, "inprogress")}
                      className="text-sm text-blue-600 hover:underline"
                      title="Move to In Process"
                    >
                      Start
                    </button>
                  )}
                  {t.status === "inprogress" && (
                    <button
                      onClick={() => setStatus(t, "todo")}
                      className="text-sm text-orange-600 hover:underline"
                      title="Back to To Do"
                    >
                      To do
                    </button>
                  )}

                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-indigo-600 rounded"
                    onClick={() => openEdit(t)}
                    title="Edit"
                  >
                    <Edit2 size={18} className="pointer-events-none" />
                  </button>
                  <button
                    type="button"
                    className="p-1 text-gray-500 hover:text-rose-600 rounded"
                    title="Delete"
                    onClick={() => {
                      void remove(t);
                    }}
                  >
                    <Trash2 size={18} className="pointer-events-none" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination bar */}
            <div className="mt-4 flex items-center justify-between">
              <button
                className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹ Trước
              </button>

              <div className="flex items-center gap-2">
                {getPages(totalPages, page).map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`w-9 h-9 rounded-md text-sm ${
                        page === p ? "bg-gray-900 text-white" : "bg-white border hover:bg-gray-50"
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className="px-3 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau ›
                </button>
              </div>

              <div>
                <select
                  className="border rounded-md px-3 py-2 bg-white text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">Tất cả</option>
                  <option value="todo">To do</option>
                  <option value="inprogress">In process</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* ===== Create Modal ===== */}
          {showCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
              <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-5">
                <h3 className="text-lg font-semibold mb-4">Create task</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Title</label>
                    <input
                      className="w-full border rounded-md px-3 py-2"
                      value={createForm.title}
                      onChange={(e) => setCreateForm((s) => ({ ...s, title: e.target.value }))}
                      placeholder="Task title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Status</label>
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={createForm.status}
                        onChange={(e) =>
                          setCreateForm((s) => ({ ...s, status: e.target.value as TaskStatus }))
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
                        value={createForm.priority}
                        onChange={(e) =>
                          setCreateForm((s) => ({ ...s, priority: e.target.value as TaskPriority }))
                        }
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </div>
                  </div>

                  {/* Start & End */}
                  <DateTimeField
                    label="Start"
                    value={createForm.start}
                    onChange={(v) => setCreateForm((s) => ({ ...s, start: v }))}
                  />
                  <DateTimeField
                    label="End"
                    value={createForm.end}
                    onChange={(v) => setCreateForm((s) => ({ ...s, end: v }))}
                  />
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTask}>Create</Button>
                </div>
              </div>
            </div>
          )}

          {/* ===== Edit Modal ===== */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
              <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-5">
                <h3 className="text-lg font-semibold mb-4">Edit task</h3>

                <div className="space-y-4">
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

                  {/* Start & End */}
                  <DateTimeField
                    label="Start"
                    value={editForm.start}
                    onChange={(v) => setEditForm((s) => ({ ...s, start: v }))}
                  />
                  <DateTimeField
                    label="End"
                    value={editForm.end}
                    onChange={(v) => setEditForm((s) => ({ ...s, end: v }))}
                  />
                </div>

                <div className="mt-5 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button onClick={() => void saveEdit()}>Save</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
