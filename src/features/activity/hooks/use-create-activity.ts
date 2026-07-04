import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createActivity } from "../api";
import type { CreateActivityPayload } from "../types";

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateActivityPayload) => createActivity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
