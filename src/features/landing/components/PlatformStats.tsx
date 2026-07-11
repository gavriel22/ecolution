"use client";

import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api-client";

function AnimatedNumber({ value, duration = 500, isFloat = false }: { value: number, duration?: number, isFloat?: boolean }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      const easeOutExpo = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      const currentVal = value * easeOutExpo;

      setCount(currentVal);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(value); // ensure it lands exactly on the value
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isVisible]);

  if (isFloat) {
    return <span ref={ref}>{count.toFixed(1)}</span>;
  }

  return <span ref={ref}>{Math.floor(count).toLocaleString("id-ID")}</span>;
}

export function PlatformStats() {
  const [stats, setStats] = useState({
    totalUsers: 1240,
    totalMerchants: 45,
    totalVerifiedActivities: 8920,
    totalRecycledWaste: 4.2, // Tons
    totalRewardsRedeemed: 1850,
  });

  useEffect(() => {
    apiFetch<any>("/api/dashboard/admin")
      .then((res) => {
        if (res.data) {
          setStats({
            totalUsers: res.data.totalUsers || 1240,
            totalMerchants: res.data.totalMerchants || 45,
            totalVerifiedActivities: res.data.activitiesCount?.APPROVED || 8920,
            totalRecycledWaste: 4.2,
            totalRewardsRedeemed: 1850,
          });
        }
      })
      .catch(() => { });
  }, []);

  return (
    <section className="bg-brand-ink py-24 border-t border-white/5">
      <div className="max-w-[1100px] mx-auto px-6 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row lg:justify-between gap-10 lg:gap-6">

          <div className="flex flex-col">
            <h3 className="font-display text-4xl md:text-5xl font-medium text-white/95 tracking-tight">
              <AnimatedNumber value={stats.totalUsers} /><span className="text-2xl text-white/40 ml-1">+</span>
            </h3>
            <p className="font-body text-sm text-white/60 mt-3 leading-relaxed">
              Anggota komunitas Ecolution
            </p>
          </div>

          <div className="flex flex-col">
            <h3 className="font-display text-4xl md:text-5xl font-medium text-white/95 tracking-tight">
              <AnimatedNumber value={stats.totalMerchants} />
            </h3>
            <p className="font-body text-sm text-white/60 mt-3 leading-relaxed">
              Mitra UMKM
            </p>
          </div>

          <div className="flex flex-col">
            <h3 className="font-display text-4xl md:text-5xl font-medium text-white/95 tracking-tight">
              <AnimatedNumber value={stats.totalVerifiedActivities} />
            </h3>
            <p className="font-body text-sm text-white/60 mt-3 leading-relaxed">
              Aksi lingkungan terverifikasi
            </p>
          </div>

          <div className="flex flex-col">
            <h3 className="font-display text-4xl md:text-5xl font-medium text-white/95 tracking-tight">
              <AnimatedNumber value={stats.totalRecycledWaste} isFloat={true} /><span className="text-2xl text-white/40 ml-1">t</span>
            </h3>
            <p className="font-body text-sm text-white/60 mt-3 leading-relaxed">
              Sampah berhasil dikurangi
            </p>
          </div>

          <div className="flex flex-col">
            <h3 className="font-display text-4xl md:text-5xl font-medium text-white/95 tracking-tight">
              <AnimatedNumber value={stats.totalRewardsRedeemed} />
            </h3>
            <p className="font-body text-sm text-white/60 mt-3 leading-relaxed">
              Reward telah dibagikan
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
