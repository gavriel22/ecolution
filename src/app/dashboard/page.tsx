import { Navbar } from "@/features/landing/components/Navbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-gray-900 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
        <h1 className="text-3xl font-bold text-[#2c3d25] mb-6 tracking-tight">Dashboard Placeholder</h1>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#e6e8e0]">
          <p className="text-gray-600">This is a placeholder for the user dashboard. Backend integration will go here.</p>
        </div>
      </main>
    </div>
  );
}
