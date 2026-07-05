"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { logoutUser } from "@/features/auth/api";

export function Navbar() {
  const { user, logoutLocally, setActiveRole } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error(e);
    } finally {
      logoutLocally();
      window.location.replace("/");
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
              width={140}
              height={45}
              className="object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={linkClass}>Beranda</Link>
            <Link href="/marketplace" className={linkClass}>Marketplace</Link>
            <Link href="/challenge" className={linkClass}>Challenge</Link>
            <Link href="/rewards" className={linkClass}>Reward</Link>
            <Link href="/riwayat" className={linkClass}>Riwayat</Link>
            <Link href="/about" className={linkClass}>Tentang Kami</Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href={user ? "/cart" : "/login?callbackUrl=/cart"}
              className={`p-2 rounded-full transition flex items-center justify-center ${isTransparent ? "text-white hover:bg-white/10 hover:text-[#fbbc04]" : "text-ink-900 hover:bg-paper-100 hover:text-[#fbbc04]"}`}
              title="Keranjang Belanja"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Profile Dropdown */}
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
                        <Link
                          href="/dashboard"
                          onClick={() => {
                            setActiveRole("USER");
                            setIsDropdownOpen(false);
                          }}
                          className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                        >
                          Dashboard User
                        </Link>
                      )}

                      {user.role === "UMKM" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => {
                              setActiveRole("USER");
                              setIsDropdownOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Dashboard User
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => {
                              setActiveRole("UMKM");
                              setIsDropdownOpen(false);
                            }}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700 font-bold"
                          >
                            Dashboard UMKM
                          </Link>
                        </>
                      )}

                      {user.role === "ADMIN" && (
                        <Link
                          href="/dashboard"
                          onClick={() => {
                            setActiveRole("ADMIN");
                            setIsDropdownOpen(false);
                          }}
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
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href={pathname && pathname !== "/login" && pathname !== "/register" ? `/login?callbackUrl=${encodeURIComponent(pathname)}` : "/login"}
                  className={linkClass}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 rounded-full font-medium transition shadow-sm text-sm"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg focus:outline-none transition ${
                isTransparent ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-paper-100"
              }`}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-paper-200 shadow-lg px-6 py-5 space-y-4 absolute top-full left-0 w-full z-40 flex flex-col font-sans">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-ink-800 hover:text-moss-700 py-1.5 border-b border-paper-100">Beranda</Link>
          <Link href="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-ink-800 hover:text-moss-700 py-1.5 border-b border-paper-100">Marketplace</Link>
          <Link href="/challenge" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-ink-800 hover:text-moss-700 py-1.5 border-b border-paper-100">Challenge</Link>
          <Link href="/rewards" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-ink-800 hover:text-moss-700 py-1.5 border-b border-paper-100">Reward</Link>
          <Link href="/riwayat" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-ink-800 hover:text-moss-700 py-1.5 border-b border-paper-100">Riwayat</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-semibold text-ink-800 hover:text-moss-700 py-1.5 border-b border-paper-100">Tentang Kami</Link>
          <Link 
            href={user ? "/cart" : "/login?callbackUrl=/cart"} 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center gap-2 text-sm font-semibold text-ink-800 hover:text-moss-700 py-1.5 border-b border-paper-100"
          >
            Keranjang Belanja
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
          
          {!user && (
            <div className="flex gap-4 pt-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border border-paper-250 font-bold text-ink-700 hover:bg-paper-50 text-sm"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-[#fbbc04] font-bold text-gray-900 hover:bg-[#e3aa04] text-sm"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
