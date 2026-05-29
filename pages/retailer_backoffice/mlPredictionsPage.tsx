"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";
import { useStoreFilter, type StoreId } from "@/lib/storeFilterContext";
import { useLanguage } from "@/lib/languageContext";
import { STORE_ID_MAP, storeBrand } from "@/lib/retailerStores";
import type {
  MlApiResponse,
  MlSalesForecast,
  MlChurnSegment,
  MlAnomalyAlert,
  MlMatchingScore,
} from "@/agent/ml/mlTypes";

// ── Static UI strings ────────────────────────────────────────────────────────

const STRINGS = {
  en: {
    aiPowered: "AI-Powered · Updated just now",
    pageTitle: "ML Predictions for Your Shop",
    pageSubtitle: "What's likely to happen next — and what you can do about it.",
    refresh: "Refresh",
    kpi1Label: "What You'll Likely Earn Next Month",
    kpi2Label: "Predicted Total This Quarter",
    kpi3Label: "Expected Spend Per Visit",
    kpi4Label: "Revenue You Could Lose",
    aiPredLabel: "AI Predictions for Next Month",
    whereCustomers: "Where Do Your Customers Come From?",
    whereCustomersSubtitle: "See how far people travel to visit your shops — and find areas with potential new customers",
    tabOverview: "Overview",
    tabLocations: "Locations",
    bestLocations: "Best Locations to Open Your Next Shop",
    whereCustomersTravel: "Where customers travel from",
    howManyCustomers: "How many customers come from each distance",
    mapModalTitle: "Where Customers Travel From",
    howMuchEarn: "How Much More You Could Earn",
    whySuitsYou: "Why this suits you",
    exploreOnMap: "Explore on Map",
    unusualThings: "Unusual Things We Noticed",
    last7Days: "Latest month",
    churnTitle: "Customers Who Might Stop Coming Back",
    groupsAtRisk: "GROUPS AT RISK",
    lastVisit: "Last visit:",
    chanceLeaving: "chance of leaving",
    ourSuggestion: "Our Suggestion",
    perMonth: "/ month",
    catchmentAiBox: "These locations were picked because they match your customer type, budget, and busy hours. A higher match % means a better chance of strong sales based on similar shops nearby. Start with the highest match — it gives you the best chance of success for your first expansion.",
    anomalyAiBox: "These are patterns detected in your historical data that fall outside your normal range — some good, some worth checking. Each one includes a suggested action. Green = good news you can take advantage of. Amber = keep an eye on it. Red = something to look into.",
    churnAiBox: "This shows which groups of customers are showing early signs of reduced engagement. The % is the estimated probability of declining revenue from that segment. If a row is red, act now.",
    mapLegendShop: "Your shop",
    atRisk: "at risk",
    noAnomalies: "No unusual patterns detected in your recent data.",
    noChurn: "No significant churn risk detected.",
    loading: "Loading predictions…",
    vsLastMonth: "vs last month",
    confidence: "confidence",
    contactForPricing: "Contact for pricing",
  },
  th: {
    aiPowered: "AI วิเคราะห์ · อัปเดตเพิ่งกี้นี้",
    pageTitle: "ML Predictions สำหรับร้านของคุณ",
    pageSubtitle: "คาดการณ์สิ่งที่จะเกิดขึ้น — และสิ่งที่คุณควรทำ",
    refresh: "รีเฟรช",
    kpi1Label: "รายได้ที่คาดการณ์เดือนหน้า",
    kpi2Label: "ยอดรวมที่คาดไตรมาสนี้",
    kpi3Label: "ยอดใช้จ่ายต่อครั้งที่คาดไว้",
    kpi4Label: "รายได้ที่อาจสูญเสีย",
    aiPredLabel: "การคาดการณ์ AI สำหรับเดือนหน้า",
    whereCustomers: "ลูกค้าคุณมาจากไหน?",
    whereCustomersSubtitle: "ดูระยะทางที่ลูกค้าเดินทางมาหาร้าน และค้นหาพื้นที่ที่มีลูกค้าใหม่",
    tabOverview: "ภาพรวม",
    tabLocations: "ทำเล",
    bestLocations: "ทำเลที่ดีที่สุดสำหรับร้านใหม่",
    whereCustomersTravel: "ลูกค้าเดินทางมาจากที่ไหน",
    howManyCustomers: "สัดส่วนลูกค้าแต่ละระยะทาง",
    mapModalTitle: "ลูกค้าเดินทางมาจากที่ไหน",
    howMuchEarn: "รายได้เพิ่มเติมที่คาดว่าจะได้",
    whySuitsYou: "เหตุผลที่เหมาะกับคุณ",
    exploreOnMap: "ดูบนแผนที่",
    unusualThings: "สิ่งผิดปกติที่เราพบ",
    last7Days: "เดือนล่าสุด",
    churnTitle: "ลูกค้าที่อาจไม่กลับมา",
    groupsAtRisk: "กลุ่มเสี่ยง",
    lastVisit: "มาครั้งล่าสุด:",
    chanceLeaving: "โอกาสที่จะไม่กลับมา",
    ourSuggestion: "คำแนะนำของเรา",
    perMonth: "/ เดือน",
    catchmentAiBox: "ทำเลเหล่านี้ถูกคัดเลือกเพราะตรงกับประเภทลูกค้า งบประมาณ และชั่วโมงเร่งด่วนของคุณ match % ที่สูงขึ้นหมายถึงโอกาสที่ดีขึ้น เริ่มจากทำเลที่มี match % สูงสุดเพื่อโอกาสสำเร็จสูงสุด",
    anomalyAiBox: "รูปแบบที่ตรวจพบในข้อมูลที่ไม่ตรงกับช่วงปกติ — บางอย่างเป็นข่าวดี บางอย่างควรตรวจสอบ สีเขียว = ข่าวดี สีเหลือง = ควรจับตาดู สีแดง = ควรตรวจสอบ",
    churnAiBox: "แสดงกลุ่มลูกค้าที่แสดงสัญญาณการลดการมีส่วนร่วม ตัวเลข % คือโอกาสที่รายได้จากกลุ่มนั้นจะลดลง แถวสีแดงต้องดำเนินการทันที",
    mapLegendShop: "ร้านของคุณ",
    atRisk: "มีความเสี่ยง",
    noAnomalies: "ไม่พบรูปแบบผิดปกติในข้อมูลล่าสุด",
    noChurn: "ไม่พบความเสี่ยงการสูญเสียลูกค้าที่มีนัยสำคัญ",
    loading: "กำลังโหลดการคาดการณ์…",
    vsLastMonth: "เทียบกับเดือนที่แล้ว",
    confidence: "ความมั่นใจ",
    contactForPricing: "ติดต่อสอบถามราคา",
  },
} as const;

// ── Catchment helpers ─────────────────────────────────────────────────────────

// Distance bands MUST match the values stored in ml_customer_origins.
const BAND_ORDER = ["0-1km","1-2km","2-5km","5-10km","10-20km",">20km"] as const;
const BAND_COLORS: Record<string, string> = {
  "0-1km":"#1C3A1C","1-2km":"#2d5a1b","2-5km":"#6DBF23",
  "5-10km":"#9bcc6b","10-20km":"#c5dba8",">20km":"#d4d4d4",
};
const BAND_MIDPOINTS: Record<string, number> = {
  "0-1km":0.5,"1-2km":1.5,"2-5km":3.5,"5-10km":7.5,"10-20km":15.0,">20km":25.0,
};
const BAND_LABEL: Record<string, string> = {
  "0-1km":"0–1 km","1-2km":"1–2 km","2-5km":"2–5 km",
  "5-10km":"5–10 km","10-20km":"10–20 km",">20km":"20+ km",
};

const MAP_LEGEND_EN = [
  { color: "#1C3A1C", label: "Your shop" },
  { color: "#2d5a1b", label: "0–1 km" },
  { color: "#6DBF23", label: "1–2 km" },
  { color: "#9bcc6b", label: "2–5 km" },
  { color: "#c5dba8", label: "5–10 km" },
  { color: "#d4d4d4", label: "10+ km" },
];

const MAP_LEGEND_TH = [
  { color: "#1C3A1C", label: "ร้านของคุณ" },
  { color: "#2d5a1b", label: "0–1 กม." },
  { color: "#6DBF23", label: "1–2 กม." },
  { color: "#9bcc6b", label: "2–5 กม." },
  { color: "#c5dba8", label: "5–10 กม." },
  { color: "#d4d4d4", label: "10+ กม." },
];

// Store ↔ ML mapping + display names come from the single source of truth.

// ── Number helpers ────────────────────────────────────────────────────────────

function fmtThb(n: number): string {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `฿${Math.round(n / 1_000)}K`;
  return `฿${Math.round(n).toLocaleString()}`;
}

function fmtThbFull(n: number): string {
  return `฿${Math.round(n).toLocaleString()}`;
}

function fmtPct(frac: number): string {
  const pct = frac * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

function fmtPctSigned(frac: number): string {
  const pct = frac * 100;
  const sign = pct >= 0 ? "+" : "-";
  return `${sign}${Math.abs(pct).toFixed(1)}%`;
}

// ── Anomaly helpers ───────────────────────────────────────────────────────────

const SEVERITY_UI = {
  good_news: {
    icon: "trending_up",
    iconBg: "bg-green-100 text-green-600",
    tag: "Good news",
    tagCls: "bg-green-100 text-green-700",
    borderCls: "border-l-green-400",
  },
  watch: {
    icon: "troubleshoot",
    iconBg: "bg-amber-100 text-amber-600",
    tag: "Watch",
    tagCls: "bg-amber-100 text-amber-700",
    borderCls: "border-l-amber-400",
  },
  critical: {
    icon: "warning",
    iconBg: "bg-red-100 text-red-600",
    tag: "Check this",
    tagCls: "bg-red-100 text-red-600",
    borderCls: "border-l-red-400",
  },
} as const;

const DIMENSION_LABEL: Record<string, string> = {
  conv_rate: "conversion rate",
  revenue: "revenue",
  visitors: "foot traffic",
  avg_spend: "average spend",
};

const DIMENSION_LABEL_TH: Record<string, string> = {
  conv_rate: "อัตราการซื้อ",
  revenue: "รายได้",
  visitors: "จำนวนลูกค้า",
  avg_spend: "ยอดใช้จ่ายเฉลี่ย",
};

const SEVERITY_TAG_TH: Record<string, string> = {
  good_news: "ข่าวดี",
  watch: "ควรจับตา",
  critical: "ควรตรวจสอบ",
};

// Curated Thai next-week action per dimension+direction (ML suggested_action is English).
const ANOMALY_ACTION_TH: Record<string, string> = {
  "visitors|above":  "เตรียมสต็อกและจัดพนักงานเพิ่มให้พอกับช่วงที่ลูกค้าเยอะ",
  "visitors|below":  "จัดโปรหรือกิจกรรมดึงลูกค้าในช่วงที่เงียบ",
  "avg_spend|above": "หาว่าสินค้าใดทำให้ยอดใช้จ่ายสูงขึ้น แล้วเน้นขายสินค้านั้น",
  "avg_spend|below": "เสนอชุดสินค้าหรือเมนูแนะนำเพื่อเพิ่มยอดต่อบิล",
  "revenue|above":   "ขยายเวลาเปิดหรือเพิ่มพนักงานเพื่อรองรับดีมานด์ที่เพิ่มขึ้น",
  "revenue|below":   "ทบทวนราคาและจัดโปรโมชันเพื่อกระตุ้นยอดขาย",
  "conv_rate|above": "รักษาวิธีจัดวางสินค้าที่ได้ผลนี้ไว้ และนำไปใช้กับสาขาอื่น",
  "conv_rate|below": "ปรับการจัดวางสินค้าหรือจัดโปรเพื่อเพิ่มอัตราการซื้อ",
};

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function anomalyToDisplay(a: MlAnomalyAlert, lang: "en" | "th") {
  const ui = SEVERITY_UI[a.severity] ?? SEVERITY_UI.watch;
  const dim = DIMENSION_LABEL[a.anomaly_dimension] ?? a.anomaly_dimension;
  const dimTh = DIMENSION_LABEL_TH[a.anomaly_dimension] ?? a.anomaly_dimension;
  const dirWord = a.direction === "above" ? "above" : "below";
  const dirTh = a.direction === "above" ? "สูงกว่า" : "ต่ำกว่า";
  const pctStr = `${Math.round(Math.abs(a.pct_deviation) * 100)}%`;
  const period = formatPeriod(a.period);

  // Split suggested_action on " — " to get observation vs action
  const parts = a.suggested_action.split(" — ");
  const observation = parts[0] ?? a.suggested_action;
  const actionEn = (parts[1] ?? "Review this pattern and take appropriate action.").replace(/\.$/, "");
  const actionTh = ANOMALY_ACTION_TH[`${a.anomaly_dimension}|${a.direction}`] ?? "ตรวจสอบรูปแบบนี้และดำเนินการตามความเหมาะสม";

  return {
    icon: ui.icon,
    iconBg: ui.iconBg,
    title: lang === "th"
      ? `${dimTh}${dirTh}ปกติ ${pctStr}`
      : `${dim.charAt(0).toUpperCase() + dim.slice(1)} was ${pctStr} ${dirWord} normal`,
    body: lang === "th"
      ? `${dimTh}อยู่ที่ ${pctStr} ${dirTh}ช่วงปกติ ใน${period}`
      : `${observation} (${period})`,
    action: lang === "th"
      ? `สัปดาห์นี้: ${actionTh}`
      : `This week: ${actionEn.charAt(0).toUpperCase() + actionEn.slice(1)}`,
    tag: lang === "th" ? (SEVERITY_TAG_TH[a.severity] ?? ui.tag) : ui.tag,
    tagCls: ui.tagCls,
    age: period,
    borderCls: ui.borderCls,
  };
}

// ── Churn helpers ─────────────────────────────────────────────────────────────

const RISK_UI = {
  Critical: { barCls: "bg-red-600",   rowBg: "bg-red-50",   riskText: "text-red-700",   btnCls: "bg-red-700 hover:bg-red-800 text-white",       action: "Re-engage", actionTh: "ดึงกลับมา" },
  High:     { barCls: "bg-red-500",   rowBg: "bg-red-50",   riskText: "text-red-600",   btnCls: "bg-red-700 hover:bg-red-800 text-white",       action: "Re-engage", actionTh: "ดึงกลับมา" },
  Medium:   { barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white",   action: "Watch",     actionTh: "จับตาดู"   },
  Low:      { barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white",   action: "Healthy",   actionTh: "ปกติดี"    },
} as const;

function spendRangeLabel(range: string): string {
  if (range === "<100") return "Budget (<฿100)";
  if (range === ">400") return "Premium (>฿400)";
  return `฿${range}`;
}

function churnToDisplay(seg: MlChurnSegment) {
  const ui = RISK_UI[seg.risk_level] ?? RISK_UI.Low;
  return {
    segment: `${seg.age_group} · ${spendRangeLabel(seg.spend_range)}`,
    risk: Math.round(seg.avg_risk_prob_pct),
    revenueAtRisk: seg.revenue_at_risk_annual > 0
      ? `${fmtThbFull(seg.revenue_at_risk_annual)}/yr`
      : null,
    action: ui.action,
    actionTh: ui.actionTh,
    barCls: ui.barCls,
    rowBg: ui.rowBg,
    riskText: ui.riskText,
    btnCls: ui.btnCls,
    tip: seg.recommended_action !== "Healthy momentum — no action required."
      ? seg.recommended_action
      : null,
  };
}

// ── Matching score helpers ────────────────────────────────────────────────────

const MATCH_LABEL_UI: Record<string, { matchCls: string; dotCls: string; matchTier: string }> = {
  EXCELLENT: { matchCls: "text-emerald-700 bg-emerald-50 border-emerald-200", dotCls: "bg-emerald-500", matchTier: "Excellent" },
  STRONG:    { matchCls: "text-amber-700 bg-amber-50 border-amber-200",       dotCls: "bg-amber-400",   matchTier: "Strong"    },
  MODERATE:  { matchCls: "text-blue-700 bg-blue-50 border-blue-200",          dotCls: "bg-blue-400",    matchTier: "Moderate"  },
};

function trafficLabel(level: string): string {
  if (level === "high")   return "High foot traffic";
  if (level === "medium") return "Medium foot traffic";
  return "Low foot traffic";
}

function matchingToExpansion(m: MlMatchingScore) {
  const labelUi = MATCH_LABEL_UI[m.match_label] ?? MATCH_LABEL_UI.EXCELLENT;
  const tags: string[] = [trafficLabel(m.traffic_level)];
  if (m.match_label === "EXCELLENT") tags.push("Top match");
  tags.push(m.station_id);

  const whyMatch = [
    "One of the highest compatibility scores across all PTG locations",
    `${trafficLabel(m.traffic_level)} — supports your customer volume`,
    `Estimated ${fmtThbFull(m.estimated_earn_low_thb)}–${fmtThbFull(m.estimated_earn_high_thb)}/month potential`,
  ];

  return {
    name: m.station_name || m.station_id,
    stationId: m.station_id,
    match: Math.round(m.match_pct),
    matchTier: labelUi.matchTier,
    matchCls: labelUi.matchCls,
    dotCls: labelUi.dotCls,
    revenueUplift: `${fmtThbFull(m.estimated_earn_low_thb)}–${fmtThbFull(m.estimated_earn_high_thb)}`,
    tags,
    whyMatch,
    traffic: trafficLabel(m.traffic_level),
  };
}

// ── AiBox component ──────────────────────────────────────────────────────────

function AiBox({ text, suggestionLabel }: { text: string; suggestionLabel: string }) {
  return (
    <div className="bg-[#D9EDD9] rounded-xl p-4 mt-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        <span className="text-[9px] font-bold tracking-widest text-primary uppercase">{suggestionLabel}</span>
      </div>
      <p className="text-xs text-on-surface-variant leading-relaxed">{text}</p>
    </div>
  );
}

// ── Leaflet loader ────────────────────────────────────────────────────────────
// _document.tsx loads Leaflet CSS but not the JS. Inject the script once (shared
// across both map instances) and resolve when window.L is ready.

let _leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (_leafletPromise) return _leafletPromise;
  _leafletPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-leaflet="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).L));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.dataset.leaflet = "true";
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return _leafletPromise;
}

// ── CatchmentRadarMap component ──────────────────────────────────────────────

function CatchmentRadarMap({
  center,
  allMarkers,
  showAllMarkers = false,
  height = 240,
  interactive = false,
}: {
  center: [number, number];
  allMarkers?: Array<{ label: string; coords: [number, number] }>;
  showAllMarkers?: boolean;
  height?: number;
  interactive?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any = null;
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current || !L) return;

        map = L.map(mapRef.current, { zoomControl: interactive, scrollWheelZoom: interactive }).setView(center, 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          opacity: 0.5,
        }).addTo(map);

        const rings = [
          { r: 8000, color: "#d4d4d4", opacity: 0.18 },
          { r: 5000, color: "#c5dba8", opacity: 0.22 },
          { r: 3000, color: "#9bcc6b", opacity: 0.28 },
          { r: 2000, color: "#6DBF23", opacity: 0.32 },
          { r: 1000, color: "#2d5a1b", opacity: 0.38 },
        ];
        rings.forEach(({ r, color, opacity }) => {
          L.circle(center, { radius: r, color: "transparent", fillColor: color, fillOpacity: opacity }).addTo(map);
        });

        if (showAllMarkers && allMarkers?.length) {
          allMarkers.forEach(({ coords, label }) => {
            const icon = L.divIcon({
              className: "",
              html: `<div style="width:12px;height:12px;background:#1C3A1C;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);" title="${label}"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            });
            L.marker(coords, { icon }).addTo(map);
          });
        } else {
          const icon = L.divIcon({
            className: "",
            html: `<div style="width:14px;height:14px;background:#1C3A1C;border:2.5px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          });
          L.marker(center, { icon }).addTo(map);
        }
      })
      .catch(() => { /* Leaflet failed to load — leave placeholder */ });

    return () => { cancelled = true; if (map) map.remove(); };
  }, [center, allMarkers, showAllMarkers, interactive]);

  return <div ref={mapRef} className="w-full rounded-xl overflow-hidden" style={{ height }} />;
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-3" />
      <div className="h-8 bg-gray-100 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MlPredictionsPage() {
  const [catchmentTab, setCatchmentTab] = useState<"overview" | "expansion">("overview");
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mlData, setMlData] = useState<MlApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const { storeId } = useStoreFilter();
  const { lang } = useLanguage();
  const router = useRouter();
  const T = STRINGS[lang];
  const mapLegend = lang === "th" ? MAP_LEGEND_TH : MAP_LEGEND_EN;

  // Fetch ML data once on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/retailer/ml")
      .then((r) => r.json())
      .then((data: MlApiResponse) => { setMlData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Compute display values from raw API data + current storeId
  const computed = useMemo(() => {
    if (!mlData) return null;

    const storeIds = STORE_ID_MAP[storeId] ?? STORE_ID_MAP.all;

    // Forecasts
    const forecasts = mlData.forecasts.filter((f) => storeIds.includes(f.store_id));
    const totalRevenue = forecasts.reduce((s, f) => s + (f.predicted_revenue_thb ?? 0), 0);
    const totalLower = forecasts.reduce((s, f) => s + (f.forecast_lower_thb ?? 0), 0);
    const totalUpper = forecasts.reduce((s, f) => s + (f.forecast_upper_thb ?? 0), 0);
    const totalQuarterly = forecasts.reduce((s, f) => s + (f.predicted_quarterly_thb ?? 0), 0);
    const qLower = forecasts.reduce((s, f) => s + (f.quarterly_lower_thb ?? 0), 0);
    const qUpper = forecasts.reduce((s, f) => s + (f.quarterly_upper_thb ?? 0), 0);
    const avgPctChange = forecasts.length
      ? forecasts.reduce((s, f) => s + (f.pct_change_vs_last ?? 0), 0) / forecasts.length
      : 0;
    // Weighted avg spend (weighted by predicted revenue)
    const totalWeight = forecasts.reduce((s, f) => s + (f.predicted_revenue_thb ?? 0), 0);
    const avgSpend = totalWeight > 0
      ? forecasts.reduce((s, f) => s + (f.predicted_avg_spend_thb ?? 0) * (f.predicted_revenue_thb ?? 0), 0) / totalWeight
      : 0;
    const avgSpendPctChange = forecasts.length
      ? forecasts.reduce((s, f) => s + (f.pct_change_spend_vs_last ?? 0), 0) / forecasts.length
      : 0;
    const confidence = forecasts.length
      ? Math.round(forecasts.reduce((s, f) => s + (f.confidence_pct ?? 0), 0) / forecasts.length * 100)
      : 99;

    // Churn — aggregate by (age_group, spend_range) so each segment appears ONCE
    // across the selected stores. Multiple stores share the same segment types,
    // which would otherwise show as duplicate rows in the list.
    const churnAgg = new Map<string, { age: string; spend: string; n: number; riskW: number; revenue: number; topRisk: number; action: string }>();
    for (const s of mlData.churnSegments.filter((x) => storeIds.includes(x.store_id))) {
      const key = `${s.age_group}|${s.spend_range}`;
      const n = s.n_monthly_customers ?? 0;
      const risk = s.avg_risk_prob_pct ?? 0;
      const e = churnAgg.get(key) ?? { age: s.age_group, spend: s.spend_range, n: 0, riskW: 0, revenue: 0, topRisk: -1, action: "" };
      e.n += n;
      e.riskW += risk * (n || 1);
      e.revenue += s.revenue_at_risk_annual ?? 0;
      if (risk > e.topRisk) { e.topRisk = risk; e.action = s.recommended_action ?? ""; }
      churnAgg.set(key, e);
    }
    const riskLevelFor = (p: number): MlChurnSegment["risk_level"] =>
      p >= 65 ? "Critical" : p >= 50 ? "High" : p >= 35 ? "Medium" : "Low";
    const churnSegs: MlChurnSegment[] = [...churnAgg.values()].map((e) => {
      const risk = e.n > 0 ? e.riskW / e.n : e.topRisk;
      return {
        store_id: storeId,
        age_group: e.age,
        spend_range: e.spend,
        n_monthly_customers: e.n,
        avg_risk_prob_pct: risk,
        revenue_at_risk_annual: e.revenue,
        risk_level: riskLevelFor(risk),
        recommended_action: e.action,
        model_version: "agg",
      };
    });
    const riskSegs = churnSegs.filter((s) => s.risk_level !== "Low");
    const totalRiskAnnual = riskSegs.reduce((s, c) => s + (c.revenue_at_risk_annual ?? 0), 0);
    const riskGroups = riskSegs.length;

    // Top 5 unique churn segments sorted by risk descending
    const topChurn = [...churnSegs]
      .sort((a, b) => b.avg_risk_prob_pct - a.avg_risk_prob_pct)
      .slice(0, 5)
      .map(churnToDisplay);

    // Anomalies (already filtered to material ≥3% in the API). Dedupe identical
    // findings so the multi-store "all" view doesn't repeat the same insight.
    const seenAnomaly = new Set<string>();
    const anomalies = mlData.anomalyAlerts
      .filter((a) => storeIds.includes(a.store_id))
      .map((a) => anomalyToDisplay(a, lang))
      .filter((a) => { if (seenAnomaly.has(a.title)) return false; seenAnomaly.add(a.title); return true; });

    // Expansion units from matching scores (already filtered to non-current stations, top 5)
    const expansionUnits = mlData.matchingScores.slice(0, 3).map(matchingToExpansion);

    // ── Customer origins (catchment) ─────────────────────────────────────────
    const origins = mlData.customerOrigins.filter((o) => storeIds.includes(o.store_id));
    const bandAgg: Record<string, { sum: number; count: number }> = {};
    for (const o of origins) {
      if (!bandAgg[o.distance_band]) bandAgg[o.distance_band] = { sum: 0, count: 0 };
      bandAgg[o.distance_band].sum   += Number(o.customer_pct);
      bandAgg[o.distance_band].count += 1;
    }
    const distanceBands = BAND_ORDER
      .filter((b) => bandAgg[b])
      .map((b) => {
        const pct = bandAgg[b].sum / bandAgg[b].count;
        return { band: b, label: BAND_LABEL[b], pct: Math.round(pct), color: BAND_COLORS[b] };
      });
    const maxPct = Math.max(...distanceBands.map((d) => d.pct), 1);
    const distanceBandsDisplay = distanceBands.map((d) => ({
      ...d,
      width: Math.round((d.pct / maxPct) * 100),
    }));

    // Core catchment = customers within 2 km (the two nearest bands).
    const nearestCorePct = Math.round(
      (bandAgg["0-1km"]?.sum ?? 0) / (bandAgg["0-1km"]?.count ?? 1) +
      (bandAgg["1-2km"]?.sum ?? 0) / (bandAgg["1-2km"]?.count ?? 1)
    );
    const avgTripKm = BAND_ORDER.reduce((sum, b) => {
      if (!bandAgg[b]) return sum;
      return sum + BAND_MIDPOINTS[b] * (bandAgg[b].sum / bandAgg[b].count) / 100;
    }, 0);

    // Station coordinates and reach
    const catchmentForStore = mlData.storeCatchment.filter((s) => storeIds.includes(s.store_id));
    const totalReachK = catchmentForStore.reduce((sum, s) => sum + s.reach_5km_k, 0);

    // Map center: average coords if multiple stores, else single store coords
    const mapCenter: [number, number] = catchmentForStore.length
      ? [
          catchmentForStore.reduce((s, c) => s + c.lat, 0) / catchmentForStore.length,
          catchmentForStore.reduce((s, c) => s + c.lng, 0) / catchmentForStore.length,
        ]
      : [13.7634, 100.5490];
    const allStoreMarkers = mlData.storeCatchment.map((s) => ({
      label: s.station_name,
      coords: [s.lat, s.lng] as [number, number],
    }));

    // ── Event knowledge — explains WHY metrics moved ──────────────────────────
    // Events are keyed by station display_id (STN-xxx) or null (portfolio-wide);
    // storeId here is also STN-xxx / "all".
    const relevantEvents = (mlData.events ?? []).filter(
      (e) => e.store_display_id === null || storeId === "all" || e.store_display_id === storeId
    );
    const eventsLine = relevantEvents.length
      ? `Recent events that may explain changes: ${relevantEvents.slice(0, 6).map((e) => `${e.year_month} ${e.event_name}${e.est_sales_lift_pct != null ? ` (~+${e.est_sales_lift_pct}% sales)` : ""}`).join("; ")}`
      : "";

    return {
      // KPI 1 — next month revenue
      kpi1Val: fmtThbFull(totalRevenue),
      kpi1Sub: `${lang === "th" ? "ช่วง" : "range"} ${fmtThbFull(totalLower)}–${fmtThbFull(totalUpper)}`,
      kpi1Trend: `${fmtPctSigned(avgPctChange)} ${T.vsLastMonth}`,
      // KPI 2 — quarterly
      kpi2Val: fmtThbFull(totalQuarterly),
      kpi2Sub: `${fmtThbFull(qLower)} – ${fmtThbFull(qUpper)} range`,
      kpi2Trend: `${confidence}% ${T.confidence}`,
      // KPI 3 — avg spend
      kpi3Val: fmtThbFull(Math.round(avgSpend)),
      kpi3Sub: lang === "th" ? "ต่อการเข้าร้านหนึ่งครั้ง" : "per customer visit",
      kpi3Trend: `${fmtPctSigned(avgSpendPctChange)} ${T.vsLastMonth}`,
      // KPI 4 — revenue at risk
      kpi4Val: totalRiskAnnual > 0 ? fmtThbFull(totalRiskAnnual) : "฿0",
      kpi4Sub: lang === "th" ? "หากไม่ดำเนินการ" : "if no action taken",
      kpi4Trend: riskGroups > 0
        ? `${riskGroups} ${lang === "th" ? "กลุ่มลูกค้ามีความเสี่ยง" : `customer group${riskGroups > 1 ? "s" : ""} at risk`}`
        : (lang === "th" ? "ไม่มีกลุ่มเสี่ยง" : "No groups at risk"),
      // AI summary text
      storeName: storeBrand(storeId, lang),
      aiEarnFull: fmtThbFull(totalRevenue),
      aiPct: fmtPctSigned(avgPctChange),
      aiQuarter: fmtThb(totalQuarterly),
      aiConf: confidence,
      aiSpend: fmtThbFull(Math.round(avgSpend)),
      aiSpendPct: fmtPctSigned(avgSpendPctChange),
      aiLoss: totalRiskAnnual > 0 ? `${fmtThbFull(totalRiskAnnual)}/year` : null,
      aiRiskNote: riskGroups > 0
        ? `${riskGroups} customer segment${riskGroups > 1 ? "s" : ""} showing early churn signals`
        : null,
      // Sections
      anomalies,
      topChurn,
      expansionUnits,
      riskGroups,
      eventsLine,
      // Catchment
      distanceBandsDisplay,
      nearestCorePct,
      avgTripKm,
      totalReachK,
      mapCenter,
      allStoreMarkers,
    };
  }, [mlData, storeId, lang, T]);

  return (
    <RetailerBackofficeLayout>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">{T.pageTitle}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{T.pageSubtitle}</p>
      </div>

      {/* ── KPI Cards ── */}
      {loading || !computed ? (
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[0, 1, 2, 3].map((i) => <KpiSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
            <div className="text-3xl font-bold text-on-surface">{computed.kpi1Val}</div>
            <div className="text-sm text-on-surface-variant mb-3">{computed.kpi1Sub}</div>
            <span className="text-xs font-bold text-primary">{computed.kpi1Trend}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
            <div className="text-3xl font-bold text-on-surface">{computed.kpi2Val}</div>
            <div className="text-sm text-on-surface-variant mb-3">{computed.kpi2Sub}</div>
            <span className="text-xs font-bold text-primary">{computed.kpi2Trend}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
            <div className="text-3xl font-bold text-on-surface">{computed.kpi3Val}</div>
            <div className="text-sm text-on-surface-variant mb-3">{computed.kpi3Sub}</div>
            <span className="text-xs font-bold text-primary">{computed.kpi3Trend}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
            <div className={`text-3xl font-bold ${computed.riskGroups > 0 ? "text-red-600" : "text-green-600"}`}>{computed.kpi4Val}</div>
            <div className="text-sm text-on-surface-variant mb-3">{computed.kpi4Sub}</div>
            <span className={`text-xs font-bold ${computed.riskGroups > 0 ? "text-red-500" : "text-green-600"}`}>{computed.kpi4Trend}</span>
          </div>
        </div>
      )}

      {/* ── AI Predictions Summary (live, action-oriented, bilingual) ── */}
      {computed && (
        <div className="mb-6">
          <AiSuggestionInline
            role="retailer"
            pageContext="ML Predictions — Next Month Forecast"
            label={T.aiPredLabel}
            lang={lang}
            dataContext={[
              `Store(s): ${computed.storeName}`,
              `Predicted revenue next month: ${computed.aiEarnFull} (${computed.aiPct} vs last month)`,
              `Predicted quarterly total: ${computed.aiQuarter} at ${computed.aiConf}% confidence`,
              `Expected spend per visit: ${computed.aiSpend} (${computed.aiSpendPct} vs last month)`,
              computed.aiRiskNote && computed.aiLoss
                ? `Churn risk: ${computed.aiRiskNote}, up to ${computed.aiLoss} in revenue at risk`
                : `No significant churn risk detected`,
              computed.eventsLine,
            ].filter(Boolean).join(" | ")}
          />
        </div>
      )}

      {/* ── Where Do Your Customers Come From? ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 mb-6 overflow-hidden">
        <div className="px-6 pt-5 pb-0 border-b border-outline-variant/10">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-on-surface mb-0.5">{T.whereCustomers}</h3>
            <p className="text-xs text-on-surface-variant">{T.whereCustomersSubtitle}</p>
          </div>
          <div className="flex gap-6">
            {(
              [
                { key: "overview",  label: T.tabOverview },
                { key: "expansion", label: T.tabLocations },
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

        {catchmentTab === "overview" && computed && (
          <div className="p-6">
            <div className="grid grid-cols-4 gap-6 pb-6 mb-6 border-b border-outline-variant/10">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  {lang === "th" ? "ระยะทางเฉลี่ยมาหาร้าน" : "Avg trip to your shop"}
                </div>
                <div className="text-2xl font-bold text-on-surface mb-0.5">{computed.avgTripKm.toFixed(1)} km</div>
                <div className="text-xs text-green-600">{lang === "th" ? "อยู่ในช่วงที่ตั้งเป้า" : "within target range"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  {lang === "th" ? "ลูกค้าใกล้สุด" : "Nearest customers"}
                </div>
                <div className="text-2xl font-bold text-on-surface mb-0.5">0–2 km</div>
                <div className="text-xs text-on-surface-variant">
                  {lang === "th" ? `${computed.nearestCorePct}% ของลูกค้า` : `${computed.nearestCorePct}% of customers`}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  {lang === "th" ? "จำนวนคนในรัศมี" : "People within reach"}
                </div>
                <div className="text-2xl font-bold text-on-surface mb-0.5">{computed.totalReachK}K</div>
                <div className="text-xs text-on-surface-variant">{lang === "th" ? "ภายในรัศมี 5 กม." : "within 5 km radius"}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                  {lang === "th" ? "พื้นที่ที่ยังไม่ได้เข้าถึง" : "Untapped areas nearby"}
                </div>
                <div className="text-2xl font-bold text-on-surface mb-0.5">{computed.expansionUnits.length}</div>
                <div className="text-xs text-amber-600">{lang === "th" ? "ทำเลที่แนะนำ" : "locations suggested"}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <div className="text-xs font-medium text-on-surface mb-3">{T.whereCustomersTravel}</div>
                <div className="relative">
                  <CatchmentRadarMap
                    center={computed.mapCenter}
                    allMarkers={computed.allStoreMarkers}
                    showAllMarkers={storeId === "all"}
                  />
                  <button
                    type="button"
                    onClick={() => setMapExpanded(true)}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-lg shadow flex items-center justify-center cursor-pointer hover:bg-white transition-colors border-0 z-[400]"
                    title="Expand map"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface">open_in_full</span>
                  </button>
                </div>
                <div className="flex items-center flex-wrap gap-4 mt-2">
                  {mapLegend.map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-[10px] text-on-surface-variant">{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-on-surface mb-4">{T.howManyCustomers}</div>
                <div className="space-y-3">
                  {computed.distanceBandsDisplay.map((b) => (
                    <div key={b.band} className="flex items-center gap-3">
                      <div className="text-xs text-on-surface-variant w-10 shrink-0 text-right">{b.label}</div>
                      <div className="flex-1 h-4 bg-outline-variant/10 rounded-sm overflow-hidden">
                        <div className="h-4 rounded-sm" style={{ width: `${b.width}%`, background: b.color }} />
                      </div>
                      <div className="text-xs font-bold text-on-surface w-8 shrink-0">{b.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {catchmentTab === "expansion" && (
          <div className="p-6">
            <h3 className="text-base font-bold text-on-surface mb-4">{T.bestLocations}</h3>
            <div className="mb-4">
              <AiSuggestionInline
                role="retailer"
                pageContext="ML Predictions — Best Expansion Locations"
                dataContext={computed ? [
                  `Store: ${computed.storeName}`,
                  `Top expansion candidates (matching score, station, traffic):`,
                  ...computed.expansionUnits.map((u) => `${u.name} (${u.stationId}): ${u.match}% match, ${u.traffic} traffic`),
                  `Customer catchment: ${computed.nearestCorePct}% of customers within 2km, avg trip ${computed.avgTripKm.toFixed(1)}km, total 5km reach ${computed.totalReachK.toFixed(1)}k people`,
                ].join(" | ") : "Loading matching scores..."}
              />
            </div>

            {loading || !computed ? (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-48 bg-surface-container-low rounded-xl animate-pulse" />
                ))}
              </div>
            ) : computed.expansionUnits.length === 0 ? (
              <p className="mt-4 text-sm text-on-surface-variant">No expansion locations available.</p>
            ) : (
              <div className="grid grid-cols-3 divide-x divide-outline-variant/10 mt-4 -mx-6 border-t border-outline-variant/10">
                {computed.expansionUnits.map((u) => (
                  <div key={u.stationId} className="px-6 py-5 flex flex-col gap-4 hover:bg-[#F5F2EB]/40 transition-colors">
                    <div className={`self-start inline-flex items-center gap-1.5 border rounded-full px-3 py-1 ${u.matchCls}`}>
                      <div className={`w-2 h-2 rounded-full ${u.dotCls}`} />
                      <span className="text-base font-bold">{u.match}%</span>
                      <span className="text-[10px] font-bold uppercase">{u.matchTier}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{u.name}</div>
                      <div className="text-xs text-on-surface-variant">{u.stationId}</div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[13px] text-on-surface-variant/50">groups</span>
                        {u.traffic}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span className="material-symbols-outlined text-[13px] text-on-surface-variant/50">location_on</span>
                        Bangkok · PTG Station
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-green-700 mb-0.5">{T.howMuchEarn}</div>
                      <div className="text-sm font-bold text-green-700">{u.revenueUplift} {T.perMonth}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{T.whySuitsYou}</div>
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
                      onClick={() => router.push(`/explorepage/explorePage?highlight=${encodeURIComponent(u.name)}`)}
                      className="mt-auto w-full text-xs font-bold text-primary border border-primary/25 rounded-full py-2.5 bg-transparent cursor-pointer hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">map</span>
                      {T.exploreOnMap}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Unusual Things + Customers Who Might Stop Coming Back ── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Unusual Things We Noticed */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px] text-amber-500">troubleshoot</span>
              </div>
              <span className="text-sm font-bold text-on-surface">{T.unusualThings}</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full">
              {T.last7Days}
            </span>
          </div>
          <div className="mb-2">
            <AiSuggestionInline
              role="retailer"
              pageContext="ML Predictions — Anomaly Alerts"
              lang={lang}
              dataContext={computed ? [
                `Store: ${computed.storeName}`,
                `Detected anomalies (${computed.anomalies.length}):`,
                ...computed.anomalies.map((a) => `[${a.tag}] ${a.title} — ${a.body} (suggested: ${a.action})`),
                computed.eventsLine,
                `Explain WHY each unusual change happened using the events above where the months match, then give one action for next week.`,
              ].filter(Boolean).join(" | ") : "Loading anomaly data..."}
            />
          </div>
          {loading || !computed ? (
            <div className="mt-4 space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-20 bg-surface-container-low rounded-xl animate-pulse" />
              ))}
            </div>
          ) : computed.anomalies.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
              {T.noAnomalies}
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {computed.anomalies.map((a, i) => (
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
          )}
        </div>

        {/* Customers Who Might Stop Coming Back */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-[17px] text-red-500">group_off</span>
              </div>
              <span className="text-sm font-bold text-on-surface">{T.churnTitle}</span>
            </div>
            {computed && (
              <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                {computed.riskGroups} {T.groupsAtRisk}
              </span>
            )}
          </div>
          <div className="mb-2">
            <AiSuggestionInline
              role="retailer"
              pageContext="ML Predictions — Churn Risk Segments"
              dataContext={computed ? [
                `Store: ${computed.storeName}`,
                `Customer segments at risk (top ${computed.topChurn.length}):`,
                ...computed.topChurn.map((c) => `${c.segment}: ${c.risk}% churn probability${c.revenueAtRisk ? `, revenue at risk ${c.revenueAtRisk}` : ""}${c.tip ? ` — tip: ${c.tip}` : ""}`),
              ].join(" | ") : "Loading churn data..."}
            />
          </div>
          {loading || !computed ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 bg-surface-container-low rounded-xl animate-pulse" />
              ))}
            </div>
          ) : computed.topChurn.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
              {T.noChurn}
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {computed.topChurn.map((s) => (
                <div key={s.segment} className={`rounded-xl p-4 ${s.rowBg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold text-on-surface">{s.segment}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.revenueAtRisk && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            {s.revenueAtRisk} {T.atRisk}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className={`text-base font-bold ${s.riskText}`}>{s.risk}%</span>
                        <div className="text-[9px] text-on-surface-variant">{T.chanceLeaving}</div>
                      </div>
                      <button type="button" className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer whitespace-nowrap transition-colors ${s.btnCls}`}>
                        {lang === "th" ? s.actionTh : s.action}
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
          )}
        </div>

      </div>

      {/* ── Map expand modal ── */}
      {mapExpanded && (
        <div
          className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-6"
          onClick={() => setMapExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10">
              <span className="text-sm font-bold text-on-surface">{T.mapModalTitle}</span>
              <button
                type="button"
                onClick={() => setMapExpanded(false)}
                className="w-7 h-7 rounded-lg hover:bg-surface-container-low flex items-center justify-center border-0 bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4">
              <CatchmentRadarMap
                center={computed?.mapCenter ?? [13.7634, 100.5490]}
                allMarkers={computed?.allStoreMarkers}
                showAllMarkers={storeId === "all"}
                height={520}
                interactive
              />
              <div className="flex items-center flex-wrap gap-4 mt-3">
                {mapLegend.map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-[10px] text-on-surface-variant">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </RetailerBackofficeLayout>
  );
}
