import { Camera, Gift, Trophy, Store } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Log Activities",
      description: "Snap a photo of your recycling activity. We use EXIF metadata to verify the location and time of your eco-friendly action.",
      icon: <Camera className="w-6 h-6 text-indigo-600" />,
      color: "bg-indigo-50",
    },
    {
      title: "Earn Points",
      description: "Once verified, you'll receive points based on the type of activity. The bigger the impact, the more points you earn.",
      icon: <Gift className="w-6 h-6 text-pink-600" />,
      color: "bg-pink-50",
    },
    {
      title: "Join Challenges",
      description: "Participate in community challenges to build a habit and win bonus points upon completion.",
      icon: <Trophy className="w-6 h-6 text-yellow-600" />,
      color: "bg-yellow-50",
    },
    {
      title: "Eco Marketplace",
      description: "Exchange your hard-earned points for vouchers and exclusive eco-friendly products from our verified merchant partners.",
      icon: <Store className="w-6 h-6 text-teal-600" />,
      color: "bg-teal-50",
    },
  ];

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <h2 className="text-sm font-bold tracking-widest text-green-600 uppercase mb-3">
              How It Works
            </h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
              Turn your green habits into <span className="text-green-600">rewards</span>
            </h3>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Ecolution makes saving the environment fun and rewarding. Follow these simple steps to start earning.
            </p>

            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mt-1`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Image / Mockup area */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-yellow-300 rounded-[3rem] rotate-3 opacity-20 blur-2xl"></div>
            <div className="relative bg-white border border-gray-100 rounded-[3rem] shadow-2xl p-8 aspect-[4/5] flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xl">🧑‍🌾</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold">Your Progress</div>
                    <div className="text-xs text-gray-500">1,250 Pts</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                  Level 3
                </div>
              </div>
              
              <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8" />
                </div>
                <h5 className="font-bold text-lg mb-2">Upload Activity</h5>
                <p className="text-sm text-gray-500">Take a picture of your recycling bin to earn +50 pts</p>
                <div className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-medium shadow-md">
                  Snap Photo
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
