import { apiFetch } from "@/lib/api-client";
import type {
  Activity,
  ActivityCategory,
  ActivityListParams,
  CreateActivityPayload,
  UpdateActivityPayload,
} from "./types";

function buildQuery(params: ActivityListParams) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function getActivityCategories() {
  return apiFetch<ActivityCategory[]>("/api/activity/categories");
}

export function listActivities(params: ActivityListParams = {}) {
  return apiFetch<Activity[]>(`/api/activity${buildQuery(params)}`);
}

export function getActivity(id: string) {
  return apiFetch<Activity>(`/api/activity/${id}`);
}

/**
 * Create activity — always multipart/form-data because the photo is
 * uploaded together with the activity data in a single request.
 */
export function createActivity(payload: CreateActivityPayload) {
  const formData = new FormData();
  formData.set("image", payload.image);
  formData.set("title", payload.title);
  formData.set("categoryId", payload.categoryId);
  formData.set("activityDate", payload.activityDate);
  if (payload.description) formData.set("description", payload.description);
  if (payload.location) formData.set("location", payload.location);

  return apiFetch<Activity>("/api/activity", {
    method: "POST",
    body: formData,
  });
}

export function updateActivity(id: string, payload: UpdateActivityPayload) {
  return apiFetch<Activity>(`/api/activity/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteActivity(id: string) {
  return apiFetch<{ message?: string }>(`/api/activity/${id}`, {
    method: "DELETE",
  });
}

export function submitActivity(id: string) {
  return apiFetch<Activity>(`/api/activity/${id}/submit`, {
    method: "POST",
  });
}

export function approveActivity(id: string, note?: string) {
  return apiFetch<Activity>(`/api/activity/${id}/approve`, {
    method: "POST",
    body: { note },
  });
}

export function rejectActivity(id: string, adminNote: string, note?: string) {
  return apiFetch<Activity>(`/api/activity/${id}/reject`, {
    method: "POST",
    body: { adminNote, note },
  });
}
