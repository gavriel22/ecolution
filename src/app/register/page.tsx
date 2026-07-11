import { RegisterForm } from "@/features/auth/components/register-form";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
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
            Mulai Perjalanan Ramah Lingkunganmu.
          </h1>
        </div>
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1920&auto=format&fit=crop")' }} />
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative overflow-y-auto">
        {/* Mobile Back Button */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-2 text-ink-400 hover:text-ink-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-6 mt-12 lg:mt-0 flex flex-col items-center text-center">
            <Image src="/logo-main.png" alt="Ecolution" width={120} height={38} className="mb-4" />
            <h2 className="font-display text-2xl font-bold text-ink-900">Buat Akun Anda</h2>
            <p className="text-sm text-ink-400 mt-1.5">Bergabunglah dan mulai catat aksi lingkunganmu.</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
