import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "../api";

export function useLogout() {
  const { logoutLocally } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSettled: () => {
      logoutLocally();
      queryClient.clear();
      window.location.replace("/");
    },
  });
}
