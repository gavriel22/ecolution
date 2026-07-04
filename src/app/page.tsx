import { Navbar } from "@/features/landing/components/Navbar";
import { Hero } from "@/features/landing/components/Hero";
import { MarketplacePreview } from "@/features/landing/components/MarketplacePreview";
import { MissionCommunity } from "@/features/landing/components/MissionCommunity";
import { Footer } from "@/features/landing/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <MarketplacePreview />
        <MissionCommunity />
      </main>
      <Footer />
    </div>
  );
}
