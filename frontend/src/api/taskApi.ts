import { http } from "./client";

export type TaskStatus = "todo" | "inprogress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;         // 3 trạng thái mới
  deadline?: string | null;
  startAt?: string | null;   
  endAt?: string | null; 
  createdAt: string;
  userId: string;
};

export const taskApi = {
  list(params?: { status?: TaskStatus; priority?: TaskPriority; deadline?: string }) {
    return http.get("/tasks", { params }).then(r => r.data as Task[]);
  },
  get(id: string) {
    return http.get(`/tasks/${id}`).then(r => r.data as Task);
  },
  create(payload: Partial<Task>) {
    return http.post("/tasks", payload).then(r => r.data as Task);
  },
  update(id: string, patch: Partial<Task>) {
    return http.put(`/tasks/${id}`, patch).then(r => r.data as Task);
  },
  remove(id: string) {
    return http.delete(`/tasks/${id}`).then(r => r.data);
  },
};
