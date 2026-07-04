"use client";

import Link from "next/link";
import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-white pt-20 pb-10 border-t border-[#e6e8e0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-6 group">
              <span className="font-[cursive] text-4xl text-[#2c3d25] font-bold italic group-hover:opacity-90 transition-opacity">Eco</span>
              <span className="font-sans text-xl text-gray-900 font-medium mt-2">lution</span>
            </Link>
            <p className="text-gray-600 leading-relaxed mb-6">
              Empowering communities to build sustainable habits through a rewarding eco-friendly ecosystem.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <a href="#" className="hover:text-[#2c3d25] transition-colors"><FaTwitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[#2c3d25] transition-colors"><FaInstagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-[#2c3d25] transition-colors"><FaFacebook className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold text-[#2c3d25] mb-6 text-lg">Platform</h4>
            <ul className="space-y-4 text-gray-600">
              <li><Link href="/" className="hover:text-[#fbbc04] transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-[#fbbc04] transition-colors">About Us</Link></li>
              <li><Link href="/marketplace" className="hover:text-[#fbbc04] transition-colors">Marketplace</Link></li>
              <li><Link href="/login" className="hover:text-[#fbbc04] transition-colors">Login</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-[#2c3d25] mb-6 text-lg">Stay Updated</h4>
            <p className="text-gray-600 mb-4">
              Get the latest updates on eco-challenges and new rewards.
            </p>
            <form className="flex gap-2 max-w-md">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-[#f0f2ec] border border-[#e6e8e0] text-gray-900 px-4 py-3 rounded-full focus:outline-none focus:border-[#2c3d25] w-full"
              />
              <button 
                type="submit"
                className="bg-[#fbbc04] text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-[#e3aa04] transition-colors whitespace-nowrap"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-[#e6e8e0] pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Ecolution. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}