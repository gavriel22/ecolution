"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, refreshSession, setAccessToken } from "@/lib/api-client";
import type { User } from "@/features/auth/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logoutLocally: () => void;
  activeRole: "USER" | "UMKM" | "ADMIN" | null;
  setActiveRole: (role: "USER" | "UMKM" | "ADMIN") => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * On mount, tries to restore the session using the HttpOnly refresh_token
 * cookie (silent refresh). This is what lets a user stay "logged in" across
 * page reloads even though the access token itself only lives in memory.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRoleState] = useState<"USER" | "UMKM" | "ADMIN" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logoutLocally = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setActiveRoleState(null);
    localStorage.removeItem("ecolution_active_role");
    // Safety net: expire the client-readable accessToken cookie ourselves in
    // case the logout request failed (offline). The refresh_token is HttpOnly
    // and is cleared server-side by /api/auth/logout.
    if (typeof document !== "undefined") {
      document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
    }
  }, []);

  const setActiveRole = useCallback((role: "USER" | "UMKM" | "ADMIN") => {
    setActiveRoleState(role);
    localStorage.setItem("ecolution_active_role", role);
  }, []);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem("ecolution_active_role") as any;
      if (
        stored &&
        (stored === "USER" ||
          (stored === "UMKM" && user.role === "UMKM") ||
          (stored === "ADMIN" && user.role === "ADMIN"))
      ) {
        setActiveRoleState(stored);
      } else {
        setActiveRoleState(user.role);
      }
    } else {
      setActiveRoleState(null);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const session = await refreshSession<User>();
      if (!session) {
        if (isMounted) setIsLoading(false);
        return;
      }

      // Fast path: /api/auth/refresh already returned the user, so we can
      // restore the session in a single round trip (no extra /api/auth/me).
      if (session.user) {
        if (isMounted) {
          setUser(session.user);
          setIsLoading(false);
        }
        return;
      }

      // Fallback for older responses that don't include the user.
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
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        setUser,
        logoutLocally,
        activeRole,
        setActiveRole,
      }}
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
