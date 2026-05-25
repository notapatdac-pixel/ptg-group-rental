"use client";
import { useState } from "react";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const EXPANSION_UNITS = [
  {
    name: "PTG Bang Na Complex",
    unit: "Unit A",
    size: "45 sqm",
    price: "฿24,500/mo",
    distance: "2.4km away",
    traffic: "High foot traffic",
    tags: ["High foot traffic", "BTS access", "Fits budget", "EV synergy"],
    match: 94,
    matchTier: "Excellent",
    matchCls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dotCls: "bg-emerald-500",
    revenueUplift: "฿38,000–฿52,000",
    whyMatch: ["Matches your daily customer volume", "Within your rental budget", "High EV-user traffic — fits your product mix"],
  },
  {
    name: "PTG Lat Phrao 71",
    unit: "Unit C",
    size: "32 sqm",
    price: "฿18,000/mo",
    distance: "2.9km away",
    traffic: "High foot traffic",
    tags: ["MRT Yellow Line", "Morning commuters", "Platinum Hub"],
    match: 91,
    matchTier: "Excellent",
    matchCls: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dotCls: "bg-emerald-500",
    revenueUplift: "฿28,000–฿40,000",
    whyMatch: ["Strong morning commuter overlap with your peak hours", "Lower rent = faster break-even", "MRT access drives repeat visits"],
  },
  {
    name: "PTG Rama 9",
    unit: "Unit B",
    size: "28 sqm",
    price: "฿15,000/mo",
    distance: "3.1km away",
    traffic: "Medium foot traffic",
    tags: ["Near your cluster", "Budget fit"],
    match: 88,
    matchTier: "Strong",
    matchCls: "text-amber-700 bg-amber-50 border-amber-200",
    dotCls: "bg-amber-400",
    revenueUplift: "฿18,000–฿28,000",
    whyMatch: ["Lowest entry cost in your shortlist", "Complements your existing cluster", "Medium traffic — lower risk for a first expansion"],
  },
];

const ANOMALIES = [
  {
    icon: "trending_up",
    iconBg: "bg-green-100 text-green-600",
    title: "Tuesday was busier than usual",
    body: "Your shops got about 34% more customers than normal on Tuesday — possibly a nearby event brought extra people in.",
    action: "Add 1–2 staff next Tuesday · could earn +฿8,400 more.",
    tag: "Good news",
    tagCls: "bg-green-100 text-green-700",
    age: "2 days ago",
    borderCls: "border-l-green-400",
  },
  {
    icon: "remove_shopping_cart",
    iconBg: "bg-amber-100 text-amber-600",
    title: "Customers spent less on Friday",
    body: "People spent about 18% less than usual on Friday afternoon — likely because a promotion ended and customers started buying less per visit.",
    action: "Run a weekend bundle deal to bring average spend back up.",
    tag: "Watch",
    tagCls: "bg-amber-100 text-amber-700",
    age: "4 days ago",
    borderCls: "border-l-amber-400",
  },
  {
    icon: "warning",
    iconBg: "bg-red-100 text-red-600",
    title: "Monday sales were lower than expected",
    body: "Revenue on Monday was 22% lower than expected — could be a technical issue with the payment system, or some transactions weren't recorded.",
    action: "Check your payment records and make sure all Monday orders are saved correctly.",
    tag: "Check this",
    tagCls: "bg-red-100 text-red-600",
    age: "6 days ago",
    borderCls: "border-l-red-400",
  },
];

const CHURN_SEGMENTS = [
  {
    segment: "Big spenders · 46+",
    lastVisit: "18 days ago",
    risk: 74,
    revenueAtRisk: "฿62,000/yr",
    action: "Re-engage",
    barCls: "bg-red-500",
    rowBg: "bg-red-50",
    riskText: "text-red-600",
    btnCls: "bg-red-700 hover:bg-red-800 text-white",
    tip: "Send a loyalty reward or personal discount — this group responds well to feeling special.",
  },
  {
    segment: "26–35 year olds · Mid-spenders",
    lastVisit: "14 days ago",
    risk: 61,
    revenueAtRisk: "฿48,000/yr",
    action: "Re-engage",
    barCls: "bg-red-400",
    rowBg: "bg-red-50",
    riskText: "text-red-500",
    btnCls: "bg-red-700 hover:bg-red-800 text-white",
    tip: "A time-limited deal or referral bonus works well for this group.",
  },
  {
    segment: "36–45 year olds · Budget-friendly",
    lastVisit: "9 days ago",
    risk: 38,
    revenueAtRisk: "฿24,000/yr",
    action: "Watch",
    barCls: "bg-amber-400",
    rowBg: "bg-amber-50",
    riskText: "text-amber-600",
    btnCls: "bg-amber-500 hover:bg-amber-600 text-white",
    tip: "Not urgent — check again in 2 weeks before taking action.",
  },
  {
    segment: "18–25 year olds · Young shoppers",
    lastVisit: "3 days ago",
    risk: 8,
    revenueAtRisk: null,
    action: "Healthy",
    barCls: "bg-green-500",
    rowBg: "bg-green-50",
    riskText: "text-green-600",
    btnCls: "bg-green-700 hover:bg-green-800 text-white",
    tip: null,
  },
];

const CATCHMENT_STATS = [
  { label: "Avg trip to your shop",   value: "4.2 km", note: "↑ within target range", noteCls: "text-green-600" },
  { label: "Nearest customers",       value: "0–3 km", note: "58% of customers",      noteCls: "text-on-surface-variant" },
  { label: "People within reach",     value: "95K",    note: "within 5 km radius",    noteCls: "text-on-surface-variant" },
  { label: "Untapped areas nearby",   value: "3",      note: "locations suggested",   noteCls: "text-amber-600" },
];

const DISTANCE_BANDS = [
  { label: "0–1 km", pct: 18, width: 53, color: "#1C3A1C" },
  { label: "1–2 km", pct: 13, width: 38, color: "#2d5a1b" },
  { label: "2–3 km", pct: 27, width: 80, color: "#6DBF23" },
  { label: "3–5 km", pct: 22, width: 65, color: "#9bcc6b" },
  { label: "5–8 km", pct: 12, width: 36, color: "#c5dba8" },
  { label: "8+ km",  pct: 8,  width: 24, color: "#d4d4d4" },
];

const CATCHMENT_STORES = ["Lumina Artisan Roastery", "Coffee Corner", "Quick Mart"];

const EXPANSION_STATIONS = [
  {
    name: "PTG Sukhumvit 62",
    location: "Khlong Toei, Bangkok",
    desc: "Many customers traveling through the Sukhumvit area currently have no shop like yours nearby. 91% of the people there match your typical customer profile.",
    tags: ["New audience", "10,398 daily", "23 min dwell", "Millennials"],
    fit: 91,
  },
  {
    name: "PTG Rama 9",
    location: "Huai Khwang, Bangkok",
    desc: "A Bangkok Metro hub with lots of morning commuters. Strong recent growth — one of the fastest-rising areas for retail in the city.",
    tags: ["Growth zone", "8,326 daily", "19.3 min dwell", "MRT access"],
    fit: 84,
  },
  {
    name: "PTG Bang Na Complex",
    location: "Bang Na, Bangkok",
    desc: "A residential area with 148,000 people nearby and no artisan café currently in the station. Lower daily traffic but customers tend to come back regularly.",
    tags: ["Untapped area", "6,512 daily", "15.4 min dwell", "BTS access"],
    fit: 76,
  },
];

function AiBox({ text }: { text: string }) {
  return (
    <div className="bg-[#F5F2EB] rounded-xl p-4 mt-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="material-symbols-outlined text-[14px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <span className="text-[9px] font-bold tracking-widest text-primary uppercase">
          Our Suggestion
        </span>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">{text}</p>
    </div>
  );
}

export default function MlPredictionsPage() {
  const [catchmentTab, setCatchmentTab] = useState<"overview" | "distance" | "expansion">("overview");
  const [activeStore, setActiveStore] = useState(0);

  return (
    <RetailerBackofficeLayout>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              AI-Powered · Updated just now
            </span>
          </div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">AI Predictions for Your Shops</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            What's likely to happen next — and what you can do about it.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 border border-outline-variant text-on-surface text-xs font-medium px-4 py-2.5 rounded-full bg-white cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>Refresh
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-full border-0 cursor-pointer hover:brightness-105 transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>Export Report
          </button>
        </div>
      </div>

      {/* ── Summary Banner ── */}
      <div className="bg-[#1C3A1C] rounded-2xl p-5 mb-6 flex items-center gap-5">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-lime-400/20 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-lime-300 text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            insights
          </span>
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-0.5">
            What to expect
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            Your shops are on track to earn <span className="font-bold text-lime-300">฿672k next month (+11.3%)</span>.
            Two groups of loyal customers are at risk of not coming back — if you act now, you could protect up to{" "}
            <span className="font-bold text-lime-300">฿110,000/year</span> in revenue.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-bold text-lime-300 border border-lime-300/30 px-4 py-2 rounded-full bg-transparent cursor-pointer hover:bg-lime-400/10 transition-colors whitespace-nowrap"
        >
          Full Report →
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              What You'll Likely Earn Next Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-green-600">trending_up</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-on-surface">฿672k</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
              +11.3%
            </span>
            <span className="text-[11px] text-on-surface-variant">vs this month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Predicted Total This Quarter
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-primary">calendar_month</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-on-surface">฿2.0M</div>
          <div>
            <div className="flex justify-between text-[10px] text-on-surface-variant mb-1">
              <span>฿1.8M (low)</span>
              <span className="font-bold text-primary">89% sure</span>
              <span>฿2.2M (high)</span>
            </div>
            <div className="h-1.5 bg-outline-variant/20 rounded-full">
              <div className="h-1.5 bg-primary rounded-full" style={{ width: "70%" }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Expected Spend Per Visit
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-primary">shopping_bag</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-on-surface">฿271</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
              +9%
            </span>
            <span className="text-[11px] text-on-surface-variant">vs current ฿249</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Revenue You Could Lose
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-red-500">person_alert</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-red-600">฿110K</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full">
              2 customer groups at risk
            </span>
          </div>
        </div>
      </div>

      {/* ── Best Locations to Open Your Next Shop ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 mb-6 overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[15px] text-primary">ssid_chart</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Best Locations to Open Your Next Shop
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Ranked by how well each location matches your current shops, customers, and budget.
            </p>
          </div>
          <button
            type="button"
            className="text-xs font-bold text-primary bg-transparent border-0 cursor-pointer hover:underline whitespace-nowrap"
          >
            VIEW ALL →
          </button>
        </div>

        <div className="px-6 pt-4 pb-0">
          <AiBox text="These locations were picked because they match your customer type, budget, and busy hours. A higher match % means a better chance of strong sales based on similar shops nearby. Start with the highest match — it gives you the best chance of success for your first expansion." />
        </div>

        <div className="grid grid-cols-3 divide-x divide-outline-variant/10 mt-4">
          {EXPANSION_UNITS.map((u) => (
            <div
              key={u.name}
              className="p-6 flex flex-col gap-4 hover:bg-[#F5F2EB]/40 transition-colors"
            >
              {/* Match score */}
              <div
                className={`self-start inline-flex items-center gap-1.5 border rounded-full px-3 py-1 ${u.matchCls}`}
              >
                <div className={`w-2 h-2 rounded-full ${u.dotCls}`} />
                <span className="text-base font-bold">{u.match}%</span>
                <span className="text-[10px] font-bold uppercase">{u.matchTier}</span>
              </div>

              {/* Name */}
              <div>
                <div className="text-sm font-bold text-on-surface">{u.name}</div>
                <div className="text-xs text-on-surface-variant">{u.unit}</div>
              </div>

              {/* Detail rows */}
              <div className="space-y-1.5">
                {[
                  { icon: "straighten", text: u.size },
                  { icon: "payments",   text: u.price },
                  { icon: "location_on",text: `Bangkok · ${u.distance}` },
                  { icon: "groups",     text: u.traffic },
                ].map((d) => (
                  <div key={d.icon} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[13px] text-on-surface-variant/50">
                      {d.icon}
                    </span>
                    {d.text}
                  </div>
                ))}
              </div>

              {/* Est. uplift */}
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-widest text-green-700 mb-0.5">
                  How Much More You Could Earn
                </div>
                <div className="text-sm font-bold text-green-700">{u.revenueUplift} / month</div>
              </div>

              {/* Why this matches you */}
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Why this suits you
                </div>
                <ul className="space-y-1.5">
                  {u.whyMatch.map((w) => (
                    <li key={w} className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[12px] text-primary mt-0.5 flex-shrink-0">
                        check_circle
                      </span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {u.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] text-on-surface-variant border border-outline-variant/30 rounded-full px-2.5 py-0.5 bg-surface-container-low/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <button
                type="button"
                className="mt-auto w-full text-xs font-bold text-primary border border-primary/25 rounded-full py-2.5 bg-transparent cursor-pointer hover:bg-primary/5 transition-colors"
              >
                Request a Visit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Where Do Your Customers Come From? ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 mb-6 overflow-hidden">
        <div className="px-6 pt-5 pb-0 border-b border-outline-variant/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-0.5">Where Do Your Customers Come From?</h3>
              <p className="text-xs text-on-surface-variant">
                See how far people travel to visit your shops — and find areas with potential new customers
              </p>
            </div>
            {/* Store selector */}
            <div className="flex items-center gap-3">
              {CATCHMENT_STORES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setActiveStore(i)}
                  className={
                    i === activeStore
                      ? "bg-[#1C3A1C] text-white text-xs font-bold px-4 py-1.5 rounded-full border-0 cursor-pointer"
                      : "text-xs text-on-surface-variant bg-transparent border-0 cursor-pointer hover:text-on-surface transition-colors"
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-6">
            {(
              [
                { key: "overview",  label: "Overview" },
                { key: "distance",  label: "By Distance" },
                { key: "expansion", label: "Nearby Locations" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setCatchmentTab(t.key)}
                className={`text-sm pb-3 border-b-2 bg-transparent border-t-0 border-x-0 cursor-pointer transition-colors ${
                  catchmentTab === t.key
                    ? "border-[#1C3A1C] text-on-surface font-medium"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Overview ── */}
        {catchmentTab === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-4 gap-6 pb-6 mb-6 border-b border-outline-variant/10">
              {CATCHMENT_STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    {s.label}
                  </div>
                  <div className="text-2xl font-bold text-on-surface mb-0.5">{s.value}</div>
                  <div className={`text-xs ${s.noteCls}`}>{s.note}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-10">
              {/* Zone map */}
              <div>
                <div className="text-xs font-medium text-on-surface mb-3">Where customers travel from</div>
                <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" className="w-full">
                  <ellipse cx="200" cy="125" rx="185" ry="100" fill="#f0f0e8" stroke="#d8d8cc" strokeWidth="1" transform="rotate(-8 200 125)" />
                  <ellipse cx="200" cy="125" rx="118" ry="63" fill="#e4edcc" stroke="#c8d4a8" strokeWidth="1" transform="rotate(-8 200 125)" />
                  <ellipse cx="200" cy="125" rx="54" ry="29" fill="#d0e4a8" stroke="#b4cc7c" strokeWidth="1" transform="rotate(-8 200 125)" />
                  {[[78,68],[322,78],[334,162],[88,172],[148,48],[272,48],[342,112],[68,122],[105,88],[295,88],[310,148],[95,148]].map(([cx, cy], i) => (
                    <circle key={`o${i}`} cx={cx} cy={cy} r="3.5" fill="#c8d4a0" opacity="0.7" />
                  ))}
                  {[[148,94],[252,94],[268,152],[138,156],[172,68],[228,68],[278,122],[120,122],[180,108],[220,108],[260,138],[142,138]].map(([cx, cy], i) => (
                    <circle key={`m${i}`} cx={cx} cy={cy} r="3.5" fill="#a8c870" opacity="0.85" />
                  ))}
                  {[[186,116],[214,116],[188,136],[212,136],[200,110],[200,140],[193,125],[207,125]].map(([cx, cy], i) => (
                    <circle key={`i${i}`} cx={cx} cy={cy} r="3" fill="#6DBF23" opacity="0.9" />
                  ))}
                  <circle cx="200" cy="125" r="7" fill="#1C3A1C" />
                </svg>
                <div className="flex items-center gap-4 mt-1">
                  {[
                    { color: "#1C3A1C", label: "Your shop" },
                    { color: "#6DBF23", label: "0–1 km" },
                    { color: "#a8c870", label: "1–3 km" },
                    { color: "#c8d4a0", label: "3–5 km" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-[10px] text-on-surface-variant">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar chart */}
              <div>
                <div className="text-xs font-medium text-on-surface mb-4">How many customers come from each distance</div>
                <div className="space-y-3">
                  {DISTANCE_BANDS.map((b) => (
                    <div key={b.label} className="flex items-center gap-3">
                      <div className="text-xs text-on-surface-variant w-10 shrink-0 text-right">{b.label}</div>
                      <div className="flex-1 h-4 bg-outline-variant/10 rounded-sm overflow-hidden">
                        <div className="h-4 rounded-sm" style={{ width: `${b.width}%`, background: b.color }} />
                      </div>
                      <div className="text-xs font-bold text-on-surface w-8 shrink-0">{b.pct}%</div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant mt-4 italic leading-relaxed">
                  42% of your customers come from areas not covered by other PTG shops — a good sign that a new location there could do well.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── By Distance ── */}
        {catchmentTab === "distance" && (
          <div className="p-6 flex items-center justify-center py-16 text-sm text-on-surface-variant">
            Distance breakdown coming soon.
          </div>
        )}

        {/* ── Nearby Locations ── */}
        {catchmentTab === "expansion" && (
          <div className="p-6">
            <p className="text-sm text-on-surface-variant mb-5">
              Locations that could reach customers you're not serving yet.
              Sorted by how well the audience there matches your current shoppers.
            </p>
            <div className="divide-y divide-outline-variant/10">
              {EXPANSION_STATIONS.map((s) => (
                <div key={s.name} className="py-5 flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-on-surface mb-0.5">{s.name}</div>
                    <div className="text-xs text-on-surface-variant mb-2">{s.location}</div>
                    <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{s.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] text-on-surface-variant border border-outline-variant/30 rounded-full px-3 py-0.5 bg-surface-container-low/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-on-surface">{s.fit}%</div>
                      <div className="text-[10px] text-on-surface-variant">audience match</div>
                    </div>
                    <button
                      type="button"
                      className="text-xs font-bold text-on-surface border border-outline-variant/30 px-4 py-1.5 rounded cursor-pointer bg-white hover:bg-surface-container-low transition-colors whitespace-nowrap"
                    >
                      Explore ↗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Unusual Things We Noticed + Customers Who Might Stop Coming Back ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Unusual Things We Noticed */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px] text-amber-500">troubleshoot</span>
              </div>
              <span className="text-sm font-bold text-on-surface">Unusual Things We Noticed</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full">
              Last 7 days
            </span>
          </div>

          <AiBox text="These are things that happened this week that don't match your normal pattern — some good, some worth checking. Each one includes a suggested action. Green = good news you can take advantage of. Amber = keep an eye on it. Red = something to look into." />

          <div className="space-y-3 mt-4">
            {ANOMALIES.map((a, i) => (
              <div
                key={i}
                className={`rounded-xl border-l-4 border border-outline-variant/10 p-4 transition-colors hover:border-outline-variant/20 ${a.borderCls}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.iconBg}`}>
                    <span
                      className="material-symbols-outlined text-[16px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {a.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-sm font-bold text-on-surface leading-snug">{a.title}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${a.tagCls}`}>
                        {a.tag}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-2">{a.body}</p>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[12px] text-primary mt-0.5 flex-shrink-0">
                        arrow_forward
                      </span>
                      <p className="text-xs font-medium text-primary">{a.action}</p>
                    </div>
                    <div className="text-[10px] text-on-surface-variant mt-1.5">{a.age}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers Who Might Stop Coming Back */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px] text-red-500">group_off</span>
              </div>
              <span className="text-sm font-bold text-on-surface">Customers Who Might Stop Coming Back</span>
            </div>
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
              2 GROUPS AT RISK
            </span>
          </div>

          <AiBox text="This shows which groups of customers haven't visited in a while and might not come back. The % is how likely they are to stop coming — the higher the number, the more urgent it is. If a row is red, act now. Waiting makes them harder to win back." />

          <div className="space-y-3 mt-4">
            {CHURN_SEGMENTS.map((s) => (
              <div key={s.segment} className={`rounded-xl p-4 ${s.rowBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-bold text-on-surface">{s.segment}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant">Last visit: {s.lastVisit}</span>
                      {s.revenueAtRisk && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          {s.revenueAtRisk} at risk
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className={`text-base font-bold ${s.riskText}`}>{s.risk}%</span>
                      <div className="text-[9px] text-on-surface-variant">chance of leaving</div>
                    </div>
                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer whitespace-nowrap transition-colors ${s.btnCls}`}
                    >
                      {s.action}
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-white/60 rounded-full mb-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${s.barCls}`}
                    style={{ width: `${s.risk}%` }}
                  />
                </div>
                {s.tip && (
                  <p className="text-[10px] text-on-surface-variant italic">{s.tip}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </RetailerBackofficeLayout>
  );
}
