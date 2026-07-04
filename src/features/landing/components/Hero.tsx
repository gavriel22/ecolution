export function Hero() {
  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: 'url("/landing.jpg")' }}>
      {/* Overlay to ensure text readability if needed, though design keeps it mostly natural */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-4">
        {/* Main Title */}
        <h1 className="text-center flex flex-col items-center drop-shadow-lg">
          <span className="font-[cursive] text-6xl md:text-8xl lg:text-[140px] text-[#fbbc04] font-medium leading-none -mb-8 lg:-mb-16 z-10" style={{ transform: 'rotate(-2deg)' }}>
            Buang sampah
          </span>
          <span className="font-sans text-5xl md:text-7xl lg:text-[110px] text-white font-normal tracking-tight">
            Bareng  Ecolution
          </span>
        </h1>

        {/* Floating Product Image Container */}
        <div className="mt-12 md:mt-16 lg:-mt-4 relative">
          <div className="w-[300px] h-[350px] md:w-[350px] md:h-[400px] lg:w-[400px] lg:h-[480px] bg-[#dfd6cb] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl relative z-20 mx-auto">
            <img
              src="https://images.unsplash.com/photo-1610419207601-a56f8fd4a565?q=80&w=1887&auto=format&fit=crop"
              alt="Eco friendly string bag with groceries"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Slider indicators below image */}
          <div className="flex justify-center gap-3 mt-8">
            <div className="w-12 h-1.5 bg-[#fbbc04] rounded-full"></div>
            <div className="w-12 h-1.5 bg-white/50 rounded-full"></div>
            <div className="w-12 h-1.5 bg-white/50 rounded-full"></div>
            <div className="w-12 h-1.5 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Bottom text blocks */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mt-16 pb-12 gap-8">
          <div className="max-w-sm text-white drop-shadow-md">
            <p className="text-lg md:text-xl font-medium leading-relaxed">
              Explore our store for an eco-friendly alternative to everyday essentials, personal care products, cleaning supplies, and home decor items.
            </p>
          </div>

          <div className="flex flex-col items-end gap-6 max-w-xs text-white drop-shadow-md">
            <p className="text-lg md:text-xl font-medium text-right leading-relaxed">
              Maintain a clean home without harming the planet
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-[#fbbc04] hover:bg-[#e3aa04] text-gray-900 rounded-full font-medium transition-colors text-lg">
                Shop now
              </button>
              <button className="px-8 py-3 bg-transparent border border-white hover:bg-white/10 text-white rounded-full font-medium transition-colors text-lg">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
