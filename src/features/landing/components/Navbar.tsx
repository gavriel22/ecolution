import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="absolute top-0 w-full z-50 bg-transparent py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-main.png"
              alt="Ecolution Logo"
              width={180}
              height={55}
              className="object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-12">
            <Link href="/" className="text-white font-medium hover:text-[#fbbc04] transition-colors text-lg">
              Beranda
            </Link>
            <Link href="/marketplace" className="text-white font-medium hover:text-[#fbbc04] transition-colors text-lg">
              Marketplace
            </Link>
            <Link href="/challenge" className="text-white font-medium hover:text-[#fbbc04] transition-colors text-lg">
              Challenge
            </Link>
            <Link href="/about" className="text-white font-medium hover:text-[#fbbc04] transition-colors text-lg">
              Tentang Kami
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-white font-medium hover:text-[#fbbc04] transition-colors text-lg"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 rounded-full font-medium transition-colors text-lg"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
