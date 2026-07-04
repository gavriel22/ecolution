"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogin } from "../hooks/use-login";
import { ApiError } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => router.push("/activity") }
    );
  }

  const errorMessage =
    login.error instanceof ApiError ? login.error.message : login.error ? "Login gagal. Coba lagi." : null;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Masuk</h1>
        <p className="text-sm text-ink-400">Lanjutkan aksi lingkunganmu di Ecolution.</p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2 text-sm text-rust-600">
          {errorMessage}
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
          onChange={(e) => setEmail(e.target.value)}
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={login.isPending}
        className="w-full rounded-md bg-moss-700 px-4 py-2.5 font-medium text-paper-50 transition hover:bg-moss-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {login.isPending ? "Memproses..." : "Masuk"}
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
