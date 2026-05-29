import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/languageContext";
import { useStoreFilter } from "@/lib/storeFilterContext";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";
import type { MlApiResponse } from "@/agent/ml/mlTypes";
import { STORE_ID_MAP, storeBrand } from "@/lib/retailerStores";

const HOURS = ["06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];

const HEAT_COLORS = [
  "bg-[#F0EDE4]",
  "bg-lime-100",
  "bg-lime-200",
  "bg-[#6ab04c]",
  "bg-[#344e00]",
];

const AGE_PALETTE: Record<string, string> = {
  "18-25": "#344e00",
  "26-35": "#6ab04c",
  "36-45": "#a5d6a7",
  "46+":   "#D4C9B0",
};
const SPEND_PALETTE: Record<string, string> = {
  ">฿400":    "#1C3A1C",
  "฿200-400": "#6ab04c",
  "฿100-200": "#a5d6a7",
  "<฿100":    "#D4C9B0",
};

// ── ML anomaly → action card helpers ────────────────────────────────────────

const ANOMALY_ACTION_UI = {
  good_news: { catEn: "Earn More",    catTh: "เพิ่มรายได้",     icon: "trending_up",   bgCard: "bg-green-50", border: "border-green-100", iconColor: "text-green-600", catColor: "text-green-700", tipColor: "text-green-700" },
  watch:     { catEn: "Watch This",   catTh: "จับตาดู",         icon: "troubleshoot",  bgCard: "bg-amber-50", border: "border-amber-100", iconColor: "text-amber-600", catColor: "text-amber-700", tipColor: "text-amber-700" },
  critical:  { catEn: "Act Now",      catTh: "ดำเนินการด่วน",   icon: "warning",       bgCard: "bg-red-50",   border: "border-red-100",   iconColor: "text-red-500",   catColor: "text-red-600",   tipColor: "text-red-600"   },
} as const;

const ML_DIMENSION_LABEL: Record<string, string> = {
  conv_rate: "conversion rate",
  revenue:   "revenue",
  visitors:  "foot traffic",
  avg_spend: "average spend",
};

const ML_DIMENSION_LABEL_TH: Record<string, string> = {
  conv_rate: "อัตราการซื้อ",
  revenue:   "รายได้",
  visitors:  "จำนวนลูกค้า",
  avg_spend: "ยอดใช้จ่ายเฉลี่ย",
};

// Forward-looking ("this week") action per dimension+direction. EN falls back to
// the ML suggested_action text; TH is curated since the ML text is English-only.
const ACTION_TH: Record<string, string> = {
  "visitors|above":  "เตรียมสต็อกและจัดพนักงานเพิ่มให้พอกับช่วงที่ลูกค้าเยอะ",
  "visitors|below":  "จัดโปรหรือกิจกรรมดึงลูกค้าในช่วงที่เงียบ",
  "avg_spend|above": "หาว่าสินค้าใดทำให้ยอดใช้จ่ายสูงขึ้น แล้วเน้นขายสินค้านั้น",
  "avg_spend|below": "เสนอชุดสินค้าหรือเมนูแนะนำเพื่อเพิ่มยอดต่อบิล",
  "revenue|above":   "ขยายเวลาเปิดหรือเพิ่มพนักงานเพื่อรองรับดีมานด์ที่เพิ่มขึ้น",
  "revenue|below":   "ทบทวนราคาและจัดโปรโมชันเพื่อกระตุ้นยอดขาย",
  "conv_rate|above": "รักษาวิธีจัดวางสินค้าที่ได้ผลนี้ไว้ และนำไปใช้กับสาขาอื่น",
  "conv_rate|below": "ปรับการจัดวางสินค้าหรือจัดโปรเพื่อเพิ่มอัตราการซื้อ",
};

function mlFormatPeriod(p: string) {
  const [year, mon] = p.split("-");
  return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][parseInt(mon, 10) - 1] + " " + year;
}

// Store ↔ ML mapping from the single source of truth (lib/retailerStores).
const ML_STORE_IDS = STORE_ID_MAP;

const STRINGS = {
  en: {
    headerTitle: "How Are Your Shops Doing?",
    headerSubtitle: "Live data from your store metrics — refreshed monthly.",
    kpi1Label: "Earned This Month",
    kpi2Label: "People who visited today",
    kpi3Label: "Visitors who made a purchase",
    kpi3Sub: "based on your latest orders",
    kpi4Label: "How you rank vs other shops",
    kpi4Sub: "platform score",
    aiLabel: "Your shop in plain words",
    actionsTitle: "What You Should Do This Week",
    heatmapTitle: "When Are Your Shops Busiest?",
    heatmapSubtitle: "Average visitors by hour — darker = more people",
    quiet: "Quiet",
    busy: "Busy",
    hoursTitle: "Best & Worst Hours",
    hoursSubtitle: "How busy your shops are hour by hour",
    weekdaysLabel: "Weekdays (Mon–Fri)",
    weekendsLabel: "Weekends (Sat–Sun)",
    customersTitle: "Who Are Your Customers?",
    customersSubtitle: "Age group & how much they spend",
    ageGroupLabel: "Age Group",
    spendLabel: "How Much They Spend",
    conversionTitle: "Are Visitors Buying?",
    conversionSubtitle: "Out of everyone who walked in — how many actually bought something?",
    colStore: "Store",
    colBought: "Bought",
    colVisited: "Visited",
    colPct: "% Bought",
    storeTypeLabel: "Branch",
    earnedLabel: "Earned This Month",
    visitorsLabel: "Daily Visitors",
    spentLabel: "Spent Per Visit",
    visitorsWho: "Visitors who bought something",
    outOf: "out of 100",
    lastSixMonths: "Last 6 months earnings",
    days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
    loading: "Loading from database...",
    noActions: "No action items right now — your shop is running smoothly.",
    topQuartileTag: "Top 25% on platform",
    busiestTag: "Busiest: weekend afternoons",
    salesGrowthTag: "+sales MoM",
  },
  th: {
    headerTitle: "ร้านคุณเป็นยังไงบ้าง?",
    headerSubtitle: "ข้อมูลสดจากตัวชี้วัดร้าน — อัปเดตรายเดือน",
    kpi1Label: "รายได้เดือนนี้",
    kpi2Label: "คนที่มาร้านวันนี้",
    kpi3Label: "ผู้เข้าร้านที่ซื้อสินค้า",
    kpi3Sub: "จากออเดอร์ล่าสุด",
    kpi4Label: "คุณอยู่ตรงไหนเทียบกับร้านอื่น",
    kpi4Sub: "คะแนนในระบบ",
    aiLabel: "สรุปภาพรวมร้านคุณ",
    actionsTitle: "สิ่งที่คุณควรทำสัปดาห์นี้",
    heatmapTitle: "ร้านคุณคึกคักเวลาไหนมากที่สุด?",
    heatmapSubtitle: "จำนวนผู้เข้าร้านเฉลี่ยแต่ละชั่วโมง — เข้มกว่า = คนมากกว่า",
    quiet: "เงียบ",
    busy: "คึกคัก",
    hoursTitle: "ชั่วโมงดีสุดและแย่สุด",
    hoursSubtitle: "ความคึกคักของร้านแต่ละชั่วโมง",
    weekdaysLabel: "วันธรรมดา (จ–ศ)",
    weekendsLabel: "วันหยุด (ส–อา)",
    customersTitle: "ลูกค้าคุณเป็นใคร?",
    customersSubtitle: "กลุ่มอายุและยอดใช้จ่าย",
    ageGroupLabel: "กลุ่มอายุ",
    spendLabel: "ใช้จ่ายเท่าไหร่",
    conversionTitle: "ผู้เข้าร้านซื้อของไหม?",
    conversionSubtitle: "จากทุกคนที่เดินเข้ามา — กี่คนที่ซื้อสินค้าจริงๆ?",
    colStore: "ร้าน",
    colBought: "ซื้อ",
    colVisited: "เข้าร้าน",
    colPct: "% ที่ซื้อ",
    storeTypeLabel: "สาขา",
    earnedLabel: "รายได้เดือนนี้",
    visitorsLabel: "ผู้เข้าร้านต่อวัน",
    spentLabel: "ใช้จ่ายต่อครั้ง",
    visitorsWho: "ผู้เข้าร้านที่ซื้อสินค้า",
    outOf: "จาก 100 คน",
    lastSixMonths: "รายได้ 6 เดือนที่ผ่านมา",
    days: ["จ","อ","พ","พฤ","ศ","ส","อา"],
    loading: "กำลังโหลดจากฐานข้อมูล...",
    noActions: "ยังไม่มีรายการที่ต้องดำเนินการ — ร้านดำเนินไปได้ดี",
    topQuartileTag: "Top 25% บนแพลตฟอร์ม",
    busiestTag: "คึกคักสุด: บ่ายวันหยุด",
    salesGrowthTag: "+ยอดขายเทียบเดือน",
  },
} as const;

function DonutChart({ segs, size = 80 }: { segs: { label: string; pct: number; color: string }[]; size?: number }) {
  let cum = 0;
  const total = segs.reduce((s, x) => s + x.pct, 0) || 1;
  const gradient = segs.map((s) => {
    const from = (cum / total) * 100;
    cum += s.pct;
    const to = (cum / total) * 100;
    return `${s.color} ${from}% ${to}%`;
  }).join(", ");
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

// ── API types ────────────────────────────────────────────────────────────────

type ApiDashData = {
  kpis: {
    totalRevenue: number;
    avgDailyCustomers: number;
    totalMonthlyRent: number;
    patronScore: number | null;
    momAmt: number | null;
    momPct: number | null;
    custMomAmt: number | null;
    custMomPct: number | null;
  };
  branches: { stationId: string; name: string; revenue: number; dailyCustomers: number }[];
};

type ApiDetailsData = {
  heatmap: number[][];
  weekdayBars: { h: string; v: number }[];
  weekendBars: { h: string; v: number }[];
  ageSegments: { label: string; sharePct: number; avgBasket: number | null; growthPct: number | null }[];
  spendSegments: { label: string; sharePct: number }[];
  conversion: { storeId: string; name: string; station: string; orders: number; traffic: number; rate: number }[];
  highlights: {
    storeId: string;
    name: string;
    location: string;
    revenueThb: number;
    revenueMomPct: number;
    customersDaily: number;
    customersMomPct: number;
    basketThb: number;
    conversionPct: number;
    revisitPct: number;
    salesPerSqmThb: number;
    topQuartile: boolean;
    trend: number[];
  }[];
  events?: {
    store_display_id: string | null;
    year_month: string;
    event_name: string;
    event_type: string;
    description: string | null;
    est_traffic_lift_pct: number | null;
    est_sales_lift_pct: number | null;
  }[];
};

export default function RetailerDashboardPage() {
  const { lang } = useLanguage();
  const { storeId } = useStoreFilter();
  const T = STRINGS[lang];

  const [dashData, setDashData] = useState<ApiDashData | null>(null);
  const [details,  setDetails]  = useState<ApiDetailsData | null>(null);
  const [mlData,   setMlData]   = useState<MlApiResponse | null>(null);

  useEffect(() => {
    setDashData(null);
    setDetails(null);
    Promise.all([
      fetch(`/api/retailer/dashboard?storeId=${storeId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/retailer/dashboard-details?storeId=${storeId}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([d, dd]) => {
        if (d)  setDashData(d as ApiDashData);
        if (dd) setDetails(dd as ApiDetailsData);
      })
      .catch(() => {});
  }, [storeId]);

  useEffect(() => {
    fetch("/api/retailer/ml")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: MlApiResponse | null) => { if (d) setMlData(d); })
      .catch(() => {});
  }, []);

  // ── "This week" actions — forward-looking, from THIS month's events + churn
  // risk (not historical anomalies, which are months old and not "this week"). ──
  const actionCards = useMemo(() => {
    const ids = ML_STORE_IDS[storeId] ?? ML_STORE_IDS.all;
    const cards: Array<{
      catEn: string; catTh: string; icon: string; bgCard: string; border: string;
      iconColor: string; catColor: string; tipColor: string;
      titleEn: string; titleTh: string; bodyEn: string; bodyTh: string; actionEn: string; actionTh: string;
    }> = [];

    // 1. This month's relevant event(s) for this store → prepare / leverage
    const evs = details?.events ?? [];
    const latestMonth = evs.reduce((m, e) => (e.year_month > m ? e.year_month : m), "");
    for (const e of evs.filter((e) => e.year_month === latestMonth).slice(0, 2)) {
      const up = (e.est_sales_lift_pct ?? 0) >= 0;
      const ui = up ? ANOMALY_ACTION_UI.good_news : ANOMALY_ACTION_UI.watch;
      cards.push({
        catEn: up ? "Earn More" : "Watch This", catTh: up ? "เพิ่มรายได้" : "จับตาดู",
        icon: ui.icon, bgCard: ui.bgCard, border: ui.border, iconColor: ui.iconColor, catColor: ui.catColor, tipColor: ui.tipColor,
        titleEn: e.event_name, titleTh: e.event_name,
        bodyEn: e.description ?? "", bodyTh: e.description ?? "",
        actionEn: up
          ? `Stock up and promote your best-sellers for ${e.event_name} this week`
          : `Expect softer demand from ${e.event_name} — trim fresh stock and run a small promo`,
        actionTh: up
          ? `เตรียมสต็อกและจัดโปรสินค้าขายดีรับ ${e.event_name} สัปดาห์นี้`
          : `คาดว่าดีมานด์จะลดจาก ${e.event_name} — ลดสต็อกของสดและจัดโปรเล็กๆ`,
      });
    }

    // 2. Top at-risk customer group → re-engage this week
    const risky = (mlData?.churnSegments ?? [])
      .filter((c) => ids.includes(c.store_id) && c.risk_level !== "Low")
      .sort((a, b) => b.avg_risk_prob_pct - a.avg_risk_prob_pct)[0];
    if (risky) {
      const ui = (risky.risk_level === "Critical" || risky.risk_level === "High") ? ANOMALY_ACTION_UI.critical : ANOMALY_ACTION_UI.watch;
      const pct = Math.round(risky.avg_risk_prob_pct);
      const rec = risky.recommended_action && !/no action/i.test(risky.recommended_action) ? risky.recommended_action : "";
      cards.push({
        catEn: "Retain", catTh: "รักษาลูกค้า",
        icon: "group", bgCard: ui.bgCard, border: ui.border, iconColor: ui.iconColor, catColor: ui.catColor, tipColor: ui.tipColor,
        titleEn: `Win back ${risky.age_group} shoppers`, titleTh: `ดึงลูกค้า ${risky.age_group} กลับมา`,
        bodyEn: `${pct}% of your ${risky.age_group} (${risky.spend_range}) customers are at risk of not returning.`,
        bodyTh: `ลูกค้ากลุ่ม ${risky.age_group} (${risky.spend_range}) มีโอกาส ${pct}% ที่จะไม่กลับมา`,
        actionEn: rec || "Send this group a targeted offer this week",
        actionTh: "ส่งข้อเสนอเฉพาะกลุ่มนี้ภายในสัปดาห์นี้",
      });
    }
    return cards.slice(0, 3);
  }, [details, mlData, storeId]);


  const storeName = storeBrand(storeId, lang);

  // ── KPI values from API (no static fallback) ──
  const revenue = dashData
    ? `฿${Math.round(dashData.kpis.totalRevenue).toLocaleString()}`
    : "—";
  const dailyCustomers = dashData ? String(dashData.kpis.avgDailyCustomers) : "—";
  const patronScore    = dashData?.kpis.patronScore != null ? `${dashData.kpis.patronScore}/100` : "—";

  const filteredConversion = details?.conversion ?? [];
  const overallConversion = filteredConversion.length
    ? `${(filteredConversion.reduce((s, c) => s + c.rate, 0) / filteredConversion.length).toFixed(1)}%`
    : "—";

  const highlights = details?.highlights ?? [];

  // Recent events (festivals/holidays/promos) — lets the AI explain WHY metrics moved
  const eventsLine = (details?.events ?? []).length
    ? `Recent events: ${(details!.events!).slice(0, 6).map((e) => `${e.year_month} ${e.event_name}${e.est_sales_lift_pct != null ? ` (~+${e.est_sales_lift_pct}% sales)` : ""}`).join("; ")}`
    : "";

  // ── Build AI dataContext for each section ──
  const dashDataContext = dashData ? [
    `Store: ${storeName}`,
    `Monthly Revenue: ${revenue}`,
    dashData.kpis.momPct != null ? `Revenue MoM: ${dashData.kpis.momPct >= 0 ? "+" : ""}${dashData.kpis.momPct.toFixed(1)}%` : "",
    `Avg Daily Customers: ${dailyCustomers}`,
    dashData.kpis.custMomPct != null ? `Customers MoM: ${dashData.kpis.custMomPct >= 0 ? "+" : ""}${dashData.kpis.custMomPct.toFixed(1)}%` : "",
    `Monthly Rent: ฿${dashData.kpis.totalMonthlyRent.toLocaleString()}`,
    `Conversion Rate: ${overallConversion}`,
    `Patron Score: ${patronScore}`,
    `Action items detected: ${actionCards.length ? actionCards.map((a) => a.titleEn).join("; ") : "none"}`,
    storeId === "all" && highlights.length
      ? `Per-branch: ${highlights.map((h) => `${h.name}: ฿${Math.round(h.revenueThb).toLocaleString()} (${h.revenueMomPct >= 0 ? "+" : ""}${h.revenueMomPct}% MoM), ${h.conversionPct}% conv, ${h.customersDaily} daily customers`).join("; ")}`
      : "",
    eventsLine,
  ].filter(Boolean).join(" | ") : "";

  const heatmapDataContext = details ? [
    `Heatmap (${storeName}) — intensity 0=quiet, 4=busiest`,
    `Days: ${T.days.join(",")}; hours: 06-23`,
    `Peak weekday cells (intensity 4): ${details.heatmap.slice(0, 5).flatMap((row, di) => row.map((v, hi) => v === 4 ? `${T.days[di]} ${hi+6}:00` : "").filter(Boolean)).join(", ") || "none"}`,
    `Peak weekend cells (intensity 4): ${details.heatmap.slice(5).flatMap((row, di) => row.map((v, hi) => v === 4 ? `${T.days[di+5]} ${hi+6}:00` : "").filter(Boolean)).join(", ") || "none"}`,
    `Quiet hours (intensity 0-1 across all days): ${[...Array(18)].map((_, hi) => {
      const allLow = details.heatmap.every((row) => row[hi] <= 1);
      return allLow ? `${hi+6}:00` : "";
    }).filter(Boolean).join(", ") || "none"}`,
  ].join(" | ") : "";

  const hoursDataContext = details ? [
    `Hourly Bars (${storeName})`,
    `Weekday peak hours (v>=80): ${details.weekdayBars.filter((b) => b.v >= 80).map((b) => b.h).join(", ") || "none"}`,
    `Weekend peak hours (v>=80): ${details.weekendBars.filter((b) => b.v >= 80).map((b) => b.h).join(", ") || "none"}`,
    `Quietest weekday hours (v<=30): ${details.weekdayBars.filter((b) => b.v <= 30).map((b) => b.h).join(", ") || "none"}`,
  ].join(" | ") : "";

  const segmentsDataContext = details ? [
    `Segments (${storeName})`,
    `Age: ${details.ageSegments.map((s) => `${s.label}: ${s.sharePct}%${s.avgBasket ? `, ฿${s.avgBasket}/visit` : ""}${s.growthPct != null ? `, ${s.growthPct >= 0 ? "+" : ""}${s.growthPct}% growth` : ""}`).join("; ")}`,
    `Spend bands: ${details.spendSegments.map((s) => `${s.label}: ${s.sharePct}%`).join("; ")}`,
  ].join(" | ") : "";

  const conversionDataContext = details ? [
    `Conversion (${storeName})`,
    `Overall: ${overallConversion}`,
    ...details.conversion.map((c) => `${c.name}: ${c.rate}% (${c.orders} orders / ${c.traffic} visits)`),
    `Platform cafe avg: ~25%`,
  ].join(" | ") : "";

  const ageDonutSegs   = (details?.ageSegments   ?? []).map((s) => ({ label: s.label, pct: s.sharePct, color: AGE_PALETTE[s.label]   ?? "#888" }));
  const spendDonutSegs = (details?.spendSegments ?? []).map((s) => ({ label: s.label, pct: s.sharePct, color: SPEND_PALETTE[s.label] ?? "#888" }));

  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">{T.headerTitle}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{T.headerSubtitle}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
          <div className="text-3xl font-bold text-on-surface">{revenue}</div>
          <div className="text-sm text-on-surface-variant mb-3">
            {storeId === "all" ? (lang === "th" ? "รวมทุกสาขา" : "all branches") : (lang === "th" ? "เดือนนี้" : "this month")}
          </div>
          {dashData?.kpis.momPct != null && dashData.kpis.momAmt != null ? (
            <div className="flex flex-col gap-0.5">
              <span className={`text-xs font-bold ${dashData.kpis.momPct >= 0 ? "text-primary" : "text-red-500"}`}>
                {dashData.kpis.momPct >= 0 ? "+" : ""}{dashData.kpis.momPct.toFixed(1)}%
              </span>
              <span className={`text-xs ${dashData.kpis.momPct >= 0 ? "text-primary" : "text-red-500"}`}>
                {dashData.kpis.momAmt >= 0 ? "+" : ""}฿{Math.abs(dashData.kpis.momAmt).toLocaleString()} vs last month
              </span>
            </div>
          ) : null}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
          <div className="text-3xl font-bold text-on-surface">{dailyCustomers}</div>
          <div className="text-sm text-on-surface-variant mb-3">
            {storeId === "all" ? (lang === "th" ? "เฉลี่ยทุกสาขา" : "avg across branches") : (lang === "th" ? "ลูกค้าเฉลี่ยต่อวัน" : "avg daily customers")}
          </div>
          {dashData?.kpis.custMomPct != null && dashData.kpis.custMomAmt != null ? (
            <div className="flex flex-col gap-0.5">
              <span className={`text-xs font-bold ${dashData.kpis.custMomPct >= 0 ? "text-primary" : "text-red-500"}`}>
                {dashData.kpis.custMomPct >= 0 ? "+" : ""}{dashData.kpis.custMomPct.toFixed(1)}%
              </span>
              <span className={`text-xs ${dashData.kpis.custMomPct >= 0 ? "text-primary" : "text-red-500"}`}>
                {dashData.kpis.custMomAmt >= 0 ? "+" : ""}{dashData.kpis.custMomAmt} visitors/day vs last month
              </span>
            </div>
          ) : null}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
          <div className="text-3xl font-bold text-on-surface">{overallConversion}</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi3Sub}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
          <div className="text-3xl font-bold text-on-surface">{patronScore}</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi4Sub}</div>
        </div>
      </div>

      {/* AI Advisor — section-level summary */}
      <div className="mb-6">
        <AiSuggestionInline
          role="retailer"
          pageContext="Retailer Dashboard"
          dataContext={dashDataContext}
          label={T.aiLabel}
        />
      </div>

      {/* What You Should Do This Week — day-by-day plan + material alerts */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
          <h3 className="text-base font-bold text-on-surface">{T.actionsTitle}</h3>
        </div>
        <p className="text-xs text-on-surface-variant mb-4">
          {lang === "th"
            ? "สิ่งที่ควรทำสัปดาห์นี้ จากเหตุการณ์ปัจจุบันและความเสี่ยงลูกค้าของร้าน"
            : "What to do this week, based on your store's current events and customer-retention risk"}
        </p>

        {actionCards.length === 0 ? (
          <p className="text-sm text-on-surface-variant py-4 text-center">{T.noActions}</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {actionCards.map((a, i) => (
              <div key={i} className={`${a.bgCard} border ${a.border} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined text-[15px] ${a.iconColor}`}>{a.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${a.catColor}`}>
                    {lang === "th" ? a.catTh : a.catEn}
                  </span>
                </div>
                <p className="text-sm font-semibold text-on-surface mb-1">
                  {lang === "th" ? a.titleTh : a.titleEn}
                </p>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-2">
                  {lang === "th" ? a.bodyTh : a.bodyEn}
                </p>
                <div className={`flex items-start gap-1 ${a.tipColor}`}>
                  <span className="material-symbols-outlined text-[13px] mt-0.5 flex-shrink-0">arrow_forward</span>
                  <p className="text-xs font-semibold">
                    {lang === "th" ? `สัปดาห์นี้: ${a.actionTh}` : `This week: ${a.actionEn}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Heatmap + Best & Worst Hours */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-on-surface mb-0.5">{T.heatmapTitle}</h3>
          <p className="text-xs text-on-surface-variant mb-4">{T.heatmapSubtitle}</p>
          <div>
            <div className="w-full">
              <div className="flex items-center mb-1 gap-0.5">
                <div className="w-9 flex-shrink-0" />
                {HOURS.map((h) => (
                  <div key={h} className="flex-1 text-center text-[9px] text-on-surface-variant">{h}</div>
                ))}
              </div>
              {(details?.heatmap ?? [[],[],[],[],[],[],[]]).map((row, di) => (
                <div key={T.days[di]} className="flex items-center gap-0.5 mb-0.5">
                  <div className="w-9 text-[10px] text-on-surface-variant text-right pr-2 flex-shrink-0">{T.days[di]}</div>
                  {(row.length ? row : Array(18).fill(0)).map((level, hi) => (
                    <div key={hi} className={`flex-1 rounded-sm ${HEAT_COLORS[level]}`} style={{ height: 18 }} />
                  ))}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] text-on-surface-variant">{T.quiet}</span>
                {HEAT_COLORS.map((c, i) => <div key={i} className={`w-5 h-3 rounded-sm ${c}`} />)}
                <span className="text-[10px] text-on-surface-variant">{T.busy}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <AiSuggestionInline
              role="retailer"
              pageContext="Retailer Dashboard — Hourly Heatmap"
              dataContext={heatmapDataContext}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="text-base font-bold text-on-surface mb-0.5">{T.hoursTitle}</h3>
            <p className="text-xs text-on-surface-variant">{T.hoursSubtitle}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-on-surface mb-2">{T.weekdaysLabel}</div>
            <div className="flex items-end gap-[3px] h-14">
              {(details?.weekdayBars ?? Array(18).fill({ h: "", v: 0 })).map((b, i) => (
                <div key={i} className="flex-1 h-full flex items-end" title={`${b.h}:00 — ${b.v}%`}>
                  <div className="w-full rounded-t-sm bg-[#6ab04c]" style={{ height: `${b.v}%`, minHeight: b.v > 0 ? 3 : 0 }} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[3px] mt-1">
              {(details?.weekdayBars ?? Array(18).fill({ h: "", v: 0 })).map((b, i) => (
                <div key={i} className="flex-1 text-center text-[8px] text-on-surface-variant">
                  {["06","09","12","15","18","21"].includes(b.h) ? b.h : ""}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-on-surface mb-2">{T.weekendsLabel}</div>
            <div className="flex items-end gap-[3px] h-14">
              {(details?.weekendBars ?? Array(18).fill({ h: "", v: 0 })).map((b, i) => (
                <div key={i} className="flex-1 h-full flex items-end" title={`${b.h}:00 — ${b.v}%`}>
                  <div className="w-full rounded-t-sm bg-[#344e00]" style={{ height: `${b.v}%`, minHeight: b.v > 0 ? 3 : 0 }} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-[3px] mt-1">
              {(details?.weekendBars ?? Array(18).fill({ h: "", v: 0 })).map((b, i) => (
                <div key={i} className="flex-1 text-center text-[8px] text-on-surface-variant">
                  {["06","09","12","15","18","21"].includes(b.h) ? b.h : ""}
                </div>
              ))}
            </div>
          </div>
          <AiSuggestionInline
            role="retailer"
            pageContext="Retailer Dashboard — Hourly Bars"
            dataContext={hoursDataContext}
          />
        </div>
      </div>

      {/* Who Are Your Customers? + Are Visitors Buying? */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-on-surface mb-0.5">{T.customersTitle}</h3>
          <p className="text-xs text-on-surface-variant mb-5">{T.customersSubtitle}</p>

          <div className="mb-5">
            <div className="text-xs font-semibold text-on-surface mb-3">{T.ageGroupLabel}</div>
            <div className="flex items-center gap-4">
              <DonutChart segs={ageDonutSegs} size={72} />
              <div className="space-y-1.5">
                {ageDonutSegs.map((s) => (
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
            <div className="text-xs font-semibold text-on-surface mb-3">{T.spendLabel}</div>
            <div className="flex items-center gap-4">
              <DonutChart segs={spendDonutSegs} size={72} />
              <div className="space-y-1.5">
                {spendDonutSegs.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-on-surface-variant w-16">{s.label}</span>
                    <span className="font-bold text-on-surface">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <AiSuggestionInline
              role="retailer"
              pageContext="Retailer Dashboard — Customer Segments"
              dataContext={segmentsDataContext}
            />
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-on-surface mb-0.5">{T.conversionTitle}</h3>
          <p className="text-xs text-on-surface-variant mb-4">{T.conversionSubtitle}</p>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/20 pb-2 mb-1">
            <span>{T.colStore}</span>
            <span className="text-right">{T.colBought}</span>
            <span className="text-right">{T.colVisited}</span>
            <span className="text-right">{T.colPct}</span>
            <span />
          </div>

          <div className="flex-1 divide-y divide-outline-variant/10">
            {filteredConversion.map((c) => (
              <div key={c.storeId} className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr] items-center py-3">
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

          <div className="mt-4">
            <AiSuggestionInline
              role="retailer"
              pageContext="Retailer Dashboard — Conversion"
              dataContext={conversionDataContext}
            />
          </div>
        </div>
      </div>

      {/* Store Report Cards (live from DB) */}
      <div className={`grid gap-6 ${highlights.length === 1 ? "grid-cols-1 max-w-xl" : "grid-cols-2"}`}>
        {highlights.map((h) => {
          const accentColor = "text-primary";
          const barColor    = "bg-primary";
          const trendVals = h.trend.length ? h.trend : [0, 0, 0, 0, 0, 0];
          const trendMax  = Math.max(...trendVals);
          const trendMin  = Math.min(...trendVals);
          const pts = trendVals.map((v, i) => {
            const x = (i / (trendVals.length - 1 || 1)) * 100;
            const y = 32 - ((v - trendMin) / (trendMax - trendMin || 1)) * 28;
            return `${x},${y}`;
          }).join(" ");

          const highlightContext = [
            `Store: ${h.name} (${h.location})`,
            `Monthly Revenue: ฿${(h.revenueThb / 1000).toFixed(0)}k (${h.revenueMomPct >= 0 ? "+" : ""}${h.revenueMomPct}% MoM)`,
            `Daily Customers: ${h.customersDaily} (${h.customersMomPct >= 0 ? "+" : ""}${h.customersMomPct}% MoM)`,
            `Basket Size: ฿${h.basketThb}/visit`,
            `Conversion: ${h.conversionPct}%`,
            `Revisit Rate: ${h.revisitPct}%`,
            `Sales per sqm: ฿${h.salesPerSqmThb}/sqm`,
            `6-month revenue trend (฿k): ${trendVals.join(", ")}`,
            `Platform standing: ${h.topQuartile ? "Top 25%" : "Median range"}`,
          ].join(" | ");

          return (
            <div key={h.storeId} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[14px] ${accentColor}`}>star</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${accentColor}`}>
                    {h.topQuartile ? T.topQuartileTag : T.salesGrowthTag}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-surface-variant">{T.storeTypeLabel}</div>
                  <div className="text-xs font-semibold text-on-surface">{h.name}</div>
                </div>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-on-surface">{h.name}</div>
                  <div className="text-xs text-on-surface-variant">{h.location}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{T.earnedLabel}</div>
                  <div className="text-xl font-bold text-on-surface">฿{Math.round(h.revenueThb / 1000)}k</div>
                  <div className={`text-xs font-semibold ${h.revenueMomPct >= 0 ? "text-primary" : "text-red-500"}`}>{h.revenueMomPct >= 0 ? "+" : ""}{h.revenueMomPct}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{T.visitorsLabel}</div>
                  <div className="text-xl font-bold text-on-surface">{h.customersDaily}</div>
                  <div className={`text-xs font-semibold ${h.customersMomPct >= 0 ? "text-primary" : "text-red-500"}`}>{h.customersMomPct >= 0 ? "+" : ""}{h.customersMomPct}%</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{T.spentLabel}</div>
                  <div className="text-xl font-bold text-on-surface">฿{h.basketThb}</div>
                </div>
              </div>

              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">{T.visitorsWho}</span>
                <span className={`font-bold ${accentColor}`}>{h.conversionPct} {T.outOf}</span>
              </div>
              <div className="h-2 bg-[#F5F2EB] rounded-full overflow-hidden mb-4">
                <div className={`h-2 ${barColor} rounded-full`} style={{ width: `${h.conversionPct}%` }} />
              </div>

              <div className="mb-3">
                <div className="text-[10px] text-on-surface-variant mb-1">{T.lastSixMonths}</div>
                <svg viewBox="0 0 100 36" className="w-full h-8" preserveAspectRatio="none">
                  <polyline points={pts} fill="none" stroke="#6ab04c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {trendVals.map((v, i) => {
                    const x = (i / (trendVals.length - 1 || 1)) * 100;
                    const y = 32 - ((v - trendMin) / (trendMax - trendMin || 1)) * 28;
                    return i === trendVals.length - 1 ? (
                      <circle key={i} cx={x} cy={y} r="2.5" fill="#6ab04c" />
                    ) : null;
                  })}
                </svg>
              </div>

              <AiSuggestionInline
                role="retailer"
                pageContext={`Retailer Dashboard — ${h.name} Report Card`}
                dataContext={highlightContext}
              />
            </div>
          );
        })}
      </div>
    </RetailerBackofficeLayout>
  );
}
