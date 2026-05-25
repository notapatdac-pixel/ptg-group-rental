"use client";
import { useState } from "react";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { useStoreFilter, type StoreId } from "@/lib/storeFilterContext";

// ── Static data (same across all stores) ────────────────────────────────────

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

const CATCHMENT_STATS = [
  { label: "Avg trip to your shop",   value: "4.2 km", note: "within target range", noteCls: "text-green-600" },
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

// ── Per-store ML data ────────────────────────────────────────────────────────

type Anomaly = {
  icon: string; iconBg: string; title: string; body: string;
  action: string; tag: string; tagCls: string; age: string; borderCls: string;
};
type ChurnSeg = {
  segment: string; lastVisit: string; risk: number; revenueAtRisk: string | null;
  action: string; barCls: string; rowBg: string; riskText: string; btnCls: string; tip: string | null;
};
type StoreML = {
  kpi1Val: string; kpi1Sub: string; kpi1Trend: string;
  kpi2Val: string; kpi2Sub: string; kpi2Trend: string;
  kpi3Val: string; kpi3Sub: string; kpi3Trend: string;
  kpi4Val: string; kpi4Sub: string; kpi4Trend: string;
  aiEarn: string; aiEarnFull: string; aiPct: string;
  aiQuarter: string; aiConf: string;
  aiSpend: string; aiSpendCurr: string; aiSpendPct: string;
  aiLoss: string; aiRiskNote: string;
  anomalies: Anomaly[];
  churn: ChurnSeg[];
};

const ML_BY_STORE: Record<StoreId, StoreML> = {
  all: {
    kpi1Val: "฿672k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+11.3% vs this month",
    kpi2Val: "฿2.0M",  kpi2Sub: "฿1.8M – ฿2.2M range",     kpi2Trend: "89% confidence",
    kpi3Val: "฿271",   kpi3Sub: "per customer visit",        kpi3Trend: "+9% vs current ฿249",
    kpi4Val: "฿110K",  kpi4Sub: "if no action taken",        kpi4Trend: "2 customer groups at risk",
    aiEarn: "฿672k", aiEarnFull: "฿672,000 next month", aiPct: "+11.3%",
    aiQuarter: "฿2.0M", aiConf: "89%",
    aiSpend: "฿271 per visit", aiSpendCurr: "฿249", aiSpendPct: "+9%",
    aiLoss: "฿110,000/year", aiRiskNote: "two groups of loyal customers haven't visited in a while",
    anomalies: [
      {
        icon: "trending_up", iconBg: "bg-green-100 text-green-600",
        title: "Tuesday was busier than usual",
        body: "Your shops got about 34% more customers than normal on Tuesday — possibly a nearby event brought extra people in.",
        action: "Add 1–2 staff next Tuesday · could earn +฿8,400 more.",
        tag: "Good news", tagCls: "bg-green-100 text-green-700", age: "2 days ago", borderCls: "border-l-green-400",
      },
      {
        icon: "remove_shopping_cart", iconBg: "bg-amber-100 text-amber-600",
        title: "Customers spent less on Friday",
        body: "People spent about 18% less than usual on Friday afternoon — likely because a promotion ended and customers started buying less per visit.",
        action: "Run a weekend bundle deal to bring average spend back up.",
        tag: "Watch", tagCls: "bg-amber-100 text-amber-700", age: "4 days ago", borderCls: "border-l-amber-400",
      },
      {
        icon: "warning", iconBg: "bg-red-100 text-red-600",
        title: "Monday sales were lower than expected",
        body: "Revenue on Monday was 22% lower than expected — could be a technical issue with the payment system, or some transactions weren't recorded.",
        action: "Check your payment records and make sure all Monday orders are saved correctly.",
        tag: "Check this", tagCls: "bg-red-100 text-red-600", age: "6 days ago", borderCls: "border-l-red-400",
      },
    ],
    churn: [
      { segment: "Big spenders · 46+", lastVisit: "18 days ago", risk: 74, revenueAtRisk: "฿62,000/yr", action: "Re-engage", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "Send a loyalty reward or personal discount — this group responds well to feeling special." },
      { segment: "26–35 year olds · Mid-spenders", lastVisit: "14 days ago", risk: 61, revenueAtRisk: "฿48,000/yr", action: "Re-engage", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A time-limited deal or referral bonus works well for this group." },
      { segment: "36–45 year olds · Budget-friendly", lastVisit: "9 days ago", risk: 38, revenueAtRisk: "฿24,000/yr", action: "Watch", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Not urgent — check again in 2 weeks before taking action." },
      { segment: "18–25 year olds · Young shoppers", lastVisit: "3 days ago", risk: 8, revenueAtRisk: null, action: "Healthy", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },

  coffee: {
    kpi1Val: "฿285k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+8.4% vs this month",
    kpi2Val: "฿820K",  kpi2Sub: "฿740K – ฿900K range",     kpi2Trend: "87% confidence",
    kpi3Val: "฿245",   kpi3Sub: "per customer visit",        kpi3Trend: "+6% vs current ฿231",
    kpi4Val: "฿42K",   kpi4Sub: "if no action taken",        kpi4Trend: "1 customer group at risk",
    aiEarn: "฿285k", aiEarnFull: "฿285,000 next month", aiPct: "+8.4%",
    aiQuarter: "฿820K", aiConf: "87%",
    aiSpend: "฿245 per visit", aiSpendCurr: "฿231", aiSpendPct: "+6%",
    aiLoss: "฿42,000/year", aiRiskNote: "frequent morning regulars haven't visited in over 2 weeks",
    anomalies: [
      {
        icon: "trending_up", iconBg: "bg-green-100 text-green-600",
        title: "Tuesday morning rush was unusually busy",
        body: "Coffee Corner had 31% more customers than normal on Tuesday morning — likely linked to a nearby office event that brought extra foot traffic.",
        action: "Prepare extra stock on Tuesday mornings · potential +฿4,200 gain.",
        tag: "Good news", tagCls: "bg-green-100 text-green-700", age: "2 days ago", borderCls: "border-l-green-400",
      },
      {
        icon: "remove_shopping_cart", iconBg: "bg-amber-100 text-amber-600",
        title: "Afternoon spend dropped on Friday",
        body: "Customers spent about 16% less per visit on Friday afternoon — the post-promotion dip seems sharper here than at other stores.",
        action: "Try a 3pm–6pm bundle offer on Fridays to lift afternoon baskets.",
        tag: "Watch", tagCls: "bg-amber-100 text-amber-700", age: "4 days ago", borderCls: "border-l-amber-400",
      },
      {
        icon: "warning", iconBg: "bg-red-100 text-red-600",
        title: "Monday revenue gap detected",
        body: "Sales on Monday were 19% below forecast — this could be a quiet trading period or a missed transaction batch.",
        action: "Cross-check Monday's payment logs with your POS receipts.",
        tag: "Check this", tagCls: "bg-red-100 text-red-600", age: "6 days ago", borderCls: "border-l-red-400",
      },
    ],
    churn: [
      { segment: "Morning regulars · 36–50", lastVisit: "16 days ago", risk: 68, revenueAtRisk: "฿42,000/yr", action: "Re-engage", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A free drink loyalty stamp or personalised message works well for habitual morning visitors." },
      { segment: "Students · 18–24", lastVisit: "11 days ago", risk: 45, revenueAtRisk: "฿31,000/yr", action: "Re-engage", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A study-hour deal or group discount brings this segment back quickly." },
      { segment: "Afternoon visitors · 26–35", lastVisit: "5 days ago", risk: 22, revenueAtRisk: "฿18,000/yr", action: "Watch", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Still within normal return window — revisit in 10 days." },
      { segment: "Daily commuters · all ages", lastVisit: "1 day ago", risk: 6, revenueAtRisk: null, action: "Healthy", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },

  quick: {
    kpi1Val: "฿198k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+14.2% vs this month",
    kpi2Val: "฿560K",  kpi2Sub: "฿490K – ฿630K range",     kpi2Trend: "91% confidence",
    kpi3Val: "฿188",   kpi3Sub: "per customer visit",        kpi3Trend: "+12% vs current ฿168",
    kpi4Val: "฿68K",   kpi4Sub: "if no action taken",        kpi4Trend: "1 customer group at risk",
    aiEarn: "฿198k", aiEarnFull: "฿198,000 next month", aiPct: "+14.2%",
    aiQuarter: "฿560K", aiConf: "91%",
    aiSpend: "฿188 per visit", aiSpendCurr: "฿168", aiSpendPct: "+12%",
    aiLoss: "฿68,000/year", aiRiskNote: "weekend shoppers aged 26–35 haven't returned in 13 days",
    anomalies: [
      {
        icon: "trending_up", iconBg: "bg-green-100 text-green-600",
        title: "Weekend traffic surged 41%",
        body: "Quick Mart had 41% more customers on Saturday and Sunday than normal — likely driven by the new residential buildings opening nearby.",
        action: "Stock up on grab-and-go items before weekends · potential +฿6,800/weekend.",
        tag: "Good news", tagCls: "bg-green-100 text-green-700", age: "2 days ago", borderCls: "border-l-green-400",
      },
      {
        icon: "remove_shopping_cart", iconBg: "bg-amber-100 text-amber-600",
        title: "Thursday afternoon had fewer customers",
        body: "Foot traffic dropped 24% on Thursday afternoons over the past 3 weeks — possibly the nearby office has changed its work-from-home schedule.",
        action: "Consider a Thursday afternoon promotion to bring people in during the slow window.",
        tag: "Watch", tagCls: "bg-amber-100 text-amber-700", age: "3 days ago", borderCls: "border-l-amber-400",
      },
      {
        icon: "warning", iconBg: "bg-red-100 text-red-600",
        title: "Possible missing transactions on Wednesday",
        body: "Wednesday showed 26% fewer completed transactions than expected — this doesn't match foot traffic data and may indicate a payment system issue.",
        action: "Review Wednesday's transaction logs and reconcile against foot traffic records.",
        tag: "Check this", tagCls: "bg-red-100 text-red-600", age: "5 days ago", borderCls: "border-l-red-400",
      },
    ],
    churn: [
      { segment: "Frequent shoppers · 36–45", lastVisit: "20 days ago", risk: 71, revenueAtRisk: "฿58,000/yr", action: "Re-engage", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "This group responds to convenience perks — a fast-checkout or loyalty punch card works well." },
      { segment: "Weekend families · 26–40", lastVisit: "13 days ago", risk: 52, revenueAtRisk: "฿39,000/yr", action: "Re-engage", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A family bundle deal or weekend-only discount brings this group back." },
      { segment: "Occasional visitors · mixed ages", lastVisit: "7 days ago", risk: 29, revenueAtRisk: "฿12,000/yr", action: "Watch", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Still within normal range — no action needed yet." },
      { segment: "Daily commuters · all ages", lastVisit: "1 day ago", risk: 5, revenueAtRisk: null, action: "Healthy", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },

  lumina: {
    kpi1Val: "฿189k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+13.7% vs this month",
    kpi2Val: "฿540K",  kpi2Sub: "฿480K – ฿600K range",     kpi2Trend: "85% confidence",
    kpi3Val: "฿412",   kpi3Sub: "per customer visit",        kpi3Trend: "+7% vs current ฿385",
    kpi4Val: "฿38K",   kpi4Sub: "if no action taken",        kpi4Trend: "2 customer groups at risk",
    aiEarn: "฿189k", aiEarnFull: "฿189,000 next month", aiPct: "+13.7%",
    aiQuarter: "฿540K", aiConf: "85%",
    aiSpend: "฿412 per visit", aiSpendCurr: "฿385", aiSpendPct: "+7%",
    aiLoss: "฿38,000/year", aiRiskNote: "two groups — premium buyers and weekend brunch regulars — haven't been in for over 2 weeks",
    anomalies: [
      {
        icon: "trending_up", iconBg: "bg-green-100 text-green-600",
        title: "Saturday brunch peak hit a new high",
        body: "Lumina had 29% more customers on Saturday than its previous best — social media mentions from a food blogger may have driven the spike.",
        action: "Plan a limited Saturday special to capitalise on the momentum · potential +฿5,600 extra.",
        tag: "Good news", tagCls: "bg-green-100 text-green-700", age: "2 days ago", borderCls: "border-l-green-400",
      },
      {
        icon: "remove_shopping_cart", iconBg: "bg-amber-100 text-amber-600",
        title: "Premium drink orders dipped mid-week",
        body: "Orders for signature drinks (฿200+) fell 21% on Tuesday and Wednesday — customers may be switching to simpler, lower-cost items.",
        action: "Introduce a mid-week pairing deal to encourage premium drink orders.",
        tag: "Watch", tagCls: "bg-amber-100 text-amber-700", age: "4 days ago", borderCls: "border-l-amber-400",
      },
      {
        icon: "warning", iconBg: "bg-red-100 text-red-600",
        title: "New customer visits dropped on Tuesday",
        body: "First-time visitor count on Tuesday was 33% lower than the weekly average — this could signal reduced visibility or a local competitor pulling attention.",
        action: "Check if nearby promotions are running and consider a window display or signage update.",
        tag: "Check this", tagCls: "bg-red-100 text-red-600", age: "6 days ago", borderCls: "border-l-red-400",
      },
    ],
    churn: [
      { segment: "Premium buyers · 35–50", lastVisit: "22 days ago", risk: 76, revenueAtRisk: "฿68,000/yr", action: "Re-engage", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "This high-value group responds to exclusivity — a private tasting invite or early-access offer works well." },
      { segment: "Weekend brunch crowd · 26–40", lastVisit: "15 days ago", risk: 58, revenueAtRisk: "฿44,000/yr", action: "Re-engage", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A weekend set-menu deal or reservation perk brings this group back." },
      { segment: "First-time visitors", lastVisit: "8 days ago", risk: 31, revenueAtRisk: "฿16,000/yr", action: "Watch", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Not urgent — a welcome-back message in 1–2 weeks should be enough." },
      { segment: "Loyalty members · all ages", lastVisit: "2 days ago", risk: 6, revenueAtRisk: null, action: "Healthy", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },
};

// ── AiBox component ──────────────────────────────────────────────────────────

function AiBox({ text }: { text: string }) {
  return (
    <div className="bg-[#F5F2EB] rounded-xl p-4 mt-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        <span className="text-[9px] font-bold tracking-widest text-primary uppercase">Our Suggestion</span>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">{text}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MlPredictionsPage() {
  const [catchmentTab, setCatchmentTab] = useState<"overview" | "distance" | "expansion">("overview");
  const [activeStore, setActiveStore] = useState(0);
  const { storeId } = useStoreFilter();
  const md = ML_BY_STORE[storeId];

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
            What&apos;s likely to happen next — and what you can do about it.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 border border-outline-variant text-on-surface text-xs font-medium px-4 py-2.5 rounded-full bg-white cursor-pointer hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">refresh</span>Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">What You&apos;ll Likely Earn Next Month</div>
          <div className="text-3xl font-bold text-on-surface">{md.kpi1Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{md.kpi1Sub}</div>
          <span className="text-xs font-bold text-primary">{md.kpi1Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Predicted Total This Quarter</div>
          <div className="text-3xl font-bold text-on-surface">{md.kpi2Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{md.kpi2Sub}</div>
          <span className="text-xs font-bold text-primary">{md.kpi2Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Expected Spend Per Visit</div>
          <div className="text-3xl font-bold text-on-surface">{md.kpi3Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{md.kpi3Sub}</div>
          <span className="text-xs font-bold text-primary">{md.kpi3Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">Revenue You Could Lose</div>
          <div className="text-3xl font-bold text-red-600">{md.kpi4Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{md.kpi4Sub}</div>
          <span className="text-xs font-bold text-red-500">{md.kpi4Trend}</span>
        </div>
      </div>

      {/* ── AI Predictions Summary ── */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-4 mb-6 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">auto_awesome</span>
        <div>
          <div className="text-xs font-bold text-primary mb-1">AI Predictions for Next Month</div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your {storeId === "all" ? "shops are" : `${["Coffee Corner","Quick Mart","Lumina Artisan Roastery"].find((n,i)=>(["coffee","quick","lumina"][i]===storeId)) ?? "shop"} is`} on track to earn{" "}
            <strong className="text-on-surface">{md.aiEarnFull}</strong> — up {md.aiPct} from this month, with a quarterly total likely reaching{" "}
            <strong className="text-on-surface">{md.aiQuarter}</strong> ({md.aiConf} confidence). Customers are expected to spend{" "}
            <strong className="text-on-surface">{md.aiSpend}</strong> on average, up {md.aiSpendPct} from today&apos;s {md.aiSpendCurr}. However, {md.aiRiskNote} — you could lose up to{" "}
            <strong className="text-on-surface">{md.aiLoss}</strong> if you don&apos;t act soon.
          </p>
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
            <div key={u.name} className="p-6 flex flex-col gap-4 hover:bg-[#F5F2EB]/40 transition-colors">
              <div className={`self-start inline-flex items-center gap-1.5 border rounded-full px-3 py-1 ${u.matchCls}`}>
                <div className={`w-2 h-2 rounded-full ${u.dotCls}`} />
                <span className="text-base font-bold">{u.match}%</span>
                <span className="text-[10px] font-bold uppercase">{u.matchTier}</span>
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">{u.name}</div>
                <div className="text-xs text-on-surface-variant">{u.unit}</div>
              </div>
              <div className="space-y-1.5">
                {[
                  { icon: "straighten", text: u.size },
                  { icon: "payments",   text: u.price },
                  { icon: "location_on",text: `Bangkok · ${u.distance}` },
                  { icon: "groups",     text: u.traffic },
                ].map((d) => (
                  <div key={d.icon} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[13px] text-on-surface-variant/50">{d.icon}</span>
                    {d.text}
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <div className="text-[9px] font-bold uppercase tracking-widest text-green-700 mb-0.5">How Much More You Could Earn</div>
                <div className="text-sm font-bold text-green-700">{u.revenueUplift} / month</div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Why this suits you</div>
                <ul className="space-y-1.5">
                  {u.whyMatch.map((w) => (
                    <li key={w} className="flex items-start gap-1.5 text-xs text-on-surface-variant">
                      <span className="material-symbols-outlined text-[12px] text-primary mt-0.5 flex-shrink-0">check_circle</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {u.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-on-surface-variant border border-outline-variant/30 rounded-full px-2.5 py-0.5 bg-surface-container-low/50">
                    {tag}
                  </span>
                ))}
              </div>
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

        {catchmentTab === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-4 gap-6 pb-6 mb-6 border-b border-outline-variant/10">
              {CATCHMENT_STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{s.label}</div>
                  <div className="text-2xl font-bold text-on-surface mb-0.5">{s.value}</div>
                  <div className={`text-xs ${s.noteCls}`}>{s.note}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-10">
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

        {catchmentTab === "distance" && (
          <div className="p-6 flex items-center justify-center py-16 text-sm text-on-surface-variant">
            Distance breakdown coming soon.
          </div>
        )}

        {catchmentTab === "expansion" && (
          <div className="p-6">
            <p className="text-sm text-on-surface-variant mb-5">
              Locations that could reach customers you&apos;re not serving yet. Sorted by how well the audience there matches your current shoppers.
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
                        <span key={tag} className="text-[11px] text-on-surface-variant border border-outline-variant/30 rounded-full px-3 py-0.5 bg-surface-container-low/50">
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
                      Explore
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
            {md.anomalies.map((a, i) => (
              <div key={i} className={`rounded-xl border-l-4 border border-outline-variant/10 p-4 transition-colors hover:border-outline-variant/20 ${a.borderCls}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.iconBg}`}>
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-sm font-bold text-on-surface leading-snug">{a.title}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${a.tagCls}`}>{a.tag}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-2">{a.body}</p>
                    <div className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[12px] text-primary mt-0.5 flex-shrink-0">arrow_forward</span>
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
              {md.churn.filter(c => c.risk >= 50).length} GROUPS AT RISK
            </span>
          </div>
          <AiBox text="This shows which groups of customers haven't visited in a while and might not come back. The % is how likely they are to stop coming — the higher the number, the more urgent it is. If a row is red, act now. Waiting makes them harder to win back." />
          <div className="space-y-3 mt-4">
            {md.churn.map((s) => (
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
                    <button type="button" className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer whitespace-nowrap transition-colors ${s.btnCls}`}>
                      {s.action}
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-white/60 rounded-full mb-2">
                  <div className={`h-1.5 rounded-full transition-all ${s.barCls}`} style={{ width: `${s.risk}%` }} />
                </div>
                {s.tip && <p className="text-[10px] text-on-surface-variant italic">{s.tip}</p>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </RetailerBackofficeLayout>
  );
}
