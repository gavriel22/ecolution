import { apiFetch } from "@/lib/api-client";
import type { Challenge, UserChallenge } from "./types";

function buildQuery(params: Record<string, any>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listChallenges(params: { categoryId?: string; search?: string } = {}) {
  return apiFetch<Challenge[]>(`/api/challenge${buildQuery(params)}`);
}

export function getChallenge(id: string) {
  return apiFetch<Challenge>(`/api/challenge/${id}`);
}

export function joinChallenge(challengeId: string) {
  return apiFetch<Challenge>("/api/challenge/join", {
    method: "POST",
    body: { challengeId },
  });
}

export function leaveChallenge(id: string) {
  return apiFetch<{ message: string }>(`/api/challenge/${id}/leave`, {
    method: "POST",
  });
}

export function listMyChallenges() {
  return apiFetch<UserChallenge[]>("/api/challenge/my");
}
