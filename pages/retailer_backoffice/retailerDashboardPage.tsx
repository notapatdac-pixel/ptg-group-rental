import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const HOURS = ["06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const HEATMAP = [
  [0,0,2,3,1,2,4,3,2,2,2,1,3,4,3,2,1,0],
  [0,0,2,3,1,2,3,3,2,1,2,1,3,4,2,2,1,0],
  [0,0,2,4,1,2,4,3,2,2,2,2,3,3,3,2,1,0],
  [0,0,1,3,1,2,3,3,2,1,2,2,3,4,2,2,1,0],
  [0,0,2,3,1,2,4,3,2,2,3,2,4,4,3,3,2,1],
  [0,0,0,1,2,3,4,4,3,3,3,3,4,4,3,3,2,1],
  [0,0,0,1,2,3,4,4,3,3,3,2,3,3,2,2,1,0],
];

const HEAT_COLORS = [
  "bg-[#F0EDE4]",
  "bg-lime-100",
  "bg-lime-200",
  "bg-[#6ab04c]",
  "bg-[#344e00]",
];

const WEEKDAY_BARS = [
  { h: "06", v: 8  }, { h: "07", v: 18 }, { h: "08", v: 72 }, { h: "09", v: 90 },
  { h: "10", v: 35 }, { h: "11", v: 48 }, { h: "12", v: 100}, { h: "13", v: 85 },
  { h: "14", v: 38 }, { h: "15", v: 30 }, { h: "16", v: 42 }, { h: "17", v: 28 },
  { h: "18", v: 82 }, { h: "19", v: 95 }, { h: "20", v: 60 }, { h: "21", v: 32 },
  { h: "22", v: 15 }, { h: "23", v: 5  },
];

const WEEKEND_BARS = [
  { h: "06", v: 4  }, { h: "07", v: 6  }, { h: "08", v: 12 }, { h: "09", v: 28 },
  { h: "10", v: 52 }, { h: "11", v: 80 }, { h: "12", v: 100}, { h: "13", v: 98 },
  { h: "14", v: 70 }, { h: "15", v: 60 }, { h: "16", v: 55 }, { h: "17", v: 65 },
  { h: "18", v: 88 }, { h: "19", v: 92 }, { h: "20", v: 75 }, { h: "21", v: 45 },
  { h: "22", v: 22 }, { h: "23", v: 8  },
];

const AGE_SEGS = [
  { label: "18–25 (Gen Z)",      pct: 34, color: "#344e00" },
  { label: "26–35 (Millennial)", pct: 38, color: "#6ab04c" },
  { label: "36–45 (Gen X)",      pct: 18, color: "#a5d6a7" },
  { label: "46+ (Boomer)",       pct: 10, color: "#D4C9B0" },
];

const SPEND_SEGS = [
  { label: "Premium (>400 THB)", pct: 22, color: "#1C3A1C" },
  { label: "Mid (200–400)",      pct: 45, color: "#6ab04c" },
  { label: "Value (100–200)",    pct: 24, color: "#a5d6a7" },
  { label: "Budget (<100)",      pct:  9, color: "#D4C9B0" },
];

const CONVERSION = [
  { name: "Coffee Corner",  station: "Rama IX",    orders: 130, traffic: 340, rate: 38.2 },
  { name: "Quick Mart",     station: "Ari Station", orders: 97,  traffic: 280, rate: 34.6 },
  { name: "Lumina",         station: "STN-005",    orders: 158, traffic: 415, rate: 38.1 },
  { name: "Krua Express",   station: "STN-005",    orders: 112, traffic: 360, rate: 31.1 },
];

const HIGHLIGHTS = [
  {
    type: "best" as const,
    badge: "Best Performing Station",
    badgeIcon: "star",
    name: "Coffee Corner",
    location: "Rama IX · Bangkok",
    storeType: "Artisan Café",
    unitsUsed: 3, unitsTotal: 4,
    tags: [
      { label: "Top Quartile",      color: "bg-primary/10 text-primary" },
      { label: "Peak: Sat afternoon", color: "bg-[#F5F2EB] text-on-surface-variant" },
      { label: "+18% YoY",          color: "bg-primary/10 text-primary" },
    ],
    revenue: { value: "฿143k", trend: "↑ 18%", up: true },
    customers: { value: "340",  trend: "↑ 12%", up: true },
    basket:    { value: "฿248", trend: "per visit" },
    conversion: { value: 38.2, change: "↑ +2.1 pts", up: true },
    trend: [60, 72, 68, 85, 90, 143],
    ml: "Extending Saturday hours 2h could add ฿21k/mo based on unmet demand.",
  },
  {
    type: "needs" as const,
    badge: "Needs Attention",
    badgeIcon: "warning",
    name: "Atelier Vert",
    location: "STN-002 · Bangkok",
    storeType: "Boutique Apparel",
    unitsUsed: 1, unitsTotal: 5,
    tags: [
      { label: "45% below target", color: "bg-red-50 text-red-600" },
      { label: "Cover: 2.3×",      color: "bg-amber-50 text-amber-700" },
      { label: "Needs attention",   color: "bg-red-50 text-red-600" },
    ],
    revenue: { value: "฿41k",  trend: "↓ 11%", up: false },
    customers: { value: "190",  trend: "↓ 8%",  up: false },
    basket:    { value: "฿216", trend: "per visit" },
    conversion: { value: 22.4, change: "↓ −3.2 pts", up: false },
    trend: [68, 62, 55, 50, 45, 41],
    ml: "Revenue declining 3 months consecutively. ML recommends pricing review and demographic re-targeting.",
  },
];

function DonutChart({ segs, size = 80 }: { segs: { label: string; pct: number; color: string }[]; size?: number }) {
  let cum = 0;
  const gradient = segs.map((s) => { const from = cum; cum += s.pct; return `${s.color} ${from}% ${cum}%`; }).join(", ");
  const inner = size * 0.38;
  return (
    <div
      className="rounded-full flex-shrink-0"
      style={{
        width: size, height: size,
        background: `conic-gradient(${gradient})`,
        WebkitMaskImage: `radial-gradient(transparent ${inner}px, black ${inner}px)`,
        maskImage: `radial-gradient(transparent ${inner}px, black ${inner}px)`,
      }}
    />
  );
}

export default function RetailerDashboardPage() {
  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">Overview</h1>
          <p className="text-sm text-on-surface-variant mt-1">Your retail performance at a glance.</p>
        </div>
        <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">
          Export Report
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Monthly Revenue</div>
          <div className="text-3xl font-bold text-on-surface">285k</div>
          <div className="text-sm text-on-surface-variant mb-3">THB</div>
          <span className="text-xs font-bold text-primary">↑ +12% vs last month</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Avg Daily Customers</div>
          <div className="text-3xl font-bold text-on-surface">340</div>
          <div className="text-sm text-on-surface-variant mb-3">visitors / day</div>
          <span className="text-xs font-bold text-amber-600">↓ -5% vs last month</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Conversion Rate</div>
          <div className="text-3xl font-bold text-on-surface">38.2%</div>
          <div className="text-sm text-on-surface-variant mb-3">orders / visitors</div>
          <span className="text-xs font-bold text-primary">↑ +2.1 pts vs last month</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">AI Performance Score</div>
          <div className="text-3xl font-bold text-on-surface">88%</div>
          <div className="text-sm text-on-surface-variant mb-3">overall rating</div>
          <span className="text-xs font-bold text-primary">Top Quartile</span>
        </div>
      </div>

      {/* AI Advisor — KPI interpretation */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-4 mb-6 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">auto_awesome</span>
        <div>
          <div className="text-xs font-bold text-primary mb-1">AI Advisor · What this means</div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Revenue is up <strong className="text-on-surface">+12%</strong> even though foot traffic dropped <strong className="text-on-surface">-5%</strong> — this means each customer is spending more, not that you have more customers.
            Your conversion rate improving to <strong className="text-on-surface">38.2%</strong> confirms stores are selling better.{" "}
            Focus: protect this conversion momentum rather than just chasing more traffic volume.
          </p>
        </div>
      </div>

      {/* Heatmap + Popular Times */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Heatmap */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-on-surface mb-0.5">Foot Traffic Heatmap</h3>
          <p className="text-xs text-on-surface-variant mb-4">Average visitors by hour — darker = busier</p>
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="flex mb-1 ml-10 gap-0.5">
                {HOURS.map((h) => (
                  <div key={h} className="flex-1 text-center text-[9px] text-on-surface-variant">{h}</div>
                ))}
              </div>
              {HEATMAP.map((row, di) => (
                <div key={DAYS[di]} className="flex items-center gap-0.5 mb-0.5">
                  <div className="w-9 text-[10px] text-on-surface-variant text-right pr-2 flex-shrink-0">{DAYS[di]}</div>
                  {row.map((level, hi) => (
                    <div key={hi} className={`flex-1 rounded-sm ${HEAT_COLORS[level]}`} style={{ height: 18 }} />
                  ))}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-on-surface-variant">Low</span>
                {HEAT_COLORS.map((c, i) => <div key={i} className={`w-5 h-3 rounded-sm ${c}`} />)}
                <span className="text-[10px] text-on-surface-variant">High</span>
              </div>
            </div>
          </div>
          {/* Heatmap tip */}
          <div className="mt-4 bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Promo window:</strong> 10–11h and 14–17h show low traffic every day — run a limited-time deal during these hours to turn slow periods into revenue.
            </p>
          </div>
        </div>

        {/* Popular Times */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="text-base font-bold text-on-surface mb-0.5">Popular Times</h3>
            <p className="text-xs text-on-surface-variant">Average foot traffic by hour</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-on-surface mb-2">Weekday</div>
            <div className="flex items-end gap-[3px] h-14">
              {WEEKDAY_BARS.map((b) => (
                <div key={b.h} className="flex-1">
                  <div className="w-full rounded-t-sm bg-[#6ab04c]" style={{ height: `${b.v}%`, minHeight: b.v > 0 ? 3 : 0 }} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[3px] mt-1">
              {WEEKDAY_BARS.map((b) => (
                <div key={b.h} className="flex-1 text-center text-[8px] text-on-surface-variant">
                  {["06","09","12","15","18","21"].includes(b.h) ? b.h : ""}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-on-surface mb-2">Weekend</div>
            <div className="flex items-end gap-[3px] h-14">
              {WEEKEND_BARS.map((b) => (
                <div key={b.h} className="flex-1">
                  <div className="w-full rounded-t-sm bg-[#344e00]" style={{ height: `${b.v}%`, minHeight: b.v > 0 ? 3 : 0 }} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[3px] mt-1">
              {WEEKEND_BARS.map((b) => (
                <div key={b.h} className="flex-1 text-center text-[8px] text-on-surface-variant">
                  {["06","09","12","15","18","21"].includes(b.h) ? b.h : ""}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#F5F2EB] rounded-xl px-3 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Weekday peaks at <strong className="text-on-surface">08–09h</strong> (commute) and <strong className="text-on-surface">19h</strong> (after work). Weekend peaks at <strong className="text-on-surface">12–13h</strong>. Align staffing and restocking to these windows.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Segments + Conversion table */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Customer Segments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-on-surface mb-0.5">Customer Segments</h3>
          <p className="text-xs text-on-surface-variant mb-5">Age range &amp; spending tier</p>

          <div className="mb-5">
            <div className="text-xs font-semibold text-on-surface mb-3">Age Range</div>
            <div className="flex items-center gap-4">
              <DonutChart segs={AGE_SEGS} size={72} />
              <div className="space-y-1.5">
                {AGE_SEGS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-on-surface-variant w-12">{s.label}</span>
                    <span className="font-bold text-on-surface">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs font-semibold text-on-surface mb-3">Spending Tier</div>
            <div className="flex items-center gap-4">
              <DonutChart segs={SPEND_SEGS} size={72} />
              <div className="space-y-1.5">
                {SPEND_SEGS.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-on-surface-variant w-16">{s.label}</span>
                    <span className="font-bold text-on-surface">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Segment AI tip */}
          <div className="mt-auto bg-[#F5F2EB] rounded-xl px-3 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Millennials (26–35)</strong> are your biggest group, but <strong className="text-on-surface">Gen Z (18–25)</strong> is the fastest-growing. A social-media-friendly offer could lock them in early.
            </p>
          </div>
        </div>

        {/* Conversion by Station */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-on-surface mb-0.5">Conversion Rate by Station</h3>
          <p className="text-xs text-on-surface-variant mb-4">Orders vs. foot traffic this month</p>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20 pb-2 mb-1">
            <span>Store / Station</span>
            <span className="text-right">Orders</span>
            <span className="text-right">Traffic</span>
            <span className="text-right">Rate</span>
            <span />
          </div>

          <div className="flex-1 divide-y divide-outline-variant/10">
            {CONVERSION.map((c) => (
              <div key={c.name} className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] items-center py-3">
                <div>
                  <div className="text-sm font-medium text-on-surface">{c.name}</div>
                  <div className="text-xs text-on-surface-variant">{c.station}</div>
                </div>
                <span className="text-xs text-on-surface text-right">{c.orders}</span>
                <span className="text-xs text-on-surface text-right">{c.traffic}</span>
                <span className={`text-xs font-bold text-right ${c.rate < 33 ? "text-on-surface-variant" : "text-primary"}`}>{c.rate}%</span>
                <div className="pl-3 h-2.5 flex items-center">
                  <div className="w-full bg-[#F5F2EB] rounded-full overflow-hidden h-2">
                    <div
                      className={`h-2 rounded-full ${c.rate < 33 ? "bg-on-surface/20" : "bg-primary"}`}
                      style={{ width: `${(c.rate / 45) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conversion AI tip */}
          <div className="mt-4 bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Krua Express</strong> has the lowest conversion (31.1%) with 360 visitors/day — biggest quick-win opportunity. A combo offer could add ~15 orders/day without needing more foot traffic.
            </p>
          </div>
        </div>
      </div>

      {/* Station Highlights */}
      <div className="grid grid-cols-2 gap-6">
        {HIGHLIGHTS.map((h) => {
          const isBest = h.type === "best";
          const accentColor = isBest ? "text-primary" : "text-red-500";
          const barColor    = isBest ? "bg-primary"   : "bg-red-400";
          const trendMax    = Math.max(...h.trend);
          const trendMin    = Math.min(...h.trend);
          const pts = h.trend.map((v, i) => {
            const x = (i / (h.trend.length - 1)) * 100;
            const y = 32 - ((v - trendMin) / (trendMax - trendMin || 1)) * 28;
            return `${x},${y}`;
          }).join(" ");

          return (
            <div key={h.name} className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[14px] ${accentColor}`}>{h.badgeIcon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${accentColor}`}>{h.badge}</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-surface-variant">Store type</div>
                  <div className="text-xs font-semibold text-on-surface">{h.storeType}</div>
                </div>
              </div>

              {/* Name + location + units */}
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-on-surface">{h.name}</div>
                  <div className="text-xs text-on-surface-variant">{h.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-surface-variant mb-1">Units used</div>
                  <div className="flex gap-1">
                    {Array.from({ length: h.unitsTotal }).map((_, i) => (
                      <span key={i} className={`w-3 h-3 rounded-full ${i < h.unitsUsed ? "bg-on-surface" : "bg-outline-variant/30"}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {h.tags.map((t) => (
                  <span key={t.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span>
                ))}
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Revenue / Mo</div>
                  <div className="text-xl font-bold text-on-surface">{h.revenue.value}</div>
                  <div className={`text-xs font-semibold ${h.revenue.up ? "text-primary" : "text-red-500"}`}>{h.revenue.trend}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Daily Customers</div>
                  <div className="text-xl font-bold text-on-surface">{h.customers.value}</div>
                  <div className={`text-xs font-semibold ${h.customers.up ? "text-primary" : "text-red-500"}`}>{h.customers.trend}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Avg Basket</div>
                  <div className="text-xl font-bold text-on-surface">{h.basket.value}</div>
                  <div className="text-xs text-on-surface-variant">{h.basket.trend}</div>
                </div>
              </div>

              {/* Conversion rate */}
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Conversion rate</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${accentColor}`}>{h.conversion.value}%</span>
                  <span className={`text-[10px] ${h.conversion.up ? "text-primary" : "text-red-500"}`}>{h.conversion.change}</span>
                </div>
              </div>
              <div className="h-2 bg-[#F5F2EB] rounded-full overflow-hidden mb-4">
                <div className={`h-2 ${barColor} rounded-full`} style={{ width: `${h.conversion.value}%` }} />
              </div>

              {/* 6-month trend sparkline */}
              <div className="mb-3">
                <div className="text-[10px] text-on-surface-variant mb-1">6-month revenue trend</div>
                <svg viewBox="0 0 100 36" className="w-full h-8" preserveAspectRatio="none">
                  <polyline
                    points={pts}
                    fill="none"
                    stroke={isBest ? "#6ab04c" : "#f87171"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {h.trend.map((v, i) => {
                    const x = (i / (h.trend.length - 1)) * 100;
                    const y = 32 - ((v - trendMin) / (trendMax - trendMin || 1)) * 28;
                    return i === h.trend.length - 1 ? (
                      <circle key={i} cx={x} cy={y} r="2.5" fill={isBest ? "#6ab04c" : "#f87171"} />
                    ) : null;
                  })}
                </svg>
              </div>

              {/* ML insight */}
              <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">ML insight:</strong> {h.ml}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </RetailerBackofficeLayout>
  );
}
