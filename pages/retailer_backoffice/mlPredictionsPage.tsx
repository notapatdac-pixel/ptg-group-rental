import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const FORECAST_BARS = [
  { month: "JAN", predicted: 65, conservative: 40, optimistic: 30 },
  { month: "FEB", predicted: 80, conservative: 50, optimistic: 38 },
  { month: "MAR", predicted: 95, conservative: 60, optimistic: 45 },
  { month: "APR", predicted: 72, conservative: 45, optimistic: 35 },
];

const REGIONS = [
  { name: "Bangkok Metropolis", velocity: 8.4, pct: 84 },
  { name: "Eastern Seaboard", velocity: 6.2, pct: 62 },
  { name: "Chiang Mai Cluster", velocity: 4.9, pct: 49 },
  { name: "Southern Tourism Hubs", velocity: 7.1, pct: 71 },
];

export default function MlPredictionsPage() {
  return (
    <RetailerBackofficeLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">ML Growth Intelligence</h1>
          <p className="text-sm text-on-surface-variant mt-1">Predictive modeling for retail expansion and quarterly revenue optimization.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white cursor-pointer">Refresh</button>
          <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">Export Report</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">NEXT MONTH FORECAST</div>
          <div className="text-3xl font-bold text-on-surface mb-1">$4.2M</div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">+12.4%</span>
            <span className="text-xs text-on-surface-variant">Trending above seasonal baseline</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Q2 PROJECTED REVENUE</div>
          <div className="text-3xl font-bold text-on-surface mb-1">$18.9M</div>
          <div className="text-xs text-on-surface-variant">Est. Range: $17M–$20M</div>
          <div className="text-xs text-primary mt-1">Confidence level: High (89%)</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 self-start">MODEL ACCURACY</div>
          <div className="relative w-20 h-20 mb-2">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6DBF23" strokeWidth="3"
                strokeDasharray="94.2 5.8" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-on-surface">94.2%</span>
            </div>
          </div>
          <div className="text-xs text-on-surface-variant">Variance: ±0.8%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Forecast chart */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-1">Quarterly Forecast Analysis</h3>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block" />Predicted</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1C3A1C] inline-block" />Conservative</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant/40 inline-block" />Optimistic</span>
          </div>
          <div className="flex items-end gap-4 h-44">
            {FORECAST_BARS.map((b) => (
              <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end">
                  <div className="flex-1 bg-lime-400 rounded-t" style={{ height: `${b.predicted}%`, minHeight: "6px" }} />
                  <div className="flex-1 bg-[#1C3A1C] rounded-t" style={{ height: `${b.conservative}%`, minHeight: "6px" }} />
                  <div className="flex-1 bg-outline-variant/40 rounded-t" style={{ height: `${b.optimistic}%`, minHeight: "6px" }} />
                </div>
                <span className="text-[10px] text-on-surface-variant">{b.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional velocity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-4">Regional Velocity Markers</h3>
          <div className="space-y-4 mb-5">
            {REGIONS.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">{r.name}</span>
                  <span className="font-bold text-on-surface">{r.velocity}x</span>
                </div>
                <div className="h-2 bg-outline-variant/20 rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#F5F2EB] rounded-xl p-3">
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Regional Velocity</strong> measures speed of market penetration and repeat customer acquisition. Values above 5.0x indicate high franchise expansion potential.
            </p>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
