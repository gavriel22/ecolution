"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, refreshAccessToken, setAccessToken } from "@/lib/api-client";
import type { User } from "@/features/auth/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logoutLocally: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * On mount, tries to restore the session using the HttpOnly refresh_token
 * cookie (silent refresh). This is what lets a user stay "logged in" across
 * page reloads even though the access token itself only lives in memory.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logoutLocally = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const token = await refreshAccessToken();
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await apiFetch<User>("/api/auth/me");
        if (isMounted) setUser(res.data);
      } catch {
        if (isMounted) logoutLocally();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [logoutLocally]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, setUser, logoutLocally }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
