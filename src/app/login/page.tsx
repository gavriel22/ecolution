import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-50 px-4 py-8 sm:px-6">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-moss-200 border-t-moss-700"></div>
          <p className="font-mono text-xs text-ink-400">Memuat halaman masuk...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  );
}
