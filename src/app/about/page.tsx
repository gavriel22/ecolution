import { Footer } from "@/features/landing/components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-brand-ink font-sans flex flex-col">
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left Column */}
          <div className="flex flex-col">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 font-display text-brand-forest">
              Tentang <span className="text-[#fbbc04] border-b-4 border-brand-forest pb-2">Ecolution</span>
            </h1>

            <div className="text-brand-text-soft text-base md:text-lg leading-relaxed mb-12 space-y-6">
              <p>
                Ecolution adalah platform gamifikasi yang mendorong kebiasaan daur ulang dan kepedulian terhadap sampah. Terintegrasi dengan marketplace UMKM, kami menciptakan ekosistem yang memberi dampak nyata bagi lingkungan dan masyarakat.
              </p>

            </div>

            <div className="relative w-full h-[400px] md:h-[500px] mt-12 lg:mt-16">
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop"
                  alt="Sustainable lifestyle"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Optional decorative cutout/shape resembling the reference design could be added here, 
                  but a clean rounded rectangle fits modern SaaS perfectly. */}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col justify-center space-y-16">

            {/* Section 1: Values */}
            <section>
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 font-display text-brand-forest">
                Nilai Inti
              </h2>
              <p className="text-brand-text-soft leading-relaxed">
                Kami percaya bahwa perubahan besar dimulai dari langkah kecil. Melalui kolaborasi dan aksi nyata, kami mendorong masyarakat untuk berkontribusi dalam menjaga lingkungan sekaligus memberdayakan komunitas lokal secara berkelanjutan.
              </p>
            </section>

            {/* Section 2: Vision */}
            <section>
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 font-display text-brand-forest">
                Visi
              </h2>
              <p className="text-brand-text-soft leading-relaxed">
                Menjadi penggerak ekosistem digital yang mengonversi perilaku ramah
                lingkungan menjadi nilai ekonomi secara bertanggung jawab melalui
                pemberdayaan UMKM dan inovasi berbasis teknologi.
              </p>
            </section>

            {/* Section 3: Mission */}
            <section>
              <h2 className="text-2xl font-bold uppercase tracking-wide mb-4 font-display text-brand-forest">
                Misi
              </h2>
              <ul className="space-y-4 text-brand-text-soft leading-relaxed">
                <li className="flex items-start">
                  <span className="mr-3 font-bold text-brand-forest">1. </span>
                  <span>Memberdayakan UMKM Indonesia, khususnya di bidang pengolahan
                    limbah plastik, melalui akses pasar digital yang lebih luas dan terintegrasi.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold text-brand-forest">2. </span>
                  <span>Menghadirkan solusi inovatif berbasis teknologi untuk mengatasi
                    permasalahan pengelolaan sampah plastik dengan menghubungkan
                    aktivitas ramah lingkungan dengan nilai ekonomi.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold text-brand-forest">3. </span>
                  <span>Mendorong keterlibatan aktif masyarakat dalam pengelolaan lingkungan
                    melalui sistem interaktif yang mengapresiasi setiap kontribusi nyata.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold text-brand-forest">4. </span>
                  <span>Menggerakkan pertumbuhan ekonomi berkelanjutan dengan menciptakan
                    ekosistem yang menghubungkan masyarakat, UMKM, dan produk daur
                    ulang dalam satu platform.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 font-bold text-brand-forest">5. </span>
                  <span>Membangun kesadaran kolektif terhadap pentingnya pengelolaan limbah
                    dan konsumsi bertanggung jawab sebagai bagian dari gaya hidup modern.</span>
                </li>
              </ul>
            </section>

          </div>
        </div>

        {/* Section: Founders (Dibalik Ecolution) */}
        <section className="py-24 mt-24 border-t border-brand-line">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-brand-forest mb-20 font-display tracking-tight">
              Dibalik <span className="text-[#fbbc04] border-b-4 border-brand-forest pb-2">Ecolution</span>
            </h2>

            <div className="space-y-20">
              {/* Founder 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 flex items-start gap-6">
                  <span className="text-6xl md:text-8xl font-bold text-brand-text-soft opacity-20 leading-none">01</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-brand-forest mb-4 font-display">Felicia Wijaya</h3>
                    <p className="text-brand-text-soft font-body leading-relaxed text-sm md:text-base">
                      <a href="mailto:feliciawijaya1910@gmail.com" className="hover:text-brand-forest hover:underline transition-colors">feliciawijaya1910@gmail.com</a>
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-brand-paper overflow-hidden">
                    <Image
                      src="/felicia.jpg"
                      alt="Felicia Wijaya"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Founder 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 flex items-start gap-6">
                  <span className="text-6xl md:text-8xl font-bold text-brand-text-soft opacity-20 leading-none">02</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-brand-forest mb-4 font-display">Gavriel Theofilus</h3>
                    <p className="text-brand-text-soft font-body leading-relaxed text-sm md:text-base">
                      <a href="mailto:theofilus1777@gmail.com" className="hover:text-brand-forest hover:underline transition-colors">theofilus1777@gmail.com</a>
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-brand-paper overflow-hidden">
                    <Image
                      src="/gavriel.jpeg"
                      alt="Gavriel Theofilus"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Founder 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                <div className="w-full md:w-1/2 flex items-start gap-6">
                  <span className="text-6xl md:text-8xl font-bold text-brand-text-soft opacity-20 leading-none">03</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-brand-forest mb-4 font-display">Sbstn Yrdn</h3>
                    <p className="text-brand-text-soft font-body leading-relaxed text-sm md:text-base">
                      <a href="mailto:sebastianyordanpratama@gmail.com" className="hover:text-brand-forest hover:underline transition-colors">sebastianyordanpratama@gmail.com</a>
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-square w-full max-w-[300px] mx-auto bg-brand-paper overflow-hidden">
                    <Image
                      src="/yrdn.jpeg"
                      alt="yrdn"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
