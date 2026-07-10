"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const isLandingPage = pathname === "/";

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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileAccountOpen(false);
  }, [pathname]);

  if (isHidden) return null;

  const isTransparent = isLandingPage && !isScrolled;

  const navClass = isTransparent
    ? "absolute top-0 w-full z-50 bg-transparent py-6 transition-all duration-300"
    : "fixed top-0 w-full z-50 py-4 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200";

  const linkClass = isTransparent
    ? "text-white font-medium hover:text-[#fbbc04] transition-colors text-lg"
    : "text-ink-900 font-medium hover:text-[#fbbc04] transition-colors text-lg";

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    setIsMobileAccountOpen(false);
  }

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-main.png"
              alt="Ecolution Logo"
              width={140}
              height={45}
              className="object-contain"
            />
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────────── */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={linkClass}>Beranda</Link>
            <Link href="/marketplace" className={linkClass}>Marketplace</Link>
            <Link href="/challenge" className={linkClass}>Challenge</Link>
            <Link href="/rewards" className={linkClass}>Reward</Link>
            <Link href="/riwayat" className={linkClass}>Riwayat</Link>
            <Link href="/about" className={linkClass}>Tentang Kami</Link>
          </div>

          {/* ── Desktop Right Actions ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link
              href={user ? "/cart" : "/login?callbackUrl=/cart"}
              className={`p-2 rounded-full transition flex items-center justify-center ${isTransparent ? "text-white hover:bg-white/10 hover:text-[#fbbc04]" : "text-ink-900 hover:bg-paper-100 hover:text-[#fbbc04]"}`}
              title="Keranjang Belanja"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Desktop Profile Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`font-semibold text-sm font-mono flex items-center gap-1.5 focus:outline-none hover:opacity-80 transition ${isTransparent ? "text-white" : "text-ink-900"}`}
                >
                  Halo, {user.name}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 divide-y divide-gray-100">
                    <div className="px-4 py-2">
                      <p className="text-[10px] text-ink-400 font-mono">Masuk sebagai:</p>
                      <p className="text-sm font-bold text-ink-900 truncate">{user.name}</p>
                    </div>

                    <div className="py-1">
                      {user.role === "USER" && (
                        <Link
                          href="/dashboard"
                          onClick={() => { setActiveRole("USER"); setIsDropdownOpen(false); }}
                          className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                        >
                          Dashboard User
                        </Link>
                      )}
                      {user.role === "UMKM" && (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => { setActiveRole("USER"); setIsDropdownOpen(false); }}
                            className="block px-4 py-2 text-sm text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Dashboard User
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => { setActiveRole("UMKM"); setIsDropdownOpen(false); }}
                            className="block px-4 py-2 text-sm font-bold text-ink-700 hover:bg-paper-50 hover:text-moss-700"
                          >
                            Dashboard UMKM
                          </Link>
                        </>
                      )}
                      {user.role === "ADMIN" && (
                        <Link
                          href="/dashboard"
                          onClick={() => { setActiveRole("ADMIN"); setIsDropdownOpen(false); }}
                          className="block px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-paper-50 hover:text-moss-700"
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
              <div className="flex items-center gap-4">
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
          </div>

          {/* ── Mobile Right: Cart + Hamburger only ────────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            {/* Cart icon — always visible on mobile */}
            <Link
              href={user ? "/cart" : "/login?callbackUrl=/cart"}
              className={`p-2 rounded-full transition ${isTransparent ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-paper-100"}`}
              title="Keranjang Belanja"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg focus:outline-none transition ${isTransparent ? "text-white hover:bg-white/10" : "text-ink-900 hover:bg-paper-100"}`}
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMobileMenuOpen}
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

      {/* ── Mobile Drawer ────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-paper-200 shadow-lg z-40">
          {/* Nav links */}
          <div className="px-6 py-4 flex flex-col gap-1">
            <Link onClick={closeMobileMenu} href="/" className="py-2.5 text-sm font-semibold text-ink-800 hover:text-moss-700 border-b border-paper-100">Beranda</Link>
            <Link onClick={closeMobileMenu} href="/marketplace" className="py-2.5 text-sm font-semibold text-ink-800 hover:text-moss-700 border-b border-paper-100">Marketplace</Link>
            <Link onClick={closeMobileMenu} href="/challenge" className="py-2.5 text-sm font-semibold text-ink-800 hover:text-moss-700 border-b border-paper-100">Challenge</Link>
            <Link onClick={closeMobileMenu} href="/rewards" className="py-2.5 text-sm font-semibold text-ink-800 hover:text-moss-700 border-b border-paper-100">Reward</Link>
            <Link onClick={closeMobileMenu} href="/riwayat" className="py-2.5 text-sm font-semibold text-ink-800 hover:text-moss-700 border-b border-paper-100">Riwayat</Link>
            <Link onClick={closeMobileMenu} href="/about" className="py-2.5 text-sm font-semibold text-ink-800 hover:text-moss-700">Tentang Kami</Link>
          </div>

          {/* ── Account Section (mobile only) ────────────────────────────────── */}
          {user ? (
            <div className="border-t border-paper-200 px-6 py-3">
              {/* Expandable "Akun Saya" header */}
              <button
                onClick={() => setIsMobileAccountOpen(!isMobileAccountOpen)}
                className="flex w-full items-center justify-between py-2 text-sm font-bold text-ink-900"
              >
                <span className="flex items-center gap-2">
                  {/* Avatar initial */}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-moss-700 text-xs font-bold text-white uppercase">
                    {user.name.charAt(0)}
                  </span>
                  <span>Akun Saya</span>
                </span>
                <svg
                  className={`w-4 h-4 text-ink-400 transition-transform duration-200 ${isMobileAccountOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User info chip */}
              <p className="text-xs text-ink-400 font-mono pl-9 -mt-0.5 mb-1">{user.name}</p>

              {/* Collapsed/expanded account menu */}
              {isMobileAccountOpen && (
                <div className="mt-2 ml-9 flex flex-col gap-1">
                  {(user.role === "USER" || user.role === "UMKM") && (
                    <Link
                      href="/dashboard"
                      onClick={() => { setActiveRole("USER"); closeMobileMenu(); }}
                      className="py-2 text-sm text-ink-700 hover:text-moss-700 font-medium"
                    >
                      Dashboard User
                    </Link>
                  )}
                  {user.role === "UMKM" && (
                    <Link
                      href="/dashboard"
                      onClick={() => { setActiveRole("UMKM"); closeMobileMenu(); }}
                      className="py-2 text-sm font-bold text-ink-700 hover:text-moss-700"
                    >
                      Dashboard UMKM
                    </Link>
                  )}
                  {user.role === "ADMIN" && (
                    <Link
                      href="/dashboard"
                      onClick={() => { setActiveRole("ADMIN"); closeMobileMenu(); }}
                      className="py-2 text-sm font-semibold text-ink-700 hover:text-moss-700"
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  <button
                    onClick={() => { closeMobileMenu(); handleLogout(); }}
                    className="py-2 text-left text-sm font-medium text-rust-600 hover:text-rust-700"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest — show login/register buttons */
            <div className="border-t border-paper-200 px-6 py-4 flex gap-3">
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex-1 text-center py-2.5 rounded-xl border border-paper-200 font-bold text-ink-700 hover:bg-paper-50 text-sm"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                onClick={closeMobileMenu}
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
