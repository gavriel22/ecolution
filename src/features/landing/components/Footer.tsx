"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";

export function Footer() {
  const pathname = usePathname();
  const loginHref = pathname && pathname !== "/login" && pathname !== "/register"
    ? `/login?callbackUrl=${encodeURIComponent(pathname)}`
    : "/login";

  return (
    <footer className="bg-white pt-20 pb-10 border-t border-[#e6e8e0] font-body">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Contacts */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="font-[cursive] text-4xl text-[#2c3d25] font-bold italic group-hover:opacity-90 transition-opacity">Eco</span>
              <span className="font-sans text-xl text-gray-900 font-medium mt-2">lution</span>
            </Link>
            <p className="text-gray-600 leading-relaxed text-sm">
              Mengubah kebiasaan masyarakat dalam pengelolaan sampah menjadi aksi bernilai ekonomi sirkular melalui sistem gamifikasi dan penghargaan terintegrasi.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2.5">
                <FaEnvelope className="text-moss-700 w-4 h-4" />
                <a href="mailto:info@ecolution.id" className="hover:text-[#fbbc04] transition-colors">info@ecolution.id</a>
              </div>
              <div className="flex items-center gap-2.5">
                <FaWhatsapp className="text-moss-700 w-4 h-4" />
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-[#fbbc04] transition-colors">+62 812-3456-7890</a>
              </div>
              <div className="flex items-center gap-2.5">
                <FaInstagram className="text-moss-700 w-4 h-4" />
                <a href="https://instagram.com/ecolution.id" target="_blank" rel="noopener noreferrer" className="hover:text-[#fbbc04] transition-colors">@ecolution.id</a>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-bold text-[#2c3d25] mb-6 text-lg">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-[#fbbc04] transition-colors">Beranda</Link></li>
              <li><Link href="/about" className="hover:text-[#fbbc04] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/marketplace" className="hover:text-[#fbbc04] transition-colors">Marketplace</Link></li>
              <li><Link href="/challenge" className="hover:text-[#fbbc04] transition-colors">Challenge</Link></li>
              <li><Link href="/faq" className="hover:text-[#fbbc04] transition-colors">FAQ / Bantuan</Link></li>
            </ul>
          </div>

          {/* Account & Information */}
          <div>
            <h4 className="font-bold text-[#2c3d25] mb-6 text-lg">Keanggotaan</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href={loginHref} className="hover:text-[#fbbc04] transition-colors">Masuk Akun</Link></li>
              <li><Link href="/register" className="hover:text-[#fbbc04] transition-colors">Daftar Baru</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#fbbc04] transition-colors">Dashboard Privat</Link></li>
            </ul>
          </div>

          {/* Legal Information */}
          <div>
            <h4 className="font-bold text-[#2c3d25] mb-6 text-lg">Kebijakan & Ketentuan</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/privacy-policy" className="hover:text-[#fbbc04] transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-[#fbbc04] transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/contact" className="hover:text-[#fbbc04] transition-colors">Hubungi Kami</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-[#e6e8e0] pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} Ecolution. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}