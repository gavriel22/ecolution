"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useLogin } from "../hooks/use-login";
import { ApiError, apiFetch } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const { user, isLoading, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl");

  async function handleGoogleCredentialResponse(response: any) {
    setGoogleLoading(true);
    try {
      const res = await apiFetch<any>("/api/auth/google", {
        method: "POST",
        body: { idToken: response.credential },
      });

      setUser(res.data.user);

      toast.success("Login Google berhasil, mengalihkan...", {
        duration: 2000,
        position: "top-center",
      });

      setTimeout(() => {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.push("/dashboard");
        }
      }, 800);
    } catch (error: any) {
      toast.error(error.message || "Gagal masuk menggunakan Google", {
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setGoogleLoading(false);
    }
  }

  useEffect(() => {
    if (isLoading || user) return;

    apiFetch<{ clientId: string | null }>("/api/auth/google")
      .then((res) => {
        const clientId = res.data?.clientId;
        if (!clientId) return;

        const loadGoogleScript = (callback: () => void) => {
          if (typeof window === "undefined") return;
          if ((window as any).google) {
            callback();
            return;
          }
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = callback;
          document.head.appendChild(script);
        };

        loadGoogleScript(() => {
          const google = (window as any).google;
          if (google) {
            google.accounts.id.initialize({
              client_id: clientId,
              callback: handleGoogleCredentialResponse,
            });

            const container = document.getElementById("google-signin-btn");
            // Google's button needs a fixed px width; derive it from the actual
            // container so it never overflows on narrow phones (max 400 per GSI).
            const width = Math.min(400, Math.max(200, container?.clientWidth || 320));

            google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "large",
              width,
              text: "signin_with",
              shape: "rectangular",
            });
          }
        });
      })
      .catch((err) => {
        console.error("Failed to load Google client ID config", err);
      });
  }, [user, isLoading]);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, callbackUrl, router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Reset error state before new attempt
    login.reset();

    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          toast.success("Login berhasil, mengalihkan ke dashboard...", {
            duration: 2000,
            position: "top-center",
          });

          // Small delay to let user see the toast before redirect
          setTimeout(() => {
            if (callbackUrl) {
              router.push(callbackUrl);
            } else {
              router.push("/dashboard");
            }
          }, 800);
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? getFriendlyErrorMessage(error)
              : "Login gagal. Periksa koneksi internet dan coba lagi.";

          toast.error(message, {
            position: "top-center",
            duration: 4000,
          });
        },
      }
    );
  }

  const isSubmitting = login.isPending;

  const inlineErrorMessage =
    login.error instanceof ApiError
      ? getFriendlyErrorMessage(login.error)
      : login.error
        ? "Login gagal. Periksa koneksi internet dan coba lagi."
        : null;

  // While the session is being restored, or when an already-authenticated user
  // is about to be redirected, show a loader instead of flashing the login form.
  if (isLoading || user) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 py-16">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-moss-200 border-t-moss-700" />
        <p className="font-mono text-xs text-ink-400">
          {user ? "Mengalihkan ke dashboard..." : "Menyiapkan halaman masuk..."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss-700 hover:text-moss-900 transition-colors mb-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 animate-none"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Kembali ke Beranda
      </Link>

      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Masuk</h1>
        <p className="text-sm text-ink-400">Lanjutkan aksi lingkunganmu di Ecolution.</p>
      </div>

      {/* Inline error banner */}
      {inlineErrorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2.5 text-sm text-rust-600"
        >
          {/* Error icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{inlineErrorMessage}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          disabled={isSubmitting}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="kamu@email.com"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-wide text-ink-400"
        >
          Kata Sandi
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          disabled={isSubmitting}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="••••••••"
        />
      </div>

      <button
        id="login-submit-btn"
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="relative flex w-full items-center justify-center gap-2 rounded-md bg-moss-700 px-4 py-2.5 font-medium text-paper-50 transition hover:bg-moss-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        <span>{isSubmitting ? "Sedang masuk..." : "Masuk"}</span>
      </button>

      {/* Google Login Button */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-paper-200"></div>
        <span className="flex-shrink mx-4 text-ink-400 text-[10px] uppercase font-mono tracking-wider">atau</span>
        <div className="flex-grow border-t border-paper-200"></div>
      </div>

      <div className="w-full flex justify-center">
        {googleLoading ? (
          <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono text-ink-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-moss-200 border-t-moss-700"></div>
            Menghubungkan ke Google...
          </div>
        ) : (
          <div id="google-signin-btn" className="w-full flex justify-center"></div>
        )}
      </div>

      <p className="text-center text-sm text-ink-400">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-moss-700 hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}

/**
 * Maps ApiError codes/statuses to user-friendly Indonesian messages.
 */
function getFriendlyErrorMessage(error: ApiError): string {
  // Rate limit: build a message using the user's own local time.
  if (error.status === 429) {
    return getRateLimitMessage(error);
  }

  // Server-provided message takes priority
  if (error.message && error.code !== "UNKNOWN_ERROR") {
    return error.message;
  }

  switch (error.status) {
    case 401:
      return "Email atau kata sandi salah. Periksa kembali dan coba lagi.";
    case 403:
      return "Akun kamu tidak memiliki akses. Hubungi dukungan jika ini keliru.";
    case 404:
      return "Akun dengan email ini tidak ditemukan. Pastikan email sudah benar.";
    case 429:
      return "Terlalu banyak percobaan login. Silakan coba lagi beberapa menit kemudian.";
    case 500:
    case 502:
    case 503:
      return "Server sedang bermasalah. Coba lagi dalam beberapa saat.";
    default:
      return error.message || "Terjadi kesalahan. Periksa koneksi dan coba lagi.";
  }
}

/**
 * Builds a rate-limit message in the user's *own* local time.
 *
 * The server sends raw timing (`resetAt` epoch ms + `retryAfterSec`) inside
 * `error.details`. We compute the remaining wait against the browser clock and
 * format the retry time with `toLocaleTimeString`, so the user always sees a
 * time in their real timezone instead of the server's UTC ISO string.
 */
function getRateLimitMessage(error: ApiError): string {
  const details = (error.details ?? {}) as { retryAfterSec?: number; resetAt?: number };

  // Prefer resetAt (absolute) so the countdown stays accurate if the message
  // is shown a little later; fall back to retryAfterSec, then a sane default.
  const resetAt =
    typeof details.resetAt === "number"
      ? details.resetAt
      : typeof details.retryAfterSec === "number"
        ? Date.now() + details.retryAfterSec * 1000
        : null;

  if (resetAt == null) {
    return "Terlalu banyak percobaan login. Silakan coba lagi beberapa menit kemudian.";
  }

  const remainingSec = Math.max(0, Math.round((resetAt - Date.now()) / 1000));

  let durationText: string;
  if (remainingSec >= 60) {
    const minutes = Math.ceil(remainingSec / 60);
    durationText = `sekitar ${minutes} menit lagi`;
  } else if (remainingSec > 0) {
    durationText = `sekitar ${remainingSec} detik lagi`;
  } else {
    durationText = "sekarang";
  }

  const clockText = new Date(resetAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `Terlalu banyak percobaan login. Coba lagi ${durationText} (pukul ${clockText}).`;
}
