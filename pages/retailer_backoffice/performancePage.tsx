import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const BREAKEVEN = [
  { name: "Coffee Corner",           rent: 22, revenue: 142, surplus: 120 },
  { name: "Quick Mart",              rent: 37, revenue: 143, surplus: 106 },
  { name: "Lumina Artisan Roastery", rent: 49, revenue: 318, surplus: 269 },
];

const BENCHMARK = [
  {
    title: "Revenue / sqm",
    unit: "THB/mo",
    you:    { value: 3650, label: "3,650/sqm" },
    top:    { value: 5200, label: "5,200/sqm" },
    median: { value: 3100, label: "3,100/sqm" },
    bottom: { value: 1900, label: "1,900/sqm" },
    max: 5200,
  },
  {
    title: "Daily Foot Traffic",
    unit: "visitors/day",
    you:    { value: 340, label: "340/day" },
    top:    { value: 420, label: "420/day" },
    median: { value: 285, label: "285/day" },
    bottom: { value: 175, label: "175/day" },
    max: 420,
  },
  {
    title: "Repeat Visit Rate",
    unit: "%",
    you:    { value: 54, label: "54%" },
    top:    { value: 68, label: "68%" },
    median: { value: 47, label: "47%" },
    bottom: { value: 31, label: "31%" },
    max: 68,
  },
];

const SEGMENTS = [
  { gen: "Gen Z",      pct: 28, basket: "฿195", share: "+8%"  },
  { gen: "Millennial", pct: 42, basket: "฿265", share: "+12%" },
  { gen: "Gen X",      pct: 20, basket: "฿270", share: "+3%"  },
  { gen: "Boomer",     pct: 10, basket: "฿240", share: "+1%"  },
];

export default function PerformancePage() {
  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">Performance Analytics</h1>
          <p className="text-sm text-on-surface-variant mt-1">Fiscal Year 2024</p>
        </div>
        <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">
          Export Report
        </button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">YTD Revenue</div>
          <div className="text-3xl font-bold text-on-surface">1.71M</div>
          <div className="text-sm text-on-surface-variant mb-3">THB</div>
          <span className="text-xs font-bold text-primary">↑ +28% YoY</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Avg Basket Size</div>
          <div className="text-3xl font-bold text-on-surface">248</div>
          <div className="text-sm text-on-surface-variant mb-3">THB per order</div>
          <span className="text-xs font-bold text-primary">↑ +4% vs target</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Total Rent / Month</div>
          <div className="text-3xl font-bold text-on-surface">58.8k</div>
          <div className="text-sm text-on-surface-variant mb-3">THB · 2 leases</div>
          <span className="text-xs text-on-surface-variant">Fixed cost</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Rent-to-Revenue Ratio</div>
          <div className="text-3xl font-bold text-on-surface">20.6%</div>
          <div className="text-sm text-on-surface-variant mb-3">of monthly revenue</div>
          <span className="text-xs font-bold text-primary">Healthy · under 25%</span>
        </div>
      </div>

      {/* ── Break-Even ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">Break-Even Analysis</h3>
        <p className="text-xs text-on-surface-variant mb-5">Is each store making enough to cover its rent? How much is left over?</p>

        <div className="space-y-3 mb-5">
          {BREAKEVEN.map((s) => {
            const rentPct    = (s.rent    / s.revenue) * 100;
            const surplusPct = (s.surplus / s.revenue) * 100;
            return (
              <div key={s.name} className="bg-[#F5F2EB] rounded-2xl px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-on-surface">{s.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                    <span className="text-xs font-bold text-primary">Above break-even</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-bold text-primary">+฿{s.surplus}k</span>
                  <span className="text-xs text-on-surface-variant">above rent / month</span>
                </div>

                <div className="flex h-3 rounded-full overflow-hidden mb-2">
                  <div className="bg-amber-400 flex-shrink-0" style={{ width: `${rentPct}%` }} />
                  <div className="bg-[#6ab04c] rounded-r-full" style={{ width: `${surplusPct}%` }} />
                </div>

                <div className="flex justify-between text-[10px]">
                  <span className="text-amber-600 font-semibold">Rent ฿{s.rent}k · {Math.round(rentPct)}% of revenue</span>
                  <span className="text-on-surface-variant">Revenue ฿{s.revenue}k</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Advisor */}
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            All 3 stores are above break-even. <strong className="text-on-surface">Quick Mart</strong> has the highest rent-to-revenue ratio (26%) — still healthy, but the least buffer. If monthly revenue dips, it will feel pressure first. A rent renegotiation or small revenue push there is worth considering.
          </p>
        </div>
      </div>

      {/* ── Competitor Benchmark ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">How You Compare</h3>
        <p className="text-xs text-on-surface-variant mb-4">Competitor Benchmark — Same business type (Artisan Café)</p>

        {/* Summary banner */}
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 mb-5 text-xs text-on-surface-variant leading-relaxed">
          You rank <strong className="text-on-surface">top 23%</strong> on the platform among Artisan Café / Coffee retailers.
          Avg basket size and repeat visit rate are above peer median — revenue per sqm lags slightly behind the top quartile.
        </div>

        <div className="grid grid-cols-3 gap-8 mb-5">
          {BENCHMARK.map((m) => {
            const rows = [
              { label: "You (avg)",      value: m.you,    bold: true,  color: "bg-primary",          h: "h-3" },
              { label: "Top quartile",   value: m.top,    bold: false, color: "bg-on-surface/25",    h: "h-2" },
              { label: "Peer median",    value: m.median, bold: false, color: "bg-on-surface/15",    h: "h-2" },
              { label: "Bottom quartile",value: m.bottom, bold: false, color: "bg-on-surface/10",    h: "h-2" },
            ];
            return (
              <div key={m.title}>
                <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">{m.title}</div>
                <div className="space-y-3">
                  {rows.map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`flex items-center gap-1.5 ${r.bold ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                          <span className={`w-2 h-2 rounded-full inline-block ${r.bold ? "bg-primary" : "bg-on-surface/20"}`} />
                          {r.label}
                        </span>
                        <span className={r.bold ? "font-bold text-primary" : "text-on-surface-variant"}>{r.value.label}</span>
                      </div>
                      <div className={`${r.h} bg-[#F5F2EB] rounded-full overflow-hidden`}>
                        <div className={`${r.h} ${r.color} rounded-full`} style={{ width: `${(r.value.value / m.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            You're above the peer median on all three metrics — but the biggest gap vs. top 25% is <strong className="text-on-surface">Revenue/sqm (฿3,650 vs ฿5,200)</strong>.
            This suggests your space isn't fully utilized. A higher-margin product line or better shelf placement could close this gap without needing more customers.
          </p>
        </div>
      </div>

      {/* ── Customer Status ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">Customer Status</h3>
        <p className="text-xs text-on-surface-variant mb-5">This month breakdown</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-green-700 mb-2">New Customers</div>
            <div className="text-4xl font-bold text-on-surface mb-1">847</div>
            <div className="text-xs text-on-surface-variant mb-1">24.9% of total</div>
            <div className="text-xs font-bold text-green-700">↑ +12% vs last month</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-blue-700 mb-2">Existing Customers</div>
            <div className="text-4xl font-bold text-on-surface mb-1">2,253</div>
            <div className="text-xs text-on-surface-variant mb-1">66.3% of total</div>
            <div className="text-xs font-bold text-blue-700">↑ +5% vs last month</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-red-700 mb-2">Churned Customers</div>
            <div className="text-4xl font-bold text-on-surface mb-1">300</div>
            <div className="text-xs text-on-surface-variant mb-1">8.8% of total</div>
            <div className="text-xs font-bold text-red-600">↓ -3% vs last month</div>
          </div>
        </div>
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Churn is down (good), but <strong className="text-on-surface">new customers (+12%) are growing faster than existing loyalty (+5%)</strong> — your stores attract people well but don't keep them coming back at the same rate.
            Consider a simple punch card or "3rd visit free" deal to convert first-timers into regulars.
          </p>
        </div>
      </div>

      {/* ── Revenue by Segment ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-on-surface mb-0.5">Revenue by Customer Segment</h3>
        <p className="text-xs text-on-surface-variant mb-5">Share of total revenue + avg spend per visit</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {SEGMENTS.map((s) => (
            <div key={s.gen} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-5 py-4">
              <div className="flex-shrink-0">
                <div className="text-xs text-on-surface-variant mb-0.5">{s.gen}</div>
                <div className="text-3xl font-bold text-on-surface">{s.pct}%</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-on-surface-variant mb-1">Avg basket <span className="font-semibold text-on-surface">{s.basket}</span></div>
                <div className="text-xs font-semibold text-primary">{s.share} revenue share</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Millennials (42%)</strong> drive the most revenue today, but <strong className="text-on-surface">Gen Z (+8% revenue share growth)</strong> is the fastest-growing segment.
            Gen Z tends to become brand-loyal when engaged early — a social-media-friendly packaging update or student discount could lock in this segment before competitors do.
          </p>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
