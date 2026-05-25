import { useLanguage } from "@/lib/languageContext";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const HOURS = ["06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];

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
  { label: "18–25",  pct: 28, color: "#344e00" },
  { label: "26–35",  pct: 42, color: "#6ab04c" },
  { label: "36–45",  pct: 20, color: "#a5d6a7" },
  { label: "46+",    pct: 10, color: "#D4C9B0" },
];

const SPEND_SEGS = [
  { label: ">฿400",     pct: 22, color: "#1C3A1C" },
  { label: "฿200–400", pct: 45, color: "#6ab04c" },
  { label: "฿100–200", pct: 24, color: "#a5d6a7" },
  { label: "<฿100",    pct:  9, color: "#D4C9B0" },
];

const CONVERSION = [
  { name: "Lumina Artisan Roastery", station: "Lat Phrao 71",  orders: 158, traffic: 415, rate: 38.1 },
  { name: "Coffee Corner",           station: "Rama IX",        orders: 130, traffic: 340, rate: 38.2 },
  { name: "Quick Mart",              station: "Ari Station",    orders: 97,  traffic: 280, rate: 34.6 },
];

const HIGHLIGHTS = [
  {
    type: "best" as const,
    badgeIcon: "star",
    name: "Coffee Corner",
    location: "Rama IX · Bangkok",
    unitsUsed: 3, unitsTotal: 4,
    tags: [
      { color: "bg-primary/10 text-primary" },
      { color: "bg-[#F5F2EB] text-on-surface-variant" },
      { color: "bg-primary/10 text-primary" },
    ],
    revenue: { value: "฿143k", trend: "↑ 18%", up: true },
    customers: { value: "340",  trend: "↑ 12%", up: true },
    basket:    { value: "฿248" },
    conversion: { value: 38.2, up: true },
    trend: [60, 72, 68, 85, 90, 143],
  },
  {
    type: "needs" as const,
    badgeIcon: "warning",
    name: "Quick Mart",
    location: "Ari Station · Bangkok",
    unitsUsed: 2, unitsTotal: 4,
    tags: [
      { color: "bg-amber-50 text-amber-700" },
      { color: "bg-[#F5F2EB] text-on-surface-variant" },
      { color: "bg-amber-50 text-amber-700" },
    ],
    revenue: { value: "฿143k", trend: "↑ 4%", up: true },
    customers: { value: "280",  trend: "↑ 2%", up: true },
    basket:    { value: "฿195" },
    conversion: { value: 34.6, up: false },
    trend: [120, 128, 132, 138, 140, 143],
  },
];

const HIGHLIGHTS_LANG = {
  "Coffee Corner": {
    en: {
      badge: "Best Performing Store",
      storeType: "Artisan Café",
      tags: ["Top 25% on platform", "Busiest: Sat afternoon", "+18% more sales"],
      perVisit: "per visit",
      convChange: "↑ more buyers",
      suggestion: "Staying open 2 hours longer on Saturdays could bring in about ฿21,000 more every month — customers are already there, you just need more time.",
    },
    th: {
      badge: "ร้านที่มีผลงานดีที่สุด",
      storeType: "คาเฟ่อาร์ติซัน",
      tags: ["Top 25% บนแพลตฟอร์ม", "คึกคักสุด: บ่ายวันเสาร์", "+18% ยอดขายเพิ่ม"],
      perVisit: "ต่อครั้ง",
      convChange: "↑ ผู้ซื้อเพิ่ม",
      suggestion: "เปิดนานขึ้น 2 ชั่วโมงในวันเสาร์อาจทำให้ได้เงินเพิ่มอีก ~฿21,000 ต่อเดือน — ลูกค้ามีอยู่แล้ว แค่ต้องการเวลามากขึ้นก็พอ",
    },
  },
  "Quick Mart": {
    en: {
      badge: "Needs Your Attention",
      storeType: "Convenience Store",
      tags: ["Fewer buyers than avg", "Rent covered: 3.9×", "Bundle deal could help"],
      perVisit: "per visit",
      convChange: "↓ fewer buyers",
      suggestion: "Only about 35 out of 100 visitors buy something here — lower than your other stores. A simple combo deal (e.g. coffee + snack) could add about 15 extra sales every day without needing more customers.",
    },
    th: {
      badge: "ต้องการความใส่ใจ",
      storeType: "ร้านสะดวกซื้อ",
      tags: ["ผู้ซื้อน้อยกว่าค่าเฉลี่ย", "รายได้ครอบคลุมค่าเช่า 3.9×", "ดีลรวมอาจช่วยได้"],
      perVisit: "ต่อครั้ง",
      convChange: "↓ ผู้ซื้อน้อยกว่า",
      suggestion: "มีแค่ประมาณ 35 คนจาก 100 คนที่ซื้อสินค้าที่ร้านนี้ — ต่ำกว่าร้านอื่นของคุณ ลองทำดีลรวม (เช่น กาแฟ + ขนม) อาจเพิ่มยอดขายได้ ~15 รายการต่อวัน โดยไม่ต้องรอลูกค้าเพิ่ม",
    },
  },
} as const;

const STRINGS = {
  en: {
    exportReport: "Export Report",
    headerTitle: "How Are Your Shops Doing?",
    headerSubtitle: "Here's a summary of your 3 stores this month.",
    kpi1Label: "Your shops earned this month",
    kpi1Sub: "3 stores combined",
    kpi1Trend: "↑ More than last month",
    kpi2Label: "People who visited today",
    kpi2Sub: "across all 3 stores",
    kpi2Trend: "~345 per store",
    kpi3Label: "Visitors who made a purchase",
    kpi3Sub: "~37 in every 100 visitors",
    kpi3Trend: "↑ Up from last month",
    kpi4Label: "How you rank vs other shops",
    kpi4Sub: "platform score",
    kpi4Trend: "Top 25% of all shops",
    aiLabel: "Your shops in plain words",
    aiPre: "Your 3 shops earned",
    aiMoney: "฿604,000 this month",
    aiMid: "— up +12% compared to last month, which is great! About",
    aiPct: "37% of visitors make a purchase",
    aiPost: "across your stores. Quick Mart has the most room to improve — only 35% of visitors there buy something, a bit lower than your other stores. A simple combo deal could make a real difference.",
    actionsTitle: "What You Should Do This Week",
    actionsCount: "3 actions",
    action1Cat: "Earn More",
    action1Title: "Tuesdays are busier than usual",
    action1Body: "Your shops have been getting more customers than normal on Tuesdays lately. Add 1–2 extra staff next Tuesday so no one has to wait.",
    action1Tip: "Could earn +฿8,400 more",
    action2Cat: "Keep Customers",
    action2Title: "Some loyal customers haven't visited in a while",
    action2Body: "A group of your best (big-spending) customers hasn't been back in 18 days. Send them a discount or loyalty reward now before they forget you.",
    action2Tip: "฿62,000/year at risk",
    action3Cat: "Quick Win",
    action3Title: "Try a bundle deal at Quick Mart",
    action3Body: "Fewer visitors buy at Quick Mart compared to your other shops. A simple \"buy 2 get 1\" or combo offer could bring that number up.",
    action3Tip: "Could add +฿4,500/day",
    heatmapTitle: "When Are Your Shops Busiest?",
    heatmapSubtitle: "Average visitors by hour — darker = more people",
    heatmapTipBold: "Best time to run a quick promo:",
    heatmapTip: " 10–11am and 2–5pm are your quietest hours every day. A short discount during these times could turn a slow period into extra sales.",
    quiet: "Quiet",
    busy: "Busy",
    hoursTitle: "Best & Worst Hours",
    hoursSubtitle: "How busy your shops are hour by hour",
    weekdaysLabel: "Weekdays (Mon–Fri)",
    weekendsLabel: "Weekends (Sat–Sun)",
    hoursTipPre: "On weekdays, most people come at ",
    hoursTipBold1: "8–9am",
    hoursTipMid1: " (going to work) and ",
    hoursTipBold2: "7pm",
    hoursTipMid2: " (coming home). On weekends, the rush is at ",
    hoursTipBold3: "noon",
    hoursTipPost: ". Have enough staff and stock ready at these times.",
    customersTitle: "Who Are Your Customers?",
    customersSubtitle: "Age group & how much they spend",
    ageGroupLabel: "Age Group",
    spendLabel: "How Much They Spend",
    customersTipPre: "Most of your customers are ",
    customersTipBold: "26–35 year olds (42%)",
    customersTip: ". But your youngest customers (18–25) are growing the fastest — up +8% this month. A social-media-friendly offer or student discount could bring in even more of them.",
    conversionTitle: "Are Visitors Buying?",
    conversionSubtitle: "Out of everyone who walked in — how many actually bought something?",
    colStore: "Store",
    colBought: "Bought",
    colVisited: "Visited",
    colPct: "% Bought",
    conversionTipBold: "Quick Mart has the most room to improve.",
    conversionTip: " Only about 35 out of 100 visitors buy something there — a bit lower than your other two stores. A simple combo deal (e.g. \"coffee + snack for ฿79\") could add about 15 more sales every day without needing any more foot traffic.",
    storeTypeLabel: "Store type",
    unitsUsedLabel: "Units used",
    earnedLabel: "Earned This Month",
    visitorsLabel: "Daily Visitors",
    spentLabel: "Spent Per Visit",
    visitorsWho: "Visitors who bought something",
    outOf: "out of 100",
    lastSixMonths: "Last 6 months earnings",
    ourSuggestion: "Our suggestion:",
    days: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  },
  th: {
    exportReport: "ดาวน์โหลดรายงาน",
    headerTitle: "ร้านคุณเป็นยังไงบ้าง?",
    headerSubtitle: "สรุปภาพรวม 3 ร้านของคุณเดือนนี้",
    kpi1Label: "ร้านคุณได้เงินเดือนนี้",
    kpi1Sub: "รวม 3 ร้าน",
    kpi1Trend: "↑ มากกว่าเดือนที่แล้ว",
    kpi2Label: "คนที่มาร้านวันนี้",
    kpi2Sub: "รวมทั้ง 3 ร้าน",
    kpi2Trend: "~345 คนต่อร้าน",
    kpi3Label: "ผู้เข้าร้านที่ซื้อสินค้า",
    kpi3Sub: "~37 คนจากทุกๆ 100 คน",
    kpi3Trend: "↑ เพิ่มขึ้นจากเดือนที่แล้ว",
    kpi4Label: "คุณอยู่ตรงไหนเทียบกับร้านอื่น",
    kpi4Sub: "คะแนนในระบบ",
    kpi4Trend: "Top 25% ของร้านทั้งหมด",
    aiLabel: "สรุปภาพรวมร้านคุณ",
    aiPre: "ร้านทั้ง 3 แห่งได้",
    aiMoney: "฿604,000 เดือนนี้",
    aiMid: "— เพิ่มขึ้น +12% จากเดือนที่แล้ว ดีมากเลย! ประมาณ",
    aiPct: "37% ของผู้เข้าร้านซื้อสินค้า",
    aiPost: "จากร้านทั้งหมดของคุณ Quick Mart ยังมีพื้นที่ให้พัฒนาได้มาก — แค่ 35% ของผู้เข้าร้านซื้อสินค้า ต่ำกว่าร้านอื่นนิดหน่อย ทำดีลรวมง่ายๆ อาจเปลี่ยนได้เลย",
    actionsTitle: "สิ่งที่คุณควรทำสัปดาห์นี้",
    actionsCount: "3 รายการ",
    action1Cat: "เพิ่มรายได้",
    action1Title: "วันอังคารมีคนมากกว่าปกติ",
    action1Body: "ร้านของคุณมีลูกค้ามากกว่าปกติในวันอังคารช่วงนี้ เพิ่มพนักงาน 1–2 คนวันอังคารหน้า เพื่อไม่ให้ลูกค้ารอนาน",
    action1Tip: "อาจได้เพิ่ม +฿8,400",
    action2Cat: "รักษาลูกค้า",
    action2Title: "ลูกค้าประจำบางส่วนไม่ได้มาสักพักแล้ว",
    action2Body: "ลูกค้าขาประจำที่ใช้จ่ายสูงกลุ่มหนึ่งไม่ได้กลับมา 18 วันแล้ว ส่งส่วนลดหรือรางวัลสะสมแต้มให้พวกเขาก่อนที่จะลืมร้านคุณ",
    action2Tip: "เสี่ยงสูญรายได้ ฿62,000/ปี",
    action3Cat: "ทำได้เดี๋ยวนี้เลย",
    action3Title: "ลองทำดีลรวมที่ Quick Mart",
    action3Body: "ผู้เข้าร้าน Quick Mart ซื้อน้อยกว่าร้านอื่นของคุณ ลอง \"ซื้อ 2 แถม 1\" หรือเซ็ตคอมโบง่ายๆ เพื่อเพิ่มยอดขาย",
    action3Tip: "อาจเพิ่ม +฿4,500/วัน",
    heatmapTitle: "ร้านคุณคึกคักเวลาไหนมากที่สุด?",
    heatmapSubtitle: "จำนวนผู้เข้าร้านเฉลี่ยแต่ละชั่วโมง — เข้มกว่า = คนมากกว่า",
    heatmapTipBold: "ช่วงเวลาเหมาะโปรโมชั่น:",
    heatmapTip: " 10–11 โมงเช้า และ 14–17 น. เป็นชั่วโมงที่เงียบที่สุดทุกวัน ลดราคาช่วงนี้อาจเปลี่ยนช่วงเงียบให้เป็นยอดขายพิเศษได้",
    quiet: "เงียบ",
    busy: "คึกคัก",
    hoursTitle: "ชั่วโมงดีสุดและแย่สุด",
    hoursSubtitle: "ความคึกคักของร้านแต่ละชั่วโมง",
    weekdaysLabel: "วันธรรมดา (จ–ศ)",
    weekendsLabel: "วันหยุด (ส–อา)",
    hoursTipPre: "วันธรรมดา คนส่วนใหญ่มาช่วง ",
    hoursTipBold1: "8–9 โมงเช้า",
    hoursTipMid1: " (ไปทำงาน) และ ",
    hoursTipBold2: "19.00 น.",
    hoursTipMid2: " (กลับบ้าน) วันหยุดช่วงที่คนมากที่สุดคือ ",
    hoursTipBold3: "เที่ยง",
    hoursTipPost: " เตรียมพนักงานและสินค้าให้พร้อมช่วงเหล่านี้",
    customersTitle: "ลูกค้าคุณเป็นใคร?",
    customersSubtitle: "กลุ่มอายุและยอดใช้จ่าย",
    ageGroupLabel: "กลุ่มอายุ",
    spendLabel: "ใช้จ่ายเท่าไหร่",
    customersTipPre: "ลูกค้าส่วนใหญ่ของคุณคือ ",
    customersTipBold: "กลุ่มอายุ 26–35 ปี (42%)",
    customersTip: " แต่กลุ่มอายุน้อยสุด (18–25 ปี) เติบโตเร็วที่สุด — เพิ่ม +8% เดือนนี้ โปรที่แชร์ง่ายหรือส่วนลดนักศึกษาอาจดึงดูดพวกเขาได้มากขึ้น",
    conversionTitle: "ผู้เข้าร้านซื้อของไหม?",
    conversionSubtitle: "จากทุกคนที่เดินเข้ามา — กี่คนที่ซื้อสินค้าจริงๆ?",
    colStore: "ร้าน",
    colBought: "ซื้อ",
    colVisited: "เข้าร้าน",
    colPct: "% ที่ซื้อ",
    conversionTipBold: "Quick Mart ยังมีพื้นที่พัฒนาได้มากที่สุด",
    conversionTip: " ประมาณ 35 จาก 100 คนซื้อสินค้าที่ร้านนี้ — ต่ำกว่าอีกสองร้านของคุณนิดหน่อย ดีลรวมง่ายๆ (เช่น \"กาแฟ + ขนม ฿79\") อาจเพิ่มยอดขายได้ ~15 รายการต่อวัน โดยไม่ต้องรอลูกค้าเพิ่ม",
    storeTypeLabel: "ประเภทร้าน",
    unitsUsedLabel: "หน่วยที่ใช้",
    earnedLabel: "รายได้เดือนนี้",
    visitorsLabel: "ผู้เข้าร้านต่อวัน",
    spentLabel: "ใช้จ่ายต่อครั้ง",
    visitorsWho: "ผู้เข้าร้านที่ซื้อสินค้า",
    outOf: "จาก 100 คน",
    lastSixMonths: "รายได้ 6 เดือนที่ผ่านมา",
    ourSuggestion: "คำแนะนำของเรา:",
    days: ["จ","อ","พ","พฤ","ศ","ส","อา"],
  },
} as const;

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
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">{T.headerTitle}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{T.headerSubtitle}</p>
        </div>
        <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">
          {T.exportReport}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
          <div className="text-3xl font-bold text-on-surface">฿604,000</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi1Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi1Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
          <div className="text-3xl font-bold text-on-surface">1,035</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi2Sub}</div>
          <span className="text-xs text-on-surface-variant">{T.kpi2Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
          <div className="text-3xl font-bold text-on-surface">37%</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi3Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi3Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
          <div className="text-3xl font-bold text-on-surface">88/100</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi4Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi4Trend}</span>
        </div>
      </div>

      {/* AI Advisor */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-4 mb-6 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">auto_awesome</span>
        <div>
          <div className="text-xs font-bold text-primary mb-1">{T.aiLabel}</div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {T.aiPre} <strong className="text-on-surface">{T.aiMoney}</strong> {T.aiMid}{" "}
            <strong className="text-on-surface">{T.aiPct}</strong> {T.aiPost}
          </p>
        </div>
      </div>

      {/* What You Should Do This Week */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
          <h3 className="text-base font-bold text-on-surface">{T.actionsTitle}</h3>
          <span className="ml-auto text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{T.actionsCount}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[15px] text-green-600">trending_up</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">{T.action1Cat}</span>
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">{T.action1Title}</p>
            <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">{T.action1Body}</p>
            <div className="text-xs font-bold text-green-700">{T.action1Tip}</div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[15px] text-red-500">group_off</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">{T.action2Cat}</span>
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">{T.action2Title}</p>
            <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">{T.action2Body}</p>
            <div className="text-xs font-bold text-red-600">{T.action2Tip}</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[15px] text-amber-600">shopping_cart</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">{T.action3Cat}</span>
            </div>
            <p className="text-sm font-semibold text-on-surface mb-1">{T.action3Title}</p>
            <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">{T.action3Body}</p>
            <div className="text-xs font-bold text-amber-700">{T.action3Tip}</div>
          </div>
        </div>
      </div>

      {/* Heatmap + Best & Worst Hours */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-on-surface mb-0.5">{T.heatmapTitle}</h3>
          <p className="text-xs text-on-surface-variant mb-4">{T.heatmapSubtitle}</p>
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="flex mb-1 ml-10 gap-0.5">
                {HOURS.map((h) => (
                  <div key={h} className="flex-1 text-center text-[9px] text-on-surface-variant">{h}</div>
                ))}
              </div>
              {HEATMAP.map((row, di) => (
                <div key={T.days[di]} className="flex items-center gap-0.5 mb-0.5">
                  <div className="w-9 text-[10px] text-on-surface-variant text-right pr-2 flex-shrink-0">{T.days[di]}</div>
                  {row.map((level, hi) => (
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
          <div className="mt-4 bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">{T.heatmapTipBold}</strong>{T.heatmapTip}
            </p>
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
            <div className="text-xs font-semibold text-on-surface mb-2">{T.weekendsLabel}</div>
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
              {T.hoursTipPre}<strong className="text-on-surface">{T.hoursTipBold1}</strong>{T.hoursTipMid1}<strong className="text-on-surface">{T.hoursTipBold2}</strong>{T.hoursTipMid2}<strong className="text-on-surface">{T.hoursTipBold3}</strong>{T.hoursTipPost}
            </p>
          </div>
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
            <div className="text-xs font-semibold text-on-surface mb-3">{T.spendLabel}</div>
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

          <div className="mt-auto bg-[#F5F2EB] rounded-xl px-3 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {T.customersTipPre}<strong className="text-on-surface">{T.customersTipBold}</strong>{T.customersTip}
            </p>
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

          <div className="mt-4 bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">{T.conversionTipBold}</strong>{T.conversionTip}
            </p>
          </div>
        </div>
      </div>

      {/* Store Report Cards */}
      <div className="grid grid-cols-2 gap-6">
        {HIGHLIGHTS.map((h) => {
          const isBest = h.type === "best";
          const accentColor = isBest ? "text-primary" : "text-red-500";
          const barColor    = isBest ? "bg-primary"   : "bg-red-400";
          const hLang = HIGHLIGHTS_LANG[h.name as keyof typeof HIGHLIGHTS_LANG][lang];
          const trendMax = Math.max(...h.trend);
          const trendMin = Math.min(...h.trend);
          const pts = h.trend.map((v, i) => {
            const x = (i / (h.trend.length - 1)) * 100;
            const y = 32 - ((v - trendMin) / (trendMax - trendMin || 1)) * 28;
            return `${x},${y}`;
          }).join(" ");

          return (
            <div key={h.name} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[14px] ${accentColor}`}>{h.badgeIcon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${accentColor}`}>{hLang.badge}</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-surface-variant">{T.storeTypeLabel}</div>
                  <div className="text-xs font-semibold text-on-surface">{hLang.storeType}</div>
                </div>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-xl font-bold text-on-surface">{h.name}</div>
                  <div className="text-xs text-on-surface-variant">{h.location}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-surface-variant mb-1">{T.unitsUsedLabel}</div>
                  <div className="flex gap-1">
                    {Array.from({ length: h.unitsTotal }).map((_, i) => (
                      <span key={i} className={`w-3 h-3 rounded-full ${i < h.unitsUsed ? "bg-on-surface" : "bg-outline-variant/30"}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {h.tags.map((t, i) => (
                  <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.color}`}>{hLang.tags[i]}</span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{T.earnedLabel}</div>
                  <div className="text-xl font-bold text-on-surface">{h.revenue.value}</div>
                  <div className={`text-xs font-semibold ${h.revenue.up ? "text-primary" : "text-red-500"}`}>{h.revenue.trend}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{T.visitorsLabel}</div>
                  <div className="text-xl font-bold text-on-surface">{h.customers.value}</div>
                  <div className={`text-xs font-semibold ${h.customers.up ? "text-primary" : "text-red-500"}`}>{h.customers.trend}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{T.spentLabel}</div>
                  <div className="text-xl font-bold text-on-surface">{h.basket.value}</div>
                  <div className="text-xs text-on-surface-variant">{hLang.perVisit}</div>
                </div>
              </div>

              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">{T.visitorsWho}</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${accentColor}`}>{h.conversion.value} {T.outOf}</span>
                  <span className={`text-[10px] ${h.conversion.up ? "text-primary" : "text-red-500"}`}>{hLang.convChange}</span>
                </div>
              </div>
              <div className="h-2 bg-[#F5F2EB] rounded-full overflow-hidden mb-4">
                <div className={`h-2 ${barColor} rounded-full`} style={{ width: `${h.conversion.value}%` }} />
              </div>

              <div className="mb-3">
                <div className="text-[10px] text-on-surface-variant mb-1">{T.lastSixMonths}</div>
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

              <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 flex-shrink-0">auto_awesome</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">{T.ourSuggestion}</strong> {hLang.suggestion}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </RetailerBackofficeLayout>
  );
}
