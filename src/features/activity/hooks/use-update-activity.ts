import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActivity } from "../api";
import type { UpdateActivityPayload } from "../types";

export function useUpdateActivity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateActivityPayload) => updateActivity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
