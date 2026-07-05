"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLogout } from "@/features/auth/hooks/use-logout";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if user is not logged in and not loading
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-moss-200 border-t-moss-700"></div>
          <p className="font-mono text-xs text-ink-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  let menuItems: { label: string; href: string }[] = [];

  if (user.role === "ADMIN") {
    menuItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Verifikasi Aktivitas", href: "/admin/activity" },
      { label: "Kelola Challenge", href: "/admin/challenge" },
      { label: "Kelola Kategori", href: "/admin/category" },
      { label: "Profil", href: "/profile" },
    ];
  } else if (user.role === "UMKM") {
    menuItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Kelola Produk", href: "/merchant/products" },
      { label: "Profil", href: "/profile" },
    ];
  } else {
    menuItems = [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Aktivitasku", href: "/activity" },
      { label: "Lapor Aktivitas", href: "/activity/new" },
      { label: "Profil", href: "/profile" },
    ];
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "UMKM":
        return "UMKM";
      default:
        return "User";
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rust-500 text-paper-50";
      case "UMKM":
        return "bg-ochre-500 text-ink-900";
      default:
        return "bg-moss-700 text-paper-50";
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-paper-50 font-body">
      {/* Mobile Top Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-paper-200 bg-white px-6 md:hidden">
        <Link href="/dashboard" className="font-display text-2xl font-bold text-moss-700">
          Ecolution
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="rounded-md p-2 text-ink-700 hover:bg-paper-100 hover:text-moss-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Sidebar Layout */}
      <aside
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-paper-200 bg-white p-6 transition-transform duration-300 md:static md:translate-x-0 md:z-0`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="hidden md:block">
            <Link href="/dashboard" className="font-display text-3xl font-bold text-moss-700 tracking-tight">
              Ecolution
            </Link>
            <p className="font-mono text-[10px] text-ink-400 uppercase tracking-widest mt-1">Act & Earn Rewards</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              className="flex h-10 items-center rounded-md text-sm font-semibold text-moss-700 hover:bg-moss-50 pl-4 mb-1 transition-all duration-200"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Landing Page
            </Link>
            <div className="border-b border-paper-100 mb-2"></div>
            {menuItems.map((item) => {
              // Exact match or prefix match for subpaths (e.g. /activity/new starts with /activity)
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 items-center rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-moss-50 text-moss-700 font-semibold border-l-4 border-moss-700 pl-3"
                      : "text-ink-700 hover:bg-paper-50 hover:text-moss-700 pl-4"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info / Profile & Logout */}
        <div className="border-t border-paper-100 pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-200 text-ink-900 font-display font-semibold text-lg uppercase shadow-xs">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900 leading-tight">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-block rounded-xs px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeClass(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
                <span className="font-mono text-[10px] text-ink-400">
                  {user.totalPoint} pts
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-paper-200 bg-white py-2 text-xs font-semibold text-rust-600 transition hover:bg-paper-50 hover:text-rust-700 disabled:opacity-50"
          >
            {logoutMutation.isPending ? (
              <span>Logging out...</span>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar Akun</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10 overflow-y-auto">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
