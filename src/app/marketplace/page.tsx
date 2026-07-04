import { Navbar } from "@/features/landing/components/Navbar";
import { Footer } from "@/features/landing/components/Footer";
import { MarketplacePreview } from "@/features/landing/components/MarketplacePreview";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-gray-900 font-sans">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h1 className="text-5xl font-bold text-[#2c3d25] tracking-tight">Eco Marketplace</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl">
            Explore our wide range of eco-friendly products. Earn points by recycling and redeem them for these sustainable essentials.
          </p>
        </div>
        <MarketplacePreview />
      </main>
      <Footer />
    </div>
  );
}
