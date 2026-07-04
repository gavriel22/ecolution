import { Navbar } from "@/features/landing/components/Navbar";
import { Footer } from "@/features/landing/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-gray-900 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-[#2c3d25] tracking-tight">Our Story</h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl leading-relaxed">
          We believe that conscious consumption shouldn't be a luxury. Our mission is to make environmentally friendly products accessible, showing that they are not only as good as, but often superior to, traditional products.
        </p>
        <div className="grid md:grid-cols-2 gap-12 mt-16">
          <div className="bg-[#f0f2ec] p-8 rounded-[2rem]">
            <h2 className="text-3xl font-semibold mb-4 text-[#2c3d25]">Our Vision</h2>
            <p className="text-lg text-gray-700">
              A world where every household operates sustainably without compromising on quality or convenience. We envision a future where plastic waste is a thing of the past and natural materials rule.
            </p>
          </div>
          <div className="bg-[#f0f2ec] p-8 rounded-[2rem]">
            <h2 className="text-3xl font-semibold mb-4 text-[#2c3d25]">Our Mission</h2>
            <p className="text-lg text-gray-700">
              To empower communities by providing top-tier eco-friendly alternatives to everyday essentials. We aim to inspire a shift towards sustainable living one home at a time.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
