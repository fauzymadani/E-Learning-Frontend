import { api } from "./axios";

export interface LoginReq {
  email: string;
  password: string;
}

export async function loginUser(data: LoginReq) {
  const res = await api.post("/auth/login", data);
  return res.data;
}

export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data;
}

export async function getProfile() {
  const res = await api.get("/auth/profile");
  return res.data;
}
