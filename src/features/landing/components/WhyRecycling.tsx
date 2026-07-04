import { Trash2, TrendingDown, HeartPulse } from "lucide-react";

export function WhyRecycling() {
  const cards = [
    {
      title: "Reduce Waste",
      description: "By recycling, you help divert tons of waste from landfills, reducing soil and water pollution.",
      icon: <Trash2 className="w-8 h-8 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Save Energy",
      description: "Manufacturing products from recycled materials requires significantly less energy than using raw materials.",
      icon: <TrendingDown className="w-8 h-8 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Healthier Planet",
      description: "A cleaner environment directly contributes to the well-being of both humans and wildlife.",
      icon: <HeartPulse className="w-8 h-8 text-rose-600" />,
      bgColor: "bg-rose-50",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-green-600 uppercase mb-3">
            Why It Matters
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Small Actions, <span className="text-green-600">Big Impact</span>
          </h3>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Every item you recycle plays a crucial role in preserving our planet for future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${card.bgColor} flex items-center justify-center mb-6`}>
                {card.icon}
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h4>
              <p className="text-gray-600 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
