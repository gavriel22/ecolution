"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useLogin } from "../hooks/use-login";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const callbackUrl = searchParams.get("callbackUrl");

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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
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
