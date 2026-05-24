"use client";

import { useEffect, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * easeOutCubic(p)));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full min-h-full px-4 sm:px-6 md:px-8 py-2">
      {children}
      <p className="text-[10px] md:text-xs uppercase tracking-widest text-white/75 font-medium mt-1 text-center">
        {label}
      </p>
    </div>
  );
}

export default function StatsBar() {
  const stations = useCountUp(1247);
  const retailers = useCountUp(3890);
  const satisfaction = useCountUp(94);
  const gmv = useCountUp(77);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 w-full pointer-events-none">
      <div className="hero-stats-strip-glass w-full">
        <div className="hero-stats-grid max-w-7xl mx-auto justify-items-center items-stretch px-2 sm:px-4">
          <StatCell label="Active Stations">
            <p className="hero-stat-value font-headline text-3xl md:text-4xl tabular-nums">
              {stations.toLocaleString("en-US")}
            </p>
          </StatCell>
          <StatCell label="Retailers Joined">
            <p className="hero-stat-value font-headline text-3xl md:text-4xl tabular-nums">
              {retailers.toLocaleString("en-US")}+
            </p>
          </StatCell>
          <StatCell label="Satisfaction Rate">
            <p className="hero-stat-value font-headline text-3xl md:text-4xl tabular-nums">
              {satisfaction}%
            </p>
          </StatCell>
          <StatCell label="Total Marketplace GMV">
            <p className="hero-stat-value font-headline text-3xl md:text-4xl tabular-nums text-center">
              {gmv}
              <span className="text-2xl md:text-3xl font-headline ml-0.5 hero-stat-value">B</span>{" "}
              <span className="text-lg md:text-xl font-sans font-normal hero-stat-value-muted">THB</span>
            </p>
          </StatCell>
        </div>
      </div>
    </div>
  );
}
