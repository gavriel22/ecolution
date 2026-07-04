import { Footer } from "@/features/landing/components/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fbfbf9] text-ink-900 font-sans flex flex-col">
      <main className="flex-1 pb-20">

        {/* Section 1: Hero */}
        <section className="relative pt-40 pb-24 px-4 bg-moss-900 text-white overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          </div>
          <div className="max-w-7xl mx-auto relative z-10 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight font-display">
              Tentang <span className="text-[#fbbc04]">Ecolution</span>
            </h1>

          </div>
        </section>

        {/* Section 2: Overview */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-moss-800 mb-8 font-display">
              Cerita Kami
            </h2>
            <p className="text-lg md:text-xl text-ink-600 leading-relaxed font-body">
              Ecolution adalah platform yang mengubah kebiasaan kecil menjadi dampak besar bagi lingkungan.
              Kami hadir untuk mendorong setiap orang agar lebih peduli terhadap sampah dan mulai membiasakan diri melakukan daur ulang dalam kehidupan sehari-hari.
            </p>
          </div>
        </section>

        {/* Section 3: Vision & Mission (Ref 2 Style) */}
        <section className="py-24 px-4 bg-[#f0f2ec]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image side - rounded, beautiful */}
              <div className="relative h-[400px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop"
                  alt="Sustainable future"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 right-6 bg-moss-500 w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* Content side */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold text-moss-900 mb-4 font-display">
                    Visi, Misi, & Nilai Kami
                  </h2>
                  <p className="text-ink-500 font-body text-lg">
                    Pelajari komitmen kami terhadap keunggulan, inovasi, dan prinsip-prinsip yang memandu pekerjaan kami setiap hari.
                  </p>
                </div>

                <div className="bg-moss-800 rounded-[2.5rem] p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-moss-600 rounded-bl-full opacity-20"></div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <span className="text-moss-300 font-bold tracking-wider text-sm uppercase">Nilai Inti</span>
                    <svg className="w-8 h-8 text-moss-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z" />
                    </svg>
                  </div>

                  <div className="space-y-6 relative z-10 font-body text-paper-50/90 text-sm md:text-base leading-relaxed">
                    <p>
                      Kami percaya pada kekuatan kolaborasi dan kreativitas. Dengan bermitra erat bersama klien dan komunitas, kami mendapatkan pemahaman mendalam mengenai kebutuhan dan tujuan unik mereka, memungkinkan kami menghadirkan solusi yang disesuaikan dan benar-benar membawa perubahan.
                    </p>
                    <p>
                      Menjadi penggerak ekosistem digital yang mengonversi perilaku ramah
                      lingkungan menjadi nilai ekonomi secara bertanggung jawab melalui
                      pemberdayaan UMKM dan inovasi berbasis teknologi.
                    </p>
                    <p>
                      Misi kami adalah memberdayakan masyarakat dengan menyediakan alternatif produk ramah lingkungan kelas atas untuk kebutuhan sehari-hari. Kami bertujuan untuk menginspirasi peralihan menuju kehidupan yang berkelanjutan, dimulai dari satu rumah pada satu waktu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Founders (Ref 1 Style) */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-center text-moss-900 mb-20 font-display tracking-tight">
              Dibalik <span className="border-b-4 border-moss-500 pb-2">Ecolution</span>
            </h2>

            <div className="space-y-32">
              {/* Founder 1 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 flex items-start gap-6">
                  <span className="text-6xl md:text-8xl font-bold text-ink-900 leading-none">01</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4 font-display">Felicia Wijaya</h3>
                    <p className="text-ink-600 font-body leading-relaxed text-sm md:text-base">
                      Seorang <span className="border-b border-ink-300 pb-0.5 text-ink-800">arsitek ternama</span> yang didorong oleh visi untuk mengurasi properti dan produk luar biasa yang sesuai dengan beragam kebutuhan klien. Keahlian Viktor dalam desain dan keberlanjutan memastikan bahwa setiap produk mewujudkan standar keunggulan tertinggi.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-square w-full max-w-[400px] mx-auto bg-paper-100 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
                      alt="Viktor Sanjaya"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Founder 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 flex items-start gap-6">
                  <span className="text-6xl md:text-8xl font-bold text-ink-900 leading-none">02</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4 font-display">Sophia Gusta</h3>
                    <p className="text-ink-600 font-body leading-relaxed text-sm md:text-base">
                      Seorang <span className="border-b border-ink-300 pb-0.5 text-ink-800">pakar pemasaran</span> berpengalaman, merupakan kekuatan pendorong di balik Ecolution. Memanfaatkan keahliannya dalam bercerita dan komunikasi, Sophia memastikan bahwa kami tampil menonjol sebagai penasihat terpercaya bagi pelanggan.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-square w-full max-w-[400px] mx-auto bg-paper-100 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                      alt="Sophia Gusta"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>

              {/* Founder 3 */}
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                <div className="w-full md:w-1/2 flex items-start gap-6">
                  <span className="text-6xl md:text-8xl font-bold text-ink-900 leading-none">03</span>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-moss-900 mb-4 font-display">Yrdn</h3>
                    <p className="text-ink-600 font-body leading-relaxed text-sm md:text-base">
                      Seorang <span className="border-b border-ink-300 pb-0.5 text-ink-800">arsitek ternama</span> yang didorong oleh visi untuk mengurasi properti dan produk luar biasa yang sesuai dengan beragam kebutuhan klien. Keahlian Viktor dalam desain dan keberlanjutan memastikan bahwa setiap produk mewujudkan standar keunggulan tertinggi.
                    </p>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="relative aspect-square w-full max-w-[400px] mx-auto bg-paper-100 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
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
