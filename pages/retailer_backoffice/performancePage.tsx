import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const BARS = [
  { month: "JAN", coffee: 98, mart: 72 },
  { month: "FEB", coffee: 118, mart: 82 },
  { month: "MAR", coffee: 105, mart: 76 },
  { month: "APR", coffee: 130, mart: 91 },
  { month: "MAY", coffee: 122, mart: 87 },
  { month: "JUN", coffee: 165, mart: 100 },
];

const EFFICIENCY = [
  { label: "Revenue vs Predicted", pct: 118, color: "bg-primary" },
  { label: "Customer Volume", pct: 105, color: "bg-primary" },
  { label: "Average Spend", pct: 96, color: "bg-outline-variant/50" },
  { label: "Repeat Visit Rate", pct: 112, color: "bg-primary" },
];

export default function PerformancePage() {
  return (
    <RetailerBackofficeLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">Performance Analytics</h1>
          <p className="text-xs text-on-surface-variant mt-1">Fiscal Year 2024 • <span className="text-primary">Sub-tab 6B Performance Review</span></p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white hover:bg-surface-container-low cursor-pointer">Refresh</button>
          <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:brightness-105 cursor-pointer border-0">Export Report</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">YTD REVENUE</div>
          <div className="text-3xl font-bold text-on-surface mb-1">1.71M THB</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-primary">↑ 12% from last month</div>
            <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">Real-time</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">AVG BASKET SIZE</div>
          <div className="text-3xl font-bold text-on-surface mb-1">248 THB</div>
          <div className="h-1.5 bg-outline-variant/20 rounded-full mt-2"><div className="h-1.5 bg-primary rounded-full w-[44%]" /></div>
          <div className="text-xs text-on-surface-variant mt-1">4% vs target</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">PEAK TRADING DAY</div>
          <div className="text-3xl font-bold text-on-surface mb-1">Saturday</div>
          <div className="text-xs text-primary">14:00–18:00 Peak window</div>
        </div>
        <div className="bg-[#1C3A1C] rounded-2xl p-5 shadow-sm text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-2">YOY GROWTH</div>
          <div className="text-3xl font-bold mb-1">+28%</div>
          <div className="text-xs text-white/70">Outperforming industry average by 6.4%</div>
        </div>
      </div>

      {/* Main chart + efficiency */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-1">Monthly Revenue by Store</h3>
          <p className="text-xs text-on-surface-variant mb-4">Comparative analysis across core retail units.</p>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Coffee Corner</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant/50 inline-block" />Quick Mart</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {BARS.map((b) => (
              <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end">
                  <div className="flex-1 bg-primary rounded-t" style={{ height: `${b.coffee}%`, minHeight: "8px" }} />
                  <div className="flex-1 bg-outline-variant/40 rounded-t" style={{ height: `${b.mart}%`, minHeight: "8px" }} />
                </div>
                <span className="text-[10px] text-on-surface-variant">{b.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-2.5">
            <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
            <p className="text-xs text-on-surface">Coffee Corner outperformed Q2 predictions by 14.8% due to extended Saturday hours.</p>
            <button type="button" className="ml-auto text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer whitespace-nowrap">View Breakdown</button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm flex-1">
            <h3 className="font-semibold text-on-surface mb-4">Efficiency Pulse ⚡</h3>
            <div className="space-y-4">
              {EFFICIENCY.map((e) => (
                <div key={e.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">{e.label}</span>
                    <span className="font-bold text-on-surface">{e.pct}%</span>
                  </div>
                  <div className="h-2 bg-outline-variant/20 rounded-full">
                    <div className={`h-2 ${e.color} rounded-full`} style={{ width: `${Math.min(e.pct, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-3">Traffic Distribution</h3>
            <p className="text-xs text-on-surface-variant mb-3">Weekly yield distribution by volume.</p>
            <div className="flex items-end gap-2 h-16">
              {([["MON", 35], ["TUE", 42], ["WED", 38], ["THU", 50], ["FRI", 55], ["SAT", 90], ["SUN", 40]] as [string, number][]).map(([d, h]) => (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-t ${d === "SAT" ? "bg-primary" : "bg-outline-variant/40"}`} style={{ height: `${h}%` }} />
                  <span className="text-[9px] text-on-surface-variant">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
