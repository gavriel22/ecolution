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
        router.push("/");
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
    <form onSubmit={handleSubmit} className="w-full space-y-3.5">

      {errorMessage && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2 text-sm text-rust-600">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-brand-text-soft">
          Nama Lengkap
        </label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/20"
          placeholder="Masukkan Nama Lengkap Anda"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-brand-text-soft">
          Username
        </label>
        <input
          id="username"
          required
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          className="w-full rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/20"
          placeholder="Masukkan Username yang Anda Inginkan"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-brand-text-soft">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/20"
          placeholder="Masukkan Email Anda"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-brand-text-soft">
          Kata Sandi
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm text-brand-text outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/20"
          placeholder="Minimal 8 karakter"
        />
      </div>

      <button
        type="submit"
        disabled={register.isPending}
        className="w-full rounded-xl bg-brand-ink px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 shadow-sm mt-2"
      >
        {register.isPending ? "Memproses..." : "Buat Akun"}
      </button>

      <p className="text-center text-sm text-brand-text-soft">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-brand-text hover:underline">
          Masuk
        </Link>
      </p>

      {/* Google Login Button */}
      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-brand-line"></div>
        <span className="flex-shrink mx-4 text-brand-text-soft text-[10px] uppercase font-mono tracking-wider">Atau</span>
        <div className="flex-grow border-t border-brand-line"></div>
      </div>

      {/* Keep the button mounted; overlay a centered spinner while connecting. */}
      <div className="relative flex min-h-[40px] w-full items-center justify-center transition-colors">
        <div
          id="google-signup-btn"
          className={`flex w-full justify-center transition-opacity ${googleLoading ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
        >
          <button
            type="button"
            onClick={() => toast.error("Google Login belum dikonfigurasi (Client ID tidak ditemukan).")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-line bg-white px-4 py-3 font-semibold text-brand-text transition hover:bg-gray-50 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Daftar dengan Google
          </button>
        </div>
        {googleLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-moss border-t-brand-forest"></div>
          </div>
        )}
      </div>
    </form>
  );
}
