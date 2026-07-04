import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-green-600 -z-20"></div>

      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-green-500/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Ready to make a difference?
        </h2>
        <p className="text-xl text-green-50 mb-10 leading-relaxed max-w-2xl mx-auto">
          Join thousands of users who are already building sustainable habits and earning rewards. Your journey starts here.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 rounded-full font-bold text-lg bg-yellow-400 text-yellow-950 hover:bg-yellow-300 transition-all shadow-xl hover:shadow-yellow-400/40 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/merchant/register"
            className="px-8 py-4 rounded-full font-bold text-lg bg-transparent text-white border-2 border-green-400 hover:bg-green-500 transition-all flex items-center justify-center"
          >
            Become a Merchant
          </Link>
        </div>
      </div>
    </section>
  );
}
