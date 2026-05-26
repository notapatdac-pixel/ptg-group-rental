"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { useStoreFilter, type StoreId } from "@/lib/storeFilterContext";
import { useLanguage } from "@/lib/languageContext";

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
    last7Days: "Last 7 days",
    churnTitle: "Customers Who Might Stop Coming Back",
    groupsAtRisk: "GROUPS AT RISK",
    lastVisit: "Last visit:",
    chanceLeaving: "chance of leaving",
    ourSuggestion: "Our Suggestion",
    perMonth: "/ month",
    catchmentAiBox: "These locations were picked because they match your customer type, budget, and busy hours. A higher match % means a better chance of strong sales based on similar shops nearby. Start with the highest match — it gives you the best chance of success for your first expansion.",
    anomalyAiBox: "These are things that happened this week that don't match your normal pattern — some good, some worth checking. Each one includes a suggested action. Green = good news you can take advantage of. Amber = keep an eye on it. Red = something to look into.",
    churnAiBox: "This shows which groups of customers haven't visited in a while and might not come back. The % is how likely they are to stop coming — the higher the number, the more urgent it is. If a row is red, act now. Waiting makes them harder to win back.",
    mapLegendShop: "Your shop",
    atRisk: "at risk",
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
    last7Days: "7 วันที่ผ่านมา",
    churnTitle: "ลูกค้าที่อาจไม่กลับมา",
    groupsAtRisk: "กลุ่มเสี่ยง",
    lastVisit: "มาครั้งล่าสุด:",
    chanceLeaving: "โอกาสที่จะไม่กลับมา",
    ourSuggestion: "คำแนะนำของเรา",
    perMonth: "/ เดือน",
    catchmentAiBox: "ทำเลเหล่านี้ถูกคัดเลือกเพราะตรงกับประเภทลูกค้า งบประมาณ และชั่วโมงเร่งด่วนของคุณ match % ที่สูงขึ้นหมายถึงโอกาสที่ดีขึ้นในการทำยอดขายได้ดี เริ่มจากทำเลที่มี match % สูงสุดเพื่อโอกาสสำเร็จสูงสุดในการขยายสาขาแรก",
    anomalyAiBox: "สิ่งเหล่านี้เกิดขึ้นในสัปดาห์นี้และไม่ตรงกับรูปแบบปกติของคุณ — บางอย่างเป็นข่าวดี บางอย่างควรตรวจสอบ แต่ละอย่างมีคำแนะนำการดำเนินการ สีเขียว = ข่าวดีที่ควรใช้ประโยชน์ สีเหลือง = ควรจับตาดู สีแดง = ควรตรวจสอบ",
    churnAiBox: "แสดงกลุ่มลูกค้าที่ไม่ได้มาเยี่ยมชมสักพักและอาจไม่กลับมา ตัวเลข % คือโอกาสที่พวกเขาจะหยุดมา ยิ่งสูงยิ่งเร่งด่วน แถวสีแดงต้องดำเนินการทันที รอนานทำให้ดึงกลับมาได้ยากขึ้น",
    mapLegendShop: "ร้านของคุณ",
    atRisk: "มีความเสี่ยง",
  },
} as const;

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
    stationId: "bangna",
    unitId: "bn_a01",
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
    stationId: "latphrao",
    unitId: "lp_e01",
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
    stationId: "rama9",
    unitId: "rama9_a02",
  },
];

const CATCHMENT_STATS = [
  { labelEn: "Avg trip to your shop",   labelTh: "ระยะทางเฉลี่ยมาหาร้าน",     value: "4.2 km", noteEn: "within target range",   noteTh: "อยู่ในช่วงที่ตั้งเป้า",         noteCls: "text-green-600" },
  { labelEn: "Nearest customers",       labelTh: "ลูกค้าใกล้สุด",              value: "0–3 km", noteEn: "58% of customers",       noteTh: "58% ของลูกค้า",                  noteCls: "text-on-surface-variant" },
  { labelEn: "People within reach",     labelTh: "จำนวนคนในรัศมี",             value: "95K",    noteEn: "within 5 km radius",     noteTh: "ภายในรัศมี 5 กม.",               noteCls: "text-on-surface-variant" },
  { labelEn: "Untapped areas nearby",   labelTh: "พื้นที่ที่ยังไม่ได้เข้าถึง", value: "3",      noteEn: "locations suggested",    noteTh: "ทำเลที่แนะนำ",                   noteCls: "text-amber-600" },
];

const DISTANCE_BANDS = [
  { label: "0–1 km", pct: 18, width: 53, color: "#1C3A1C" },
  { label: "1–2 km", pct: 13, width: 38, color: "#2d5a1b" },
  { label: "2–3 km", pct: 27, width: 80, color: "#6DBF23" },
  { label: "3–5 km", pct: 22, width: 65, color: "#9bcc6b" },
  { label: "5–8 km", pct: 12, width: 36, color: "#c5dba8" },
  { label: "8+ km",  pct: 8,  width: 24, color: "#d4d4d4" },
];

const STORE_COORDS: Record<StoreId, [number, number]> = {
  all:    [13.7634, 100.5490],
  coffee: [13.7500, 100.5624],
  quick:  [13.7763, 100.5374],
  lumina: [13.8050, 100.5650],
};

const ALL_STORE_COORDS: Array<{ id: StoreId; label: string; coords: [number, number] }> = [
  { id: "coffee", label: "Coffee Corner",           coords: [13.7500, 100.5624] },
  { id: "quick",  label: "Quick Mart",              coords: [13.7763, 100.5374] },
  { id: "lumina", label: "Lumina Artisan Roastery", coords: [13.8050, 100.5650] },
];

// ── Per-store ML data ────────────────────────────────────────────────────────

type Anomaly = {
  icon: string; iconBg: string; title: string; body: string;
  action: string; tag: string; tagCls: string; age: string; borderCls: string;
};
type ChurnSeg = {
  segment: string; lastVisit: string; risk: number; revenueAtRisk: string | null;
  action: string; actionTh: string; barCls: string; rowBg: string; riskText: string; btnCls: string; tip: string | null;
};
type StoreML = {
  kpi1Val: string; kpi1Sub: string; kpi1Trend: string; kpi1SubTh: string; kpi1TrendTh: string;
  kpi2Val: string; kpi2Sub: string; kpi2Trend: string; kpi2SubTh: string; kpi2TrendTh: string;
  kpi3Val: string; kpi3Sub: string; kpi3Trend: string; kpi3SubTh: string; kpi3TrendTh: string;
  kpi4Val: string; kpi4Sub: string; kpi4Trend: string; kpi4SubTh: string; kpi4TrendTh: string;
  aiEarn: string; aiEarnFull: string; aiPct: string;
  aiQuarter: string; aiConf: string;
  aiSpend: string; aiSpendCurr: string; aiSpendPct: string;
  aiLoss: string; aiRiskNote: string; aiRiskNoteTh: string;
  anomalies: Anomaly[];
  churn: ChurnSeg[];
};

const ML_BY_STORE: Record<StoreId, StoreML> = {
  all: {
    kpi1Val: "฿672k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+11.3% vs this month",     kpi1SubTh: "รายได้ที่คาดการณ์",           kpi1TrendTh: "+11.3% เทียบกับเดือนนี้",
    kpi2Val: "฿2.0M",  kpi2Sub: "฿1.8M – ฿2.2M range",     kpi2Trend: "89% confidence",            kpi2SubTh: "ช่วง ฿1.8M – ฿2.2M",          kpi2TrendTh: "ความมั่นใจ 89%",
    kpi3Val: "฿271",   kpi3Sub: "per customer visit",        kpi3Trend: "+9% vs current ฿249",       kpi3SubTh: "ต่อการเข้าร้านหนึ่งครั้ง",   kpi3TrendTh: "+9% เทียบกับปัจจุบัน ฿249",
    kpi4Val: "฿110K",  kpi4Sub: "if no action taken",        kpi4Trend: "2 customer groups at risk", kpi4SubTh: "หากไม่ดำเนินการ",             kpi4TrendTh: "2 กลุ่มลูกค้ามีความเสี่ยง",
    aiEarn: "฿672k", aiEarnFull: "฿672,000 next month", aiPct: "+11.3%",
    aiQuarter: "฿2.0M", aiConf: "89",
    aiSpend: "฿271 per visit", aiSpendCurr: "฿249", aiSpendPct: "+9%",
    aiLoss: "฿110,000/year", aiRiskNote: "two groups of loyal customers haven't visited in a while", aiRiskNoteTh: "ลูกค้าประจำสองกลุ่มไม่ได้มาเยี่ยมชมสักพักแล้ว",
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
      { segment: "Big spenders · 46+", lastVisit: "18 days ago", risk: 74, revenueAtRisk: "฿62,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "Send a loyalty reward or personal discount — this group responds well to feeling special." },
      { segment: "26–35 year olds · Mid-spenders", lastVisit: "14 days ago", risk: 61, revenueAtRisk: "฿48,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A time-limited deal or referral bonus works well for this group." },
      { segment: "36–45 year olds · Budget-friendly", lastVisit: "9 days ago", risk: 38, revenueAtRisk: "฿24,000/yr", action: "Watch", actionTh: "จับตาดู", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Not urgent — check again in 2 weeks before taking action." },
      { segment: "18–25 year olds · Young shoppers", lastVisit: "3 days ago", risk: 8, revenueAtRisk: null, action: "Healthy", actionTh: "ปกติดี", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },

  coffee: {
    kpi1Val: "฿285k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+8.4% vs this month",      kpi1SubTh: "รายได้ที่คาดการณ์",           kpi1TrendTh: "+8.4% เทียบกับเดือนนี้",
    kpi2Val: "฿820K",  kpi2Sub: "฿740K – ฿900K range",     kpi2Trend: "87% confidence",            kpi2SubTh: "ช่วง ฿740K – ฿900K",          kpi2TrendTh: "ความมั่นใจ 87%",
    kpi3Val: "฿245",   kpi3Sub: "per customer visit",        kpi3Trend: "+6% vs current ฿231",       kpi3SubTh: "ต่อการเข้าร้านหนึ่งครั้ง",   kpi3TrendTh: "+6% เทียบกับปัจจุบัน ฿231",
    kpi4Val: "฿42K",   kpi4Sub: "if no action taken",        kpi4Trend: "1 customer group at risk",  kpi4SubTh: "หากไม่ดำเนินการ",             kpi4TrendTh: "1 กลุ่มลูกค้ามีความเสี่ยง",
    aiEarn: "฿285k", aiEarnFull: "฿285,000 next month", aiPct: "+8.4%",
    aiQuarter: "฿820K", aiConf: "87",
    aiSpend: "฿245 per visit", aiSpendCurr: "฿231", aiSpendPct: "+6%",
    aiLoss: "฿42,000/year", aiRiskNote: "frequent morning regulars haven't visited in over 2 weeks", aiRiskNoteTh: "ลูกค้าประจำช่วงเช้าไม่ได้มาเกิน 2 สัปดาห์แล้ว",
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
      { segment: "Morning regulars · 36–50", lastVisit: "16 days ago", risk: 68, revenueAtRisk: "฿42,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A free drink loyalty stamp or personalised message works well for habitual morning visitors." },
      { segment: "Students · 18–24", lastVisit: "11 days ago", risk: 45, revenueAtRisk: "฿31,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A study-hour deal or group discount brings this segment back quickly." },
      { segment: "Afternoon visitors · 26–35", lastVisit: "5 days ago", risk: 22, revenueAtRisk: "฿18,000/yr", action: "Watch", actionTh: "จับตาดู", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Still within normal return window — revisit in 10 days." },
      { segment: "Daily commuters · all ages", lastVisit: "1 day ago", risk: 6, revenueAtRisk: null, action: "Healthy", actionTh: "ปกติดี", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },

  quick: {
    kpi1Val: "฿198k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+14.2% vs this month",     kpi1SubTh: "รายได้ที่คาดการณ์",           kpi1TrendTh: "+14.2% เทียบกับเดือนนี้",
    kpi2Val: "฿560K",  kpi2Sub: "฿490K – ฿630K range",     kpi2Trend: "91% confidence",            kpi2SubTh: "ช่วง ฿490K – ฿630K",          kpi2TrendTh: "ความมั่นใจ 91%",
    kpi3Val: "฿188",   kpi3Sub: "per customer visit",        kpi3Trend: "+12% vs current ฿168",      kpi3SubTh: "ต่อการเข้าร้านหนึ่งครั้ง",   kpi3TrendTh: "+12% เทียบกับปัจจุบัน ฿168",
    kpi4Val: "฿68K",   kpi4Sub: "if no action taken",        kpi4Trend: "1 customer group at risk",  kpi4SubTh: "หากไม่ดำเนินการ",             kpi4TrendTh: "1 กลุ่มลูกค้ามีความเสี่ยง",
    aiEarn: "฿198k", aiEarnFull: "฿198,000 next month", aiPct: "+14.2%",
    aiQuarter: "฿560K", aiConf: "91",
    aiSpend: "฿188 per visit", aiSpendCurr: "฿168", aiSpendPct: "+12%",
    aiLoss: "฿68,000/year", aiRiskNote: "weekend shoppers aged 26–35 haven't returned in 13 days", aiRiskNoteTh: "นักช้อปวันหยุดอายุ 26–35 ปีไม่ได้กลับมาใน 13 วัน",
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
      { segment: "Frequent shoppers · 36–45", lastVisit: "20 days ago", risk: 71, revenueAtRisk: "฿58,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "This group responds to convenience perks — a fast-checkout or loyalty punch card works well." },
      { segment: "Weekend families · 26–40", lastVisit: "13 days ago", risk: 52, revenueAtRisk: "฿39,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A family bundle deal or weekend-only discount brings this group back." },
      { segment: "Occasional visitors · mixed ages", lastVisit: "7 days ago", risk: 29, revenueAtRisk: "฿12,000/yr", action: "Watch", actionTh: "จับตาดู", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Still within normal range — no action needed yet." },
      { segment: "Daily commuters · all ages", lastVisit: "1 day ago", risk: 5, revenueAtRisk: null, action: "Healthy", actionTh: "ปกติดี", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },

  lumina: {
    kpi1Val: "฿189k",  kpi1Sub: "predicted revenue",        kpi1Trend: "+13.7% vs this month",     kpi1SubTh: "รายได้ที่คาดการณ์",           kpi1TrendTh: "+13.7% เทียบกับเดือนนี้",
    kpi2Val: "฿540K",  kpi2Sub: "฿480K – ฿600K range",     kpi2Trend: "85% confidence",            kpi2SubTh: "ช่วง ฿480K – ฿600K",          kpi2TrendTh: "ความมั่นใจ 85%",
    kpi3Val: "฿412",   kpi3Sub: "per customer visit",        kpi3Trend: "+7% vs current ฿385",       kpi3SubTh: "ต่อการเข้าร้านหนึ่งครั้ง",   kpi3TrendTh: "+7% เทียบกับปัจจุบัน ฿385",
    kpi4Val: "฿38K",   kpi4Sub: "if no action taken",        kpi4Trend: "2 customer groups at risk", kpi4SubTh: "หากไม่ดำเนินการ",             kpi4TrendTh: "2 กลุ่มลูกค้ามีความเสี่ยง",
    aiEarn: "฿189k", aiEarnFull: "฿189,000 next month", aiPct: "+13.7%",
    aiQuarter: "฿540K", aiConf: "85",
    aiSpend: "฿412 per visit", aiSpendCurr: "฿385", aiSpendPct: "+7%",
    aiLoss: "฿38,000/year", aiRiskNote: "two groups — premium buyers and weekend brunch regulars — haven't been in for over 2 weeks", aiRiskNoteTh: "สองกลุ่ม — ลูกค้าพรีเมียมและกลุ่มบรันช์วันหยุด — ไม่ได้มาเกิน 2 สัปดาห์",
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
      { segment: "Premium buyers · 35–50", lastVisit: "22 days ago", risk: 76, revenueAtRisk: "฿68,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-500", rowBg: "bg-red-50", riskText: "text-red-600", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "This high-value group responds to exclusivity — a private tasting invite or early-access offer works well." },
      { segment: "Weekend brunch crowd · 26–40", lastVisit: "15 days ago", risk: 58, revenueAtRisk: "฿44,000/yr", action: "Re-engage", actionTh: "ดึงกลับมา", barCls: "bg-red-400", rowBg: "bg-red-50", riskText: "text-red-500", btnCls: "bg-red-700 hover:bg-red-800 text-white", tip: "A weekend set-menu deal or reservation perk brings this group back." },
      { segment: "First-time visitors", lastVisit: "8 days ago", risk: 31, revenueAtRisk: "฿16,000/yr", action: "Watch", actionTh: "จับตาดู", barCls: "bg-amber-400", rowBg: "bg-amber-50", riskText: "text-amber-600", btnCls: "bg-amber-500 hover:bg-amber-600 text-white", tip: "Not urgent — a welcome-back message in 1–2 weeks should be enough." },
      { segment: "Loyalty members · all ages", lastVisit: "2 days ago", risk: 6, revenueAtRisk: null, action: "Healthy", actionTh: "ปกติดี", barCls: "bg-green-500", rowBg: "bg-green-50", riskText: "text-green-600", btnCls: "bg-green-700 hover:bg-green-800 text-white", tip: null },
    ],
  },
};

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

// ── CatchmentRadarMap component ──────────────────────────────────────────────

function CatchmentRadarMap({ storeId, height = 240, interactive = false }: { storeId: StoreId; height?: number; interactive?: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const center = STORE_COORDS[storeId];
    const map = L.map(mapRef.current, { zoomControl: interactive, scrollWheelZoom: interactive }).setView(center, 13);

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

    if (storeId === "all") {
      ALL_STORE_COORDS.forEach(({ coords, label }) => {
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

    return () => { map.remove(); };
  }, [storeId, interactive]);

  return <div ref={mapRef} className="w-full rounded-xl overflow-hidden" style={{ height }} />;
}

const MAP_LEGEND_EN = [
  { color: "#1C3A1C", label: "Your shop" },
  { color: "#2d5a1b", label: "0–1 km" },
  { color: "#6DBF23", label: "1–2 km" },
  { color: "#9bcc6b", label: "2–3 km" },
  { color: "#c5dba8", label: "3–5 km" },
  { color: "#d4d4d4", label: "5–8 km" },
];

const MAP_LEGEND_TH = [
  { color: "#1C3A1C", label: "ร้านของคุณ" },
  { color: "#2d5a1b", label: "0–1 กม." },
  { color: "#6DBF23", label: "1–2 กม." },
  { color: "#9bcc6b", label: "2–3 กม." },
  { color: "#c5dba8", label: "3–5 กม." },
  { color: "#d4d4d4", label: "5–8 กม." },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MlPredictionsPage() {
  const [catchmentTab, setCatchmentTab] = useState<"overview" | "expansion">("overview");
  const [mapExpanded, setMapExpanded] = useState(false);
  const { storeId } = useStoreFilter();
  const { lang } = useLanguage();
  const router = useRouter();
  const md = ML_BY_STORE[storeId];
  const T = STRINGS[lang];

  const mapLegend = lang === "th" ? MAP_LEGEND_TH : MAP_LEGEND_EN;

  // Store name for AI summary heading
  const storeNameMap: Record<StoreId, string> = {
    all: "",
    coffee: "Coffee Corner",
    quick: "Quick Mart",
    lumina: "Lumina Artisan Roastery",
  };

  return (
    <RetailerBackofficeLayout>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">{T.pageTitle}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{T.pageSubtitle}</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
          <div className="text-3xl font-bold text-on-surface">{md.kpi1Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{lang === "th" ? md.kpi1SubTh : md.kpi1Sub}</div>
          <span className="text-xs font-bold text-primary">{lang === "th" ? md.kpi1TrendTh : md.kpi1Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
          <div className="text-3xl font-bold text-on-surface">{md.kpi2Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{lang === "th" ? md.kpi2SubTh : md.kpi2Sub}</div>
          <span className="text-xs font-bold text-primary">{lang === "th" ? md.kpi2TrendTh : md.kpi2Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
          <div className="text-3xl font-bold text-on-surface">{md.kpi3Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{lang === "th" ? md.kpi3SubTh : md.kpi3Sub}</div>
          <span className="text-xs font-bold text-primary">{lang === "th" ? md.kpi3TrendTh : md.kpi3Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
          <div className="text-3xl font-bold text-red-600">{md.kpi4Val}</div>
          <div className="text-sm text-on-surface-variant mb-3">{lang === "th" ? md.kpi4SubTh : md.kpi4Sub}</div>
          <span className="text-xs font-bold text-red-500">{lang === "th" ? md.kpi4TrendTh : md.kpi4Trend}</span>
        </div>
      </div>

      {/* ── AI Predictions Summary ── */}
      <div className="bg-[#D9EDD9] rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 shadow-sm">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">auto_awesome</span>
        <div>
          <div className="text-xs font-bold text-primary mb-1">{T.aiPredLabel}</div>
          {lang === "th" ? (
            <p className="text-sm text-on-surface-variant leading-relaxed">
              ร้านของคุณคาดว่าจะสร้างรายได้{" "}
              <strong className="text-on-surface">{md.aiEarnFull}</strong> — เพิ่มขึ้น {md.aiPct} จากเดือนนี้ โดยยอดรวมไตรมาสนี้คาดว่าจะอยู่ที่{" "}
              <strong className="text-on-surface">{md.aiQuarter}</strong> (ความมั่นใจ {md.aiConf}%) ลูกค้าคาดว่าจะใช้จ่ายเฉลี่ย{" "}
              <strong className="text-on-surface">{md.aiSpend}</strong> ต่อครั้ง เพิ่มขึ้น {md.aiSpendPct} จาก {md.aiSpendCurr} อย่างไรก็ตาม {md.aiRiskNoteTh} — คุณอาจสูญเสียรายได้ถึง{" "}
              <strong className="text-on-surface">{md.aiLoss}</strong> หากไม่รีบดำเนินการ
            </p>
          ) : (
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your {storeId === "all" ? "shops are" : `${storeNameMap[storeId]} is`} on track to earn{" "}
              <strong className="text-on-surface">{md.aiEarnFull}</strong> — up {md.aiPct} from this month, with a quarterly total likely reaching{" "}
              <strong className="text-on-surface">{md.aiQuarter}</strong> ({md.aiConf}% confidence). Customers are expected to spend{" "}
              <strong className="text-on-surface">{md.aiSpend}</strong> on average, up {md.aiSpendPct} from today&apos;s {md.aiSpendCurr}. However, {md.aiRiskNote} — you could lose up to{" "}
              <strong className="text-on-surface">{md.aiLoss}</strong> if you don&apos;t act soon.
            </p>
          )}
        </div>
      </div>

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

        {catchmentTab === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-4 gap-6 pb-6 mb-6 border-b border-outline-variant/10">
              {CATCHMENT_STATS.map((s) => (
                <div key={s.labelEn}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                    {lang === "th" ? s.labelTh : s.labelEn}
                  </div>
                  <div className="text-2xl font-bold text-on-surface mb-0.5">{s.value}</div>
                  <div className={`text-xs ${s.noteCls}`}>{lang === "th" ? s.noteTh : s.noteEn}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <div className="text-xs font-medium text-on-surface mb-3">{T.whereCustomersTravel}</div>
                <div className="relative">
                  <CatchmentRadarMap storeId={storeId} />
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
              </div>
            </div>
          </div>
        )}

        {catchmentTab === "expansion" && (
          <div className="p-6">
            <h3 className="text-base font-bold text-on-surface mb-4">{T.bestLocations}</h3>
            <AiBox text={T.catchmentAiBox} suggestionLabel={T.ourSuggestion} />
            <div className="grid grid-cols-3 divide-x divide-outline-variant/10 mt-4 -mx-6 border-t border-outline-variant/10">
              {EXPANSION_UNITS.map((u) => (
                <div key={u.name} className="px-6 py-5 flex flex-col gap-4 hover:bg-[#F5F2EB]/40 transition-colors">
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
              <span className="text-sm font-bold text-on-surface">{T.unusualThings}</span>
            </div>
            <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded-full">
              {T.last7Days}
            </span>
          </div>
          <AiBox text={T.anomalyAiBox} suggestionLabel={T.ourSuggestion} />
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
              <span className="text-sm font-bold text-on-surface">{T.churnTitle}</span>
            </div>
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
              {md.churn.filter(c => c.risk >= 50).length} {T.groupsAtRisk}
            </span>
          </div>
          <AiBox text={T.churnAiBox} suggestionLabel={T.ourSuggestion} />
          <div className="space-y-3 mt-4">
            {md.churn.map((s) => (
              <div key={s.segment} className={`rounded-xl p-4 ${s.rowBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-bold text-on-surface">{s.segment}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-on-surface-variant">{T.lastVisit} {s.lastVisit}</span>
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
              <CatchmentRadarMap storeId={storeId} height={520} interactive />
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
