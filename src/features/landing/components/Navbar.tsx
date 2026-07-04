import Link from "next/link";
import { Search, User, Heart, ShoppingBag } from "lucide-react";
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
            <Link href="/about" className="text-white font-medium hover:text-[#fbbc04] transition-colors text-lg">
              Tentang Kami
            </Link>
            <Link href="/login" className="text-white font-medium hover:text-[#fbbc04] transition-colors text-lg">
              Login
            </Link>
          </div>


          <div className="flex items-center space-x-6 text-white">
            <button className="hover:text-[#fbbc04] transition-colors"><Search className="w-6 h-6" /></button>
            <Link href="/login" className="hover:text-[#fbbc04] transition-colors"><User className="w-6 h-6" /></Link>
            <button className="hover:text-[#fbbc04] transition-colors"><Heart className="w-6 h-6" /></button>
            <button className="hover:text-[#fbbc04] transition-colors"><ShoppingBag className="w-6 h-6" /></button>
          </div>
        </div>
      </div>
    </nav>
  );
}
