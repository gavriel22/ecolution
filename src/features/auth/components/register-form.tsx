"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister } from "../hooks/use-register";
import { ApiError, apiFetch } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const { user, isLoading, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleCredentialResponse(response: any) {
    setGoogleLoading(true);
    try {
      const res = await apiFetch<any>("/api/auth/google", {
        method: "POST",
        body: { idToken: response.credential },
      });

      setUser(res.data.user);

      toast.success("Daftar Google berhasil, mengalihkan...", {
        duration: 2000,
        position: "top-center",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (error: any) {
      toast.error(error.message || "Gagal mendaftar menggunakan Google", {
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
            const container = document.getElementById("google-signup-btn");
            // Derive width from the container so the button never overflows on
            // narrow phones (Google caps the width at 400px).
            const width = Math.min(400, Math.max(200, container?.clientWidth || 320));

            google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "large",
              width,
              text: "signup_with",
              shape: "rectangular",
            });
          }
        });
      })
      .catch((err) => {
        console.error("Failed to load Google client ID config", err);
      });
  }, [user, isLoading]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate(form, {
      onSuccess: () => router.push("/login?registered=1"),
    });
  }

  const errorMessage =
    register.error instanceof ApiError
      ? register.error.message
      : register.error
      ? "Registrasi gagal. Coba lagi."
      : null;

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
        <h1 className="font-display text-3xl font-semibold text-ink-900">Daftar</h1>
        <p className="text-sm text-ink-400">Mulai catat aksi ramah lingkunganmu.</p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2 text-sm text-rust-600">
          {errorMessage}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Nama Lengkap
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
          placeholder="Nama kamu"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="username" className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Username
        </label>
        <input
          id="username"
          required
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
          placeholder="username_unik"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
          placeholder="kamu@email.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Kata Sandi
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
          placeholder="Minimal 8 karakter"
        />
      </div>

      <button
        type="submit"
        disabled={register.isPending}
        className="w-full rounded-md bg-moss-700 px-4 py-2.5 font-medium text-paper-50 transition hover:bg-moss-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {register.isPending ? "Memproses..." : "Buat Akun"}
      </button>

      {/* Google Login Button */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-paper-200"></div>
        <span className="flex-shrink mx-4 text-ink-400 text-[10px] uppercase font-mono tracking-wider">atau</span>
        <div className="flex-grow border-t border-paper-200"></div>
      </div>

      {/* Keep the button mounted; overlay a centered spinner while connecting. */}
      <div className="relative flex min-h-[40px] w-full items-center justify-center">
        <div
          id="google-signup-btn"
          className={`flex w-full justify-center transition-opacity ${
            googleLoading ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        ></div>
        {googleLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-moss-200 border-t-moss-700"></div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-ink-400">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-moss-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
