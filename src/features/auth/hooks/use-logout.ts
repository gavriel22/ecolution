import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "../api";

export function useLogout() {
  const { logoutLocally } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSettled: () => {
      // Clear local session regardless of whether the server call succeeded —
      // the cookie may already be gone/expired.
      logoutLocally();
      queryClient.clear();
    },
  });
}
