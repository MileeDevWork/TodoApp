import { http } from "./client";

export const authApi = {
  signup(payload: { name: string; email: string; password: string }) {
    return http.post("/auth/signup", payload).then(r => r.data);
  },
  signin(payload: { email: string; password: string }) {
    return http.post("/auth/signin", payload).then(r => r.data);
  },
};
