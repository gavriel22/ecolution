import { Navbar } from "@/features/landing/components/Navbar";
import { Footer } from "@/features/landing/components/Footer";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-gray-900 font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-20">
        <div className="bg-white p-10 rounded-[2rem] shadow-sm max-w-md w-full mx-4 border border-[#e6e8e0]">
          <h1 className="text-3xl font-bold text-[#2c3d25] mb-6 text-center tracking-tight">Welcome Back</h1>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c3d25] bg-[#fbfbf9]" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2c3d25] bg-[#fbfbf9]" placeholder="••••••••" />
            </div>
            <button className="w-full bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 font-semibold py-3 rounded-xl transition-colors mt-4">
              Sign In
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account? <a href="#" className="text-[#2c3d25] font-semibold hover:underline">Sign up</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
