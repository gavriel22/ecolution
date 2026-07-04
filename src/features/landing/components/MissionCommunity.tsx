export function MissionCommunity() {
  return (
    <section className="bg-white">
      {/* Mission Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="font-[cursive] text-6xl md:text-8xl text-gray-900 mb-12 italic tracking-tight">Our mission</h2>
        <p className="text-2xl md:text-4xl text-gray-800 leading-snug font-light">
          We want to <span className="text-[#849a64]">help</span> people <span className="text-[#849a64]">understand</span><br />
          the importance of <span className="text-[#849a64]">conscious consumption</span><br />
          and show that <span className="text-[#849a64]">environmentally friendly</span><br />
          products are not only as <span className="text-[#849a64]">good</span> as, but in many<br />
          ways <span className="text-[#849a64]">superior</span> to, traditional products
        </p>
      </div>

      {/* Community Section */}
      <div className="relative w-full h-[600px] md:h-[800px] bg-cover bg-center overflow-hidden flex flex-col items-center justify-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop")' }}>
        
        {/* Images Grid */}
        <div className="absolute top-0 w-full flex justify-center items-end gap-6 h-[40%] -mt-10 md:mt-0 px-4">
          <div className="w-[180px] h-[240px] md:w-[240px] md:h-[320px] rounded-[40px] overflow-hidden shadow-xl mb-12 hidden md:block">
            <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1913&auto=format&fit=crop" alt="Eco lifestyle" className="w-full h-full object-cover" />
          </div>
          <div className="w-[200px] h-[260px] md:w-[280px] md:h-[360px] rounded-[40px] overflow-hidden shadow-xl z-10 border-4 border-white">
            <img src="https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=2070&auto=format&fit=crop" alt="Tree planting" className="w-full h-full object-cover" />
          </div>
          <div className="w-[200px] h-[260px] md:w-[280px] md:h-[360px] rounded-[40px] overflow-hidden shadow-xl z-10 border-4 border-white mb-8">
            <img src="https://images.unsplash.com/photo-1594705574514-99884c98f828?q=80&w=2070&auto=format&fit=crop" alt="Community cleanup" className="w-full h-full object-cover" />
          </div>
          <div className="w-[180px] h-[240px] md:w-[240px] md:h-[320px] rounded-[40px] overflow-hidden shadow-xl mb-16 hidden lg:block border-4 border-white">
            <img src="https://images.unsplash.com/photo-1587841103046-e55d642b58ea?q=80&w=1969&auto=format&fit=crop" alt="Eco products" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Community Text & Button */}
        <div className="relative z-20 flex flex-col items-center mt-32 md:mt-48 text-center px-4 max-w-2xl mx-auto">
          <h2 className="flex flex-col items-center drop-shadow-md">
            <span className="font-[cursive] text-6xl md:text-8xl text-[#fbbc04] font-medium leading-none -mb-6 md:-mb-10" style={{ transform: 'rotate(-2deg)' }}>
              Joining
            </span>
            <span className="font-sans text-5xl md:text-7xl text-white font-normal tracking-tight">
              Our community
            </span>
          </h2>
          <p className="mt-10 text-white font-medium drop-shadow-md leading-relaxed text-sm md:text-base">
            «Your impact» is not just a store, but a vibrant community of<br className="hidden md:block"/>
            like-minded people who love to share their experience and<br className="hidden md:block"/>
            participate in joint projects aimed at preserving the<br className="hidden md:block"/>
            environment
          </p>
          <button className="mt-8 px-10 py-3 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 rounded-full font-medium transition-colors shadow-lg">
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}
