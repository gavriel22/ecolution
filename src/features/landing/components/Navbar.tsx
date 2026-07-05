"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "@/features/auth/api";

export function Navbar() {
  const { user, logoutLocally } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    } finally {
      logoutLocally();
      window.location.href = "/";
    }
  };

  // Determine if we're on the landing page
  const isLandingPage = pathname === "/";

  // Hide Navbar on specific routes
  const isHidden = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/activity") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/merchant/products") ||
    pathname.startsWith("/merchant/orders") ||
    pathname.startsWith("/merchant/statistics") ||
    pathname.startsWith("/merchant/profile");

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
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`font-semibold text-sm font-mono flex items-center gap-1.5 focus:outline-none hover:opacity-80 transition ${
                    isTransparent ? "text-white" : "text-ink-900"
                  }`}
                >
                  Halo, {user.name}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 divide-y divide-gray-150">
                    <div className="px-4 py-2">
                      <p className="text-[10px] text-ink-400 font-mono">Masuk sebagai:</p>
                      <p className="text-sm font-bold text-ink-900 truncate">{user.name}</p>
                    </div>

                    <div className="py-1">
                      {user.role === "USER" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Dashboard User
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Profil
                          </Link>
                        </>
                      )}

                      {user.role === "UMKM" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700 font-medium"
                          >
                            Dashboard UMKM
                          </Link>
                          <Link
                            href="/login?callbackUrl=%2Fdashboard&loginMode=USER"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Dashboard User (Mode User)
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Profil User
                          </Link>
                          <Link
                            href="/merchant/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Profil Toko
                          </Link>
                        </>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700 font-semibold"
                        >
                          Dashboard Admin
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-rust-600 hover:bg-rust-50 hover:text-rust-700 font-medium"
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
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
