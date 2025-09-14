import React, { useEffect, useState } from "react";
import Header from "../components/header";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";

// ================== Mock API services ================== //
// Sau này bạn thay console.log = fetch/axios
const fetchTasksAPI = async () => {
  return {
    todo: [
      { id: "1", title: "tìm mua gpt pro ok", code: "DAMH-28", assignee: null },
    ],
    inprogress: [
      { id: "2", title: "nghiên cứu p6 (camera)", code: "DAMH-29", assignee: "TL" },
      { id: "3", title: "Nghiên cứu sơ về động lực học", code: "DAMH-26", assignee: "BH" },
    ],
    done: [
      { id: "4", title: "lập kế hoạch thực hiện và gửi email cho thầy góp ý", code: "DAMH-27", assignee: "3" },
      { id: "5", title: "dựng được con chó robot", code: "DAMH-31", assignee: null },
      { id: "6", title: "tạo git+mail chung", code: "DAMH-33", assignee: null },
      { id: "7", title: "cài môi trường cho ras", code: "DAMH-30", assignee: "BH" },
    ],
  };
};

const updateTaskStatusAPI = async (taskId: string, newStatus: string) => {
  console.log(`PUT /tasks/${taskId} → status=${newStatus}`);
};

const addTaskAPI = async (colId: string, newTask: any) => {
  console.log(`POST /tasks → ${JSON.stringify({ ...newTask, status: colId })}`);
};

const editTaskAPI = async (taskId: string, updatedTask: any) => {
  console.log(`PUT /tasks/${taskId} → ${JSON.stringify(updatedTask)}`);
};

const deleteTaskAPI = async (taskId: string) => {
  console.log(`DELETE /tasks/${taskId}`);
};

// ================== Component chính ================== //
const Board: React.FC = () => {
  const [columns, setColumns] = useState<Record<string, any[]>>({
    todo: [],
    inprogress: [],
    done: [],
  });

  // Load dữ liệu ban đầu
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchTasksAPI();
      setColumns(data);
    };
    loadData();
  }, []);

  // Kéo thả Task
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const col = [...columns[source.droppableId]];
      const [moved] = col.splice(source.index, 1);
      col.splice(destination.index, 0, moved);

      setColumns({ ...columns, [source.droppableId]: col });
    } else {
      const sourceCol = [...columns[source.droppableId]];
      const destCol = [...columns[destination.droppableId]];
      const [moved] = sourceCol.splice(source.index, 1);
      destCol.splice(destination.index, 0, moved);

      setColumns({
        ...columns,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      });

      await updateTaskStatusAPI(moved.id, destination.droppableId);
    }
  };

  // Thêm Task mới
  const handleAddTask = async (colId: string) => {
    const newTask = {
      id: Date.now().toString(),
      title: "New Task",
      code: "DAMH-" + Math.floor(Math.random() * 1000),
      assignee: null,
    };
    setColumns({ ...columns, [colId]: [...columns[colId], newTask] });
    await addTaskAPI(colId, newTask);
  };

  // Sửa Task
  const handleEditTask = async (colId: string, taskId: string) => {
    const updatedTask = { title: "Edited Task" }; // demo
    setColumns({
      ...columns,
      [colId]: columns[colId].map((t) =>
        t.id === taskId ? { ...t, ...updatedTask } : t
      ),
    });
    await editTaskAPI(taskId, updatedTask);
  };

  // Xóa Task
  const handleDeleteTask = async (colId: string, taskId: string) => {
    setColumns({
      ...columns,
      [colId]: columns[colId].filter((t) => t.id !== taskId),
    });
    await deleteTaskAPI(taskId);
  };

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "#ffffff",
          backgroundImage: `
            radial-gradient(
              circle at top center,
              rgba(70, 130, 180, 0.5),
              transparent 70%
            )
          `,
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col w-screen min-h-screen">
        <Header />

        <main className="flex-1 p-6 overflow-x-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(columns).map(([colId, tasks]) => (
                <Droppable droppableId={colId} key={colId}>
                  {(provided) => (
                    <div
                      className="bg-gray-50 rounded-lg shadow-sm p-4 flex flex-col min-h-[400px]"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {/* Column header */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-700 uppercase text-sm">
                          {colId === "todo"
                            ? "To Do"
                            : colId === "inprogress"
                            ? "In Progress"
                            : "Done"}
                        </h2>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {tasks.length}
                        </span>
                      </div>

                      {/* Tasks */}
                      <div className="flex flex-col gap-3">
                        {tasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="bg-white rounded-md shadow px-3 py-2 flex flex-col gap-1"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium">{task.title}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>{task.code}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {/* <button
                                      onClick={() => handleEditTask(colId, task.id)}
                                      className="text-blue-500 text-xs"
                                    >
                                      Sửa
                                    </button> */}
                                    {/* <button
                                      onClick={() => handleDeleteTask(colId, task.id)}
                                      className="text-red-500 text-xs"
                                    >
                                      Xóa
                                    </button> */}
                                  </div>
                                </div>
                                <div className="flex items-center justify-end">
                                  {task.assignee ? (
                                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs">
                                      {task.assignee}
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                      👤
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>

                      {/* Add new task */}
                      <button
                        onClick={() => handleAddTask(colId)}
                        className="mt-4 text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1"
                      >
                        + Create
                      </button>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </main>
      </div>
    </div>
  );
};

export default Board;
