import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitActivity } from "../api";

export function useSubmitActivity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity", id] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
}
