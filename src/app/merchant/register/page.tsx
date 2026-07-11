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

  const [existingMerchant, setExistingMerchant] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?callbackUrl=/merchant/register");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;

    apiFetch<{ merchant: any }>("/api/merchant/my")
      .then((res) => {
        if (res.data?.merchant) {
          setExistingMerchant(res.data.merchant);
          if (res.data.merchant.status === "APPROVED") {
            router.push("/merchant/products");
          }
        }
      })
      .catch((err) => {
        console.error("Gagal memeriksa status mitra:", err);
      })
      .finally(() => {
        setCheckingExisting(false);
      });
  }, [user, router]);

  if (isLoading || !user || checkingExisting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-50 font-body">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-moss-200 border-t-moss-700"></div>
          <p className="font-mono text-xs text-ink-400">Memeriksa status toko...</p>
        </div>
      </div>
    );
  }

  if (existingMerchant && existingMerchant.status === "PENDING") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-paper-200 bg-white p-6 sm:p-8 text-center shadow-md space-y-6">
          <div className="mx-auto w-16 h-16 bg-ochre-50 rounded-full flex items-center justify-center text-ochre-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-ink-900">
              Pendaftaran Toko Sedang Ditinjau
            </h1>
            <p className="text-sm text-ink-500 font-body leading-relaxed">
              Terima kasih telah mendaftar sebagai Mitra UMKM. Saat ini pendaftaran toko <span className="font-semibold text-moss-700">{existingMerchant.businessName}</span> sedang dalam proses verifikasi oleh administrator.
            </p>
            <p className="text-xs text-ink-400 font-body italic">
              Silakan periksa kembali halaman ini atau dashboard Anda secara berkala.
            </p>
          </div>

          <div className="pt-4 border-t border-paper-100 flex flex-col gap-2">
            <Link
              href="/"
              className="w-full rounded-md bg-moss-700 py-2.5 text-center text-sm font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (existingMerchant && existingMerchant.status === "SUSPENDED") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-paper-200 bg-white p-6 sm:p-8 text-center shadow-md space-y-6">
          <div className="mx-auto w-16 h-16 bg-rust-50 rounded-full flex items-center justify-center text-rust-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-rust-600">
              Toko Anda Ditangguhkan
            </h1>
            <p className="text-sm text-ink-500 font-body leading-relaxed">
              Toko <span className="font-semibold text-rust-600">{existingMerchant.businessName}</span> saat ini sedang ditangguhkan. Silakan hubungi administrator Ecolution untuk informasi lebih lanjut.
            </p>
          </div>

          <div className="pt-4 border-t border-paper-100 flex flex-col gap-2">
            <Link
              href="/"
              className="w-full rounded-md bg-moss-700 py-2.5 text-center text-sm font-semibold text-paper-50 hover:bg-moss-900 transition shadow-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
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
    <main className="flex min-h-screen bg-white">
      {/* Left Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-forest text-white p-12 flex-col justify-between overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="font-display text-5xl font-bold leading-tight w-full">
            Jadi Mitra UMKM dan Tumbuh Bersama Kami
          </h1>
        </div>
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1920&auto=format&fit=crop")' }} />
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative overflow-y-auto max-h-screen">
        {/* Mobile Back Button */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-2 text-ink-400 hover:text-ink-900 transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 mt-12 lg:mt-0 flex flex-col items-center text-center">
            <img src="/logo-main.png" alt="Ecolution" width={120} height={38} className="mb-4" />
            <h2 className="font-display text-2xl font-bold text-ink-900">Daftar Mitra UMKM</h2>
            <p className="text-sm text-ink-400 mt-1.5">Lengkapi informasi toko Anda untuk mulai menjual produk ramah lingkungan.</p>
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
              <label htmlFor="businessName" className="text-xs font-semibold text-ink-900">
                Nama Toko / Usaha <span className="text-rust-600">*</span>
              </label>
              <input
                id="businessName"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                placeholder="Masukkan Nama Toko Anda"
              />
            </div>

            {/* Deskripsi Toko */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-semibold text-ink-900">
                Deskripsi Toko
              </label>
              <textarea
                id="description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                placeholder="Ceritakan Singkat Mengenai Usaha Ramah Lingkungan Anda..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email Toko */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-ink-900">
                  Email Toko
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="Masukkan Email Toko"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-ink-900">
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
            </div>

            {/* Website & Logo Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="website" className="text-xs font-semibold text-ink-900">
                  Website <span className="font-normal text-ink-400">(opsional)</span>
                </label>
                <input
                  id="website"
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="tokoanda.com"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="logoUrl" className="text-xs font-semibold text-ink-900">
                  Logo Toko <span className="font-normal text-ink-400">(opsional)</span>
                </label>
                <input
                  id="logoUrl"
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full rounded-md border border-paper-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-moss-500 focus:ring-2 focus:ring-moss-500/20"
                  placeholder="URL logo.jpg"
                />
              </div>
            </div>

            {/* Alamat Toko */}
            <div className="space-y-1.5">
              <label htmlFor="address" className="text-xs font-semibold text-ink-900">
                Alamat Lengkap
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
              className="mt-6 flex w-full justify-center rounded-md bg-brand-forest py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitLoading ? "Mendaftarkan Toko..." : "Daftarkan UMKM"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
