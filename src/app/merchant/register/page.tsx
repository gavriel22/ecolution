"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api-client";

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?callbackUrl=/merchant/register");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-50 font-body">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-moss-200 border-t-moss-700"></div>
          <p className="font-mono text-xs text-ink-400">Memeriksa akun...</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitLoading(true);

    try {
      await apiFetch("/api/merchant", {
        method: "POST",
        body: {
          businessName,
          description: description || null,
          logoUrl: logoUrl || null,
          address: address || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
        },
      });

      setSuccessMsg("Pendaftaran berhasil! Akun toko Anda sedang menunggu persetujuan dari administrator.");
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal melakukan pendaftaran. Silakan coba lagi.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-paper-200 bg-white p-6 sm:p-8 shadow-md">
        {/* Navigation Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-moss-700 hover:text-moss-900 transition-colors mb-5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Kembali ke Beranda
        </Link>

        {/* Heading */}
        <div className="space-y-1 mb-6">
          <h1 className="font-display text-2xl font-bold text-ink-900 tracking-tight">
            Daftar Menjadi Mitra UMKM
          </h1>
          <p className="text-sm text-ink-400">
            Lengkapi informasi toko Anda untuk mulai menjual produk ramah lingkungan di Marketplace Ecolution.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-3 py-2.5 text-sm text-rust-600 mb-4">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-md border border-moss-500/30 bg-moss-50 px-3 py-2.5 text-sm font-semibold text-moss-700 mb-4">
            {successMsg}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Toko */}
          <div className="space-y-1.5">
            <label htmlFor="businessName" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Nama Toko / Usaha <span className="text-rust-600">*</span>
            </label>
            <input
              id="businessName"
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="Contoh: Eco-Friendly Shop"
            />
          </div>

          {/* Deskripsi Toko */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Deskripsi Toko
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="Ceritakan singkat mengenai usaha ramah lingkungan Anda..."
            />
          </div>

          {/* Email Toko */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Email Toko
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="emailtoko@example.com"
            />
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Nomor Telepon
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="081234567890"
            />
          </div>

          {/* Website (opsional) */}
          <div className="space-y-1.5">
            <label htmlFor="website" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Website <span className="normal-case text-ink-400/70">(opsional)</span>
            </label>
            <input
              id="website"
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="https://tokoanda.com"
            />
          </div>

          {/* Logo Toko (opsional) */}
          <div className="space-y-1.5">
            <label htmlFor="logoUrl" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Logo Toko <span className="normal-case text-ink-400/70">(opsional)</span>
            </label>
            <input
              id="logoUrl"
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="https://link-gambar.com/logo.jpg"
            />
          </div>

          {/* Alamat Toko */}
          <div className="space-y-1.5">
            <label htmlFor="address" className="text-xs font-medium uppercase tracking-wide text-ink-400">
              Alamat Lengkap Toko
            </label>
            <textarea
              id="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
              placeholder="Tuliskan alamat fisik/toko Anda..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitLoading || !businessName}
            className="w-full rounded-md bg-moss-700 py-2.5 text-center text-sm font-semibold text-paper-50 hover:bg-moss-900 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
          >
            {submitLoading ? "Mendaftarkan Toko..." : "Daftarkan UMKM"}
          </button>
        </form>
      </div>
    </main>
  );
}
