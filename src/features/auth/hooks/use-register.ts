import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api";
import type { RegisterPayload } from "../types";

/**
 * Registration only creates the account — it does NOT log the user in
 * (backend register endpoint returns the User, not a token). Redirect to
 * /login with a success message after this succeeds.
 */
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });
}
