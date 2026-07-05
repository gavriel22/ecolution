"use client";

import { useState, type FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { apiFetch } from "@/lib/api-client";
import { Footer } from "@/features/landing/components/Footer";

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  
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
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-ink-900 font-sans">
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-4xl font-bold text-ink-900 tracking-tight">
                Pendaftaran Mitra UMKM
              </h1>
              <p className="font-body text-sm text-ink-400 mt-1">
                Lengkapi informasi toko atau usaha Anda untuk mulai mendaftarkan produk ramah lingkungan di Marketplace Ecolution.
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-md border border-rust-500/30 bg-rust-500/5 px-4 py-3 text-sm text-rust-600 font-body">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-md border border-moss-500/30 bg-moss-50 px-4 py-3 text-sm font-semibold text-moss-700 font-body">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-lg border border-paper-200 bg-white p-6 shadow-xs space-y-5 font-body">
              {/* Nama Toko */}
              <div className="space-y-1.5">
                <label htmlFor="businessName" className="text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Nama Toko / Usaha <span className="text-rust-600">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="Contoh: Eco-Friendly Shop"
                />
              </div>

              {/* Deskripsi Toko */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Deskripsi Toko
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="Ceritakan singkat mengenai usaha ramah lingkungan Anda..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Toko */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-ink-700">
                    Email Toko
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                    placeholder="emailtoko@example.com"
                  />
                </div>

                {/* Telepon Toko */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-ink-700">
                    Nomor Telepon Toko
                  </label>
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                    placeholder="081234567890"
                  />
                </div>
              </div>

              {/* Website Toko */}
              <div className="space-y-1.5">
                <label htmlFor="website" className="text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Website Toko
                </label>
                <input
                  id="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="https://tokoanda.com"
                />
              </div>

              {/* Logo Url */}
              <div className="space-y-1.5">
                <label htmlFor="logoUrl" className="text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Link URL Logo Toko
                </label>
                <input
                  id="logoUrl"
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="https://link-gambar.com/logo.jpg"
                />
              </div>

              {/* Alamat Toko */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wide text-ink-700">
                  Alamat Lengkap Toko
                </label>
                <textarea
                  id="address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="Tuliskan alamat fisik/toko Anda..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitLoading || !businessName}
                className="w-full rounded-md bg-moss-700 py-3 text-center text-sm font-semibold text-paper-50 hover:bg-moss-900 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {submitLoading ? "Mendaftarkan Toko..." : "Daftarkan Toko Saya"}
              </button>

              <div className="text-center pt-2">
                <Link href="/profile" className="text-xs font-semibold text-moss-700 hover:text-moss-900">
                  ← Kembali ke Profil
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
