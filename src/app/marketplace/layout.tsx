import { Navbar } from "@/features/landing/components/Navbar";
import { Footer } from "@/features/landing/components/Footer";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
