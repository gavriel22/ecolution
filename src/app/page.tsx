import { Hero } from "@/features/landing/components/Hero";
import { PlatformStats } from "@/features/landing/components/PlatformStats";
import { Features } from "@/features/landing/components/Features";
import { WeeklyChallenge } from "@/features/landing/components/WeeklyChallenge";
import { EcoChampions } from "@/features/landing/components/EcoChampions";
import { MarketplacePreview } from "@/features/landing/components/MarketplacePreview";
import { WhyRecycling } from "@/features/landing/components/WhyRecycling";
import { MissionCommunity } from "@/features/landing/components/MissionCommunity";
import { CTA } from "@/features/landing/components/CTA";
import { Footer } from "@/features/landing/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <PlatformStats />
        <Features />
        <WeeklyChallenge />
        <EcoChampions />
        <MarketplacePreview />
        <WhyRecycling />
        <MissionCommunity />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
