"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Determine if we're on the landing page
  const isLandingPage = pathname === "/";

  // Hide Navbar on specific routes
  const isHidden = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/merchant");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isHidden) return null;

  // Determine styles based on route and scroll state
  const isTransparent = isLandingPage && !isScrolled;

  const navClass = isTransparent
    ? "absolute top-0 w-full z-50 bg-transparent py-6 transition-all duration-300"
    : "fixed top-0 w-full z-50 py-4 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200";

  const linkClass = isTransparent
    ? "text-white font-medium hover:text-[#fbbc04] transition-colors text-lg"
    : "text-ink-900 font-medium hover:text-[#fbbc04] transition-colors text-lg";

  return (
    <nav className={navClass}>
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
            <Link href="/" className={linkClass}>Beranda</Link>
            <Link href="/marketplace" className={linkClass}>Marketplace</Link>
            <Link href="/challenge" className={linkClass}>Challenge</Link>
            <Link href="/about" className={linkClass}>Tentang Kami</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className={`hidden sm:inline font-medium text-sm font-mono ${isTransparent ? 'text-white' : 'text-ink-900'}`}>
                  Halo, {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 bg-moss-700 hover:bg-moss-900 border border-moss-600 text-paper-50 rounded-full font-medium transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href={pathname && pathname !== "/login" && pathname !== "/register" ? `/login?callbackUrl=${encodeURIComponent(pathname)}` : "/login"}
                  className={linkClass}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 rounded-full font-medium transition-colors text-lg shadow-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
