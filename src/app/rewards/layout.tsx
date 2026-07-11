import { Footer } from "@/features/landing/components/Footer";

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
