import { useMutation } from "@tanstack/react-query";
import { setAccessToken } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { loginUser } from "../api";
import type { LoginPayload } from "../types";

/**
 * Usage:
 *   const login = useLogin();
 *   login.mutate({ email, password }, { onSuccess: () => router.push("/activity") });
 */
export function useLogin() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (res) => {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
    },
  });
}
