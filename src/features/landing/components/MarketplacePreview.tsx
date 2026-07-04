import { Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

export function MarketplacePreview() {
  const products = [
    {
      id: 1,
      name: "Dish brush",
      price: "10$",
      image: "https://images.unsplash.com/photo-1596568916388-3ef0b79ec508?q=80&w=2080&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "String bag",
      price: "2$",
      image: "https://images.unsplash.com/photo-1610419207601-a56f8fd4a565?q=80&w=1887&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Wax cloths",
      price: "11$",
      image: "https://images.unsplash.com/photo-1628189855577-ce6dcff03cb9?q=80&w=1969&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Loofah",
      price: "8$",
      image: "https://images.unsplash.com/photo-1606803716962-dcc0bb02f6bc?q=80&w=1974&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-5xl md:text-6xl text-[#2c3d25] font-normal tracking-tight">Bestsellers</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-2xl bg-[#f5efe8] text-[#2c3d25] flex items-center justify-center hover:bg-[#ebdccc] transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="w-12 h-12 rounded-2xl bg-[#f5efe8] text-[#2c3d25] flex items-center justify-center hover:bg-[#ebdccc] transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <button className="px-6 py-3 rounded-full border border-[#2c3d25] text-[#2c3d25] font-medium hover:bg-[#2c3d25] hover:text-white transition-colors ml-4 hidden md:block">
              View all
            </button>
          </div>
        </div>

        {/* Products Grid / Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col">
              <div className="aspect-[4/5] bg-gray-100 rounded-[40px] overflow-hidden mb-6 group relative">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              
              <div className="flex justify-between items-end px-2">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-lg">{product.price}</p>
                </div>
                
                <div className="flex gap-2">
                  <button className="w-12 h-12 rounded-2xl bg-[#f5efe8] text-gray-700 flex items-center justify-center hover:bg-[#ebdccc] transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-2xl bg-[#fbbc04] text-gray-900 flex items-center justify-center hover:bg-[#e3aa04] transition-colors">
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View all */}
        <div className="mt-10 flex justify-center md:hidden">
          <button className="px-8 py-3 rounded-full border border-[#2c3d25] text-[#2c3d25] font-medium hover:bg-[#2c3d25] hover:text-white transition-colors">
            View all
          </button>
        </div>
      </div>
    </section>
  );
}
