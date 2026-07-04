<<<<<<< HEAD
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
=======
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/activity");
>>>>>>> 61b3f5a5b82009e1ec9ccaddd8cbe8af1049357e
}
