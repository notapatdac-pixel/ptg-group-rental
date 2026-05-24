"use client";

import { useEffect, useRef } from "react";
import { Station } from "@/lib/stations";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function formatVal(v: number, mode: string) {
  const n = Math.round(v);
  if (mode === "k" || mode === "int") return n.toLocaleString("en-US");
  return String(n);
}

function useCountUp(target: number, mode: string, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const p = Math.min(1, (now - start) / duration);
      el!.textContent = formatVal(target * easeOutCubic(p), mode);
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    el.textContent = formatVal(0, mode);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, mode, duration]);
  return ref;
}

function KpiShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow">
      <p className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-4">{label}</p>
      {children}
    </div>
  );
}

export default function StationDetailKpiSection({ station }: { station: Station }) {
  const d = station.detail;
  const customersRef = useCountUp(d.daily_customers_num, "int");
  const dwellRef = useCountUp(d.dwell_min_num, "int");
  const revenueRef = useCountUp(d.est_revenue_k, "k");
  const aiRef = useCountUp(d.ai_score_num, "pct");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiShell label="Daily Customers">
        <div className="flex items-baseline gap-2">
          <span ref={customersRef} className="font-headline text-4xl text-on-surface tabular-nums">0</span>
          <span className="text-secondary text-sm font-medium">{d.daily_delta}</span>
        </div>
      </KpiShell>
      <KpiShell label="Dwell Time">
        <div className="flex items-baseline gap-2">
          <div className="flex items-baseline gap-2">
            <span ref={dwellRef} className="font-headline text-4xl text-on-surface tabular-nums">0</span>
            <span className="text-xl font-body text-on-surface-variant"> min</span>
          </div>
          <span className="text-on-surface-variant text-sm font-medium">Avg</span>
        </div>
      </KpiShell>
      <KpiShell label="Est. Revenue">
        <div className="flex items-baseline gap-2">
          <h3 className="font-headline text-4xl text-on-surface flex items-baseline gap-0.5 flex-wrap">
            <span ref={revenueRef} className="font-headline text-4xl text-on-surface tabular-nums">0</span>
            <span className="font-headline text-4xl text-on-surface">K</span>
            <span className="text-xl font-body text-on-surface-variant font-normal"> THB</span>
          </h3>
        </div>
      </KpiShell>
      <div className="bg-surface-container-lowest p-6 rounded-xl editorial-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <span className="material-symbols-outlined text-5xl">smart_toy</span>
        </div>
        <p className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-4">AI Score</p>
        <div className="flex items-baseline gap-2">
          <h3 className="font-headline text-4xl text-primary flex items-baseline gap-0.5">
            <span ref={aiRef} className="font-headline text-4xl text-primary tabular-nums">0</span>
            <span className="font-headline text-4xl text-primary">%</span>
          </h3>
          <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">OPTIMAL</span>
        </div>
      </div>
    </div>
  );
}
