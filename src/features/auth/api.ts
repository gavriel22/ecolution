import { apiFetch } from "@/lib/api-client";
import type { LoginPayload, LoginResponseData, RegisterPayload, User } from "./types";

export function registerUser(payload: RegisterPayload) {
  return apiFetch<User>("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function loginUser(payload: LoginPayload) {
  return apiFetch<LoginResponseData>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function logoutUser() {
  return apiFetch<{ message: string }>("/api/auth/logout", {
    method: "POST",
  });
}

export function getMe() {
  return apiFetch<User>("/api/auth/me");
}
