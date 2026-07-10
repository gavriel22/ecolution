"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegister } from "../hooks/use-register";
import { ApiError } from "@/lib/api-client";

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });

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

      <p className="text-center text-sm text-ink-400">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-moss-700 hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}
