<<<<<<< HEAD
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-400 p-3 rounded-xl">
            <Leaf className="w-8 h-8 text-yellow-950" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Join Ecolution</h2>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-yellow-500" placeholder="••••••••" />
          </div>
          
          <button type="button" className="w-full py-3 bg-yellow-400 text-yellow-950 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-sm">
            Create Account (Placeholder)
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account? <Link href="/login" className="text-yellow-700 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
=======
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper-50 px-4">
      <RegisterForm />
    </main>
>>>>>>> 61b3f5a5b82009e1ec9ccaddd8cbe8af1049357e
  );
}
