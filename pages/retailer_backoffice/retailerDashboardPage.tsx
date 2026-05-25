import { useLanguage } from "@/lib/languageContext";
import { useStoreFilter } from "@/lib/storeFilterContext";
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
  { label: ">฿400",    pct: 22, color: "#1C3A1C" },
  { label: "฿200–400", pct: 45, color: "#6ab04c" },
  { label: "฿100–200", pct: 24, color: "#a5d6a7" },
  { label: "<฿100",    pct:  9, color: "#D4C9B0" },
];

const CONVERSION = [
  { id: "lumina", name: "Lumina Artisan Roastery", station: "Lat Phrao 71",  orders: 158, traffic: 415, rate: 38.1 },
  { id: "coffee", name: "Coffee Corner",           station: "Rama IX",        orders: 130, traffic: 340, rate: 38.2 },
  { id: "quick",  name: "Quick Mart",              station: "Ari Station",    orders: 97,  traffic: 280, rate: 34.6 },
];

const HIGHLIGHTS = [
  {
    id: "coffee",
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
    revenue: { value: "฿143k", trend: "18%", up: true },
    customers: { value: "340",  trend: "12%", up: true },
    basket:    { value: "฿248" },
    conversion: { value: 38.2, up: true },
    trend: [60, 72, 68, 85, 90, 143],
  },
  {
    id: "quick",
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
    revenue: { value: "฿143k", trend: "4%", up: true },
    customers: { value: "280",  trend: "2%", up: true },
    basket:    { value: "฿195" },
    conversion: { value: 34.6, up: false },
    trend: [120, 128, 132, 138, 140, 143],
  },
  {
    id: "lumina",
    type: "best" as const,
    badgeIcon: "star",
    name: "Lumina Artisan Roastery",
    location: "Lat Phrao 71 · Bangkok",
    unitsUsed: 2, unitsTotal: 3,
    tags: [
      { color: "bg-primary/10 text-primary" },
      { color: "bg-[#F5F2EB] text-on-surface-variant" },
      { color: "bg-primary/10 text-primary" },
    ],
    revenue: { value: "฿318k", trend: "24%", up: true },
    customers: { value: "415",  trend: "15%", up: true },
    basket:    { value: "฿310" },
    conversion: { value: 38.1, up: true },
    trend: [180, 210, 235, 265, 290, 318],
  },
];

const HIGHLIGHTS_LANG = {
  "Coffee Corner": {
    en: {
      badge: "Best Performing Store",
      storeType: "Artisan Café",
      tags: ["Top 25% on platform", "Busiest: Sat afternoon", "+18% more sales"],
      perVisit: "per visit",
      convChange: "more buyers",
      suggestion: "Staying open 2 hours longer on Saturdays could bring in about ฿21,000 more every month — customers are already there, you just need more time.",
    },
    th: {
      badge: "ร้านที่มีผลงานดีที่สุด",
      storeType: "คาเฟ่อาร์ติซัน",
      tags: ["Top 25% บนแพลตฟอร์ม", "คึกคักสุด: บ่ายวันเสาร์", "+18% ยอดขายเพิ่ม"],
      perVisit: "ต่อครั้ง",
      convChange: "ผู้ซื้อเพิ่ม",
      suggestion: "เปิดนานขึ้น 2 ชั่วโมงในวันเสาร์อาจทำให้ได้เงินเพิ่มอีก ~฿21,000 ต่อเดือน — ลูกค้ามีอยู่แล้ว แค่ต้องการเวลามากขึ้นก็พอ",
    },
  },
  "Quick Mart": {
    en: {
      badge: "Needs Your Attention",
      storeType: "Convenience Store",
      tags: ["Fewer buyers than avg", "29% cost-to-revenue", "Bundle deal could help"],
      perVisit: "per visit",
      convChange: "fewer buyers",
      suggestion: "Only about 35 out of 100 visitors buy something here — lower than your other stores. A simple combo deal (e.g. coffee + snack) could add about 15 extra sales every day without needing more customers.",
    },
    th: {
      badge: "ต้องการความใส่ใจ",
      storeType: "ร้านสะดวกซื้อ",
      tags: ["ผู้ซื้อน้อยกว่าค่าเฉลี่ย", "ต้นทุน 29% ของรายได้", "ดีลรวมอาจช่วยได้"],
      perVisit: "ต่อครั้ง",
      convChange: "ผู้ซื้อน้อยกว่า",
      suggestion: "มีแค่ประมาณ 35 คนจาก 100 คนที่ซื้อสินค้าที่ร้านนี้ ลองทำดีลรวม (เช่น กาแฟ + ขนม) อาจเพิ่มยอดขายได้ ~15 รายการต่อวัน",
    },
  },
  "Lumina Artisan Roastery": {
    en: {
      badge: "Top Earning Store",
      storeType: "Artisan Roastery",
      tags: ["Top 10% on platform", "Highest revenue", "+24% more sales"],
      perVisit: "per visit",
      convChange: "more buyers",
      suggestion: "Lumina is your top earner at ฿318k/month. A premium seasonal menu or office bulk order program could push revenue even higher — your customers already spend ฿310 per visit, well above average.",
    },
    th: {
      badge: "ร้านที่มีรายได้สูงสุด",
      storeType: "ร้านคั่วกาแฟ",
      tags: ["Top 10% บนแพลตฟอร์ม", "รายได้สูงสุด", "+24% ยอดขายเพิ่ม"],
      perVisit: "ต่อครั้ง",
      convChange: "ผู้ซื้อเพิ่ม",
      suggestion: "Lumina คือร้านที่ทำรายได้สูงสุดด้วย ฿318k ต่อเดือน เมนูพรีเมียมตามฤดูกาลหรือโปรแกรมสั่งออฟฟิศอาจเพิ่มรายได้ได้อีก — ลูกค้าใช้จ่าย ฿310 ต่อครั้ง สูงกว่าค่าเฉลี่ยมาก",
    },
  },
} as const;

const DASH_BY_STORE = {
  all: {
    kpi1: "฿604,000", kpi1Sub_en: "3 stores combined",   kpi1Sub_th: "รวม 3 ร้าน",
    kpi2: "1,035",    kpi2Sub_en: "across all 3 stores", kpi2Sub_th: "รวมทั้ง 3 ร้าน",
    kpi3: "37%",
    kpi4: "88/100",
    ai_en: { pre: "Your 3 shops earned", money: "฿604,000 this month", mid: "— up +12% vs last month! About", pct: "37% of visitors make a purchase", post: " across your stores. Quick Mart has the most room to improve — only 35% of visitors there buy something. A simple combo deal could make a real difference." },
    ai_th: { pre: "ร้านทั้ง 3 แห่งได้", money: "฿604,000 เดือนนี้", mid: "— เพิ่มขึ้น +12% จากเดือนที่แล้ว! ประมาณ", pct: "37% ของผู้เข้าร้านซื้อสินค้า", post: " Quick Mart ยังมีพื้นที่พัฒนาได้มาก — แค่ 35% ของผู้เข้าร้านซื้อสินค้า ทำดีลรวมง่ายๆ อาจเปลี่ยนได้เลย" },
    actions: [
      { catEn: "Earn More",      catTh: "เพิ่มรายได้",      icon: "trending_up",   bgCard: "bg-green-50",  border: "border-green-100",  iconColor: "text-green-600",  catColor: "text-green-700",  tipColor: "text-green-700",  titleEn: "Tuesdays are busier than usual",              titleTh: "วันอังคารมีคนมากกว่าปกติ",              bodyEn: "Your shops have been getting more customers on Tuesdays. Add 1–2 extra staff next Tuesday so no one has to wait.",       bodyTh: "ร้านของคุณมีลูกค้ามากกว่าปกติวันอังคาร เพิ่มพนักงาน 1–2 คนวันอังคารหน้า",          tipEn: "Could earn +฿8,400 more",         tipTh: "อาจได้เพิ่ม +฿8,400" },
      { catEn: "Keep Customers", catTh: "รักษาลูกค้า",      icon: "group_off",     bgCard: "bg-red-50",    border: "border-red-100",    iconColor: "text-red-500",    catColor: "text-red-600",    tipColor: "text-red-600",    titleEn: "Some loyal customers haven't visited in a while", titleTh: "ลูกค้าประจำบางส่วนไม่ได้มาสักพักแล้ว",  bodyEn: "A group of your best customers hasn't been back in 18 days. Send them a discount before they forget you.",                 bodyTh: "ลูกค้าขาประจำกลุ่มหนึ่งไม่ได้กลับมา 18 วัน ส่งส่วนลดให้ก่อนลืมร้านคุณ",         tipEn: "฿62,000/year at risk",            tipTh: "เสี่ยงสูญรายได้ ฿62,000/ปี" },
      { catEn: "Quick Win",      catTh: "ทำได้เดี๋ยวนี้เลย", icon: "shopping_cart", bgCard: "bg-amber-50",  border: "border-amber-100",  iconColor: "text-amber-600",  catColor: "text-amber-700",  tipColor: "text-amber-700",  titleEn: "Try a bundle deal at Quick Mart",             titleTh: "ลองทำดีลรวมที่ Quick Mart",             bodyEn: "Fewer visitors buy at Quick Mart vs your other shops. A simple \"buy 2 get 1\" or combo offer could bring that number up.", bodyTh: "ผู้เข้าร้าน Quick Mart ซื้อน้อยกว่าร้านอื่น ลอง \"ซื้อ 2 แถม 1\" หรือคอมโบง่ายๆ",    tipEn: "Could add +฿4,500/day",           tipTh: "อาจเพิ่ม +฿4,500/วัน" },
    ],
  },
  coffee: {
    kpi1: "฿142,000", kpi1Sub_en: "this month",          kpi1Sub_th: "เดือนนี้",
    kpi2: "340",      kpi2Sub_en: "visitors today",      kpi2Sub_th: "ผู้เข้าร้านวันนี้",
    kpi3: "38.2%",
    kpi4: "88/100",
    ai_en: { pre: "Coffee Corner earned", money: "฿142,000 this month", mid: "— up +18%! About", pct: "38% of visitors make a purchase", post: " — well above the platform average. Saturday afternoons are your busiest time. Staying open 2 extra hours on Saturdays could bring in ฿21,000 more per month." },
    ai_th: { pre: "Coffee Corner ได้", money: "฿142,000 เดือนนี้", mid: "— เพิ่ม +18%! ประมาณ", pct: "38% ของผู้เข้าร้านซื้อสินค้า", post: " — สูงกว่าค่าเฉลี่ย เปิดนานขึ้น 2 ชั่วโมงวันเสาร์อาจทำให้ได้เงินเพิ่มอีก ฿21,000 ต่อเดือน" },
    actions: [
      { catEn: "Earn More",      catTh: "เพิ่มรายได้",      icon: "trending_up",   bgCard: "bg-green-50",  border: "border-green-100",  iconColor: "text-green-600",  catColor: "text-green-700",  tipColor: "text-green-700",  titleEn: "Extend Saturday hours",                      titleTh: "เปิดนานขึ้นวันเสาร์",                  bodyEn: "Customers are already there on Saturday afternoons. Staying open 2 extra hours could bring in ฿21,000 more per month.",    bodyTh: "ลูกค้ามีอยู่แล้วบ่ายวันเสาร์ เปิดนานขึ้น 2 ชั่วโมงอาจได้ ฿21,000 เพิ่มต่อเดือน",   tipEn: "Could earn +฿21,000/mo",          tipTh: "อาจได้เพิ่ม ฿21,000/เดือน" },
      { catEn: "Keep Customers", catTh: "รักษาลูกค้า",      icon: "group_off",     bgCard: "bg-red-50",    border: "border-red-100",    iconColor: "text-red-500",    catColor: "text-red-600",    tipColor: "text-red-600",    titleEn: "Loyal customers need a nudge",               titleTh: "ลูกค้าประจำต้องการการกระตุ้น",          bodyEn: "A group of your best customers hasn't returned in 18 days. Send them a loyalty reward before they drift away.",              bodyTh: "ลูกค้าขาประจำกลุ่มหนึ่งไม่ได้กลับมา 18 วัน ส่งรางวัลสะสมแต้มก่อนที่พวกเขาจะหนี",     tipEn: "฿62,000/year at risk",            tipTh: "เสี่ยงสูญ ฿62,000/ปี" },
      { catEn: "Quick Win",      catTh: "ทำได้เดี๋ยวนี้เลย", icon: "shopping_cart", bgCard: "bg-amber-50",  border: "border-amber-100",  iconColor: "text-amber-600",  catColor: "text-amber-700",  tipColor: "text-amber-700",  titleEn: "Add a weekend bundle deal",                  titleTh: "เพิ่มดีลวันหยุด",                      bodyEn: "A coffee + pastry combo on weekends could boost the average basket size by 12–15% without adding more customers.",          bodyTh: "คอมโบกาแฟ + เบเกอรี่วันหยุดอาจเพิ่ม basket size ขึ้น 12–15% โดยไม่ต้องรอลูกค้าเพิ่ม", tipEn: "Could add +฿8,400/mo",            tipTh: "อาจเพิ่ม +฿8,400/เดือน" },
    ],
  },
  quick: {
    kpi1: "฿143,000", kpi1Sub_en: "this month",          kpi1Sub_th: "เดือนนี้",
    kpi2: "280",      kpi2Sub_en: "visitors today",      kpi2Sub_th: "ผู้เข้าร้านวันนี้",
    kpi3: "34.6%",
    kpi4: "76/100",
    ai_en: { pre: "Quick Mart earned", money: "฿143,000 this month", mid: "— steady, but only", pct: "35% of visitors buy something", post: " — the lowest across your stores. A simple combo deal (coffee + snack for ฿79) could add about 15 extra sales every day without needing more customers." },
    ai_th: { pre: "Quick Mart ได้", money: "฿143,000 เดือนนี้", mid: "— คงที่ แต่แค่", pct: "35% ของผู้เข้าร้านซื้อสินค้า", post: " — ต่ำสุดในร้านทั้งหมดของคุณ ดีลรวม (กาแฟ + ขนม ฿79) อาจเพิ่มยอดขายได้ ~15 รายการต่อวัน" },
    actions: [
      { catEn: "Boost Sales",    catTh: "เพิ่มยอดขาย",     icon: "shopping_cart", bgCard: "bg-amber-50",  border: "border-amber-100",  iconColor: "text-amber-600",  catColor: "text-amber-700",  tipColor: "text-amber-700",  titleEn: "Try a combo deal",                           titleTh: "ลองทำดีลรวม",                           bodyEn: "Only 35% of visitors buy something — lower than your other stores. A coffee + snack combo for ฿79 could add ~15 extra sales per day.", bodyTh: "35% ของผู้เข้าร้านซื้อสินค้า — ต่ำกว่าร้านอื่น คอมโบกาแฟ + ขนม ฿79 อาจเพิ่มยอดขายได้ ~15 รายการต่อวัน",   tipEn: "Could add +฿4,500/day",           tipTh: "อาจเพิ่ม +฿4,500/วัน" },
      { catEn: "Earn More",      catTh: "เพิ่มรายได้",      icon: "trending_up",   bgCard: "bg-green-50",  border: "border-green-100",  iconColor: "text-green-600",  catColor: "text-green-700",  tipColor: "text-green-700",  titleEn: "Adjust product placement",                   titleTh: "จัดวางสินค้าใหม่",                      bodyEn: "Move high-margin items to eye level near checkout. Small placement changes can increase impulse buys by 10–15%.",             bodyTh: "ย้ายสินค้ากำไรสูงไปอยู่ระดับสายตาใกล้แคชเชียร์ การจัดวางใหม่อาจเพิ่มยอดซื้อโดยไม่ตั้งใจ 10–15%",         tipEn: "Low cost, high impact",           tipTh: "ต้นทุนต่ำ ผลตอบแทนสูง" },
      { catEn: "Quick Win",      catTh: "ทำได้เดี๋ยวนี้เลย", icon: "bolt",          bgCard: "bg-red-50",    border: "border-red-100",    iconColor: "text-red-500",    catColor: "text-red-600",    tipColor: "text-red-600",    titleEn: "Run a Tuesday deal",                         titleTh: "ลองโปรวันอังคาร",                       bodyEn: "Tuesdays have been quieter at Quick Mart. A small discount or 2-for-1 offer could bring in extra traffic on slow days.",      bodyTh: "วันอังคารเงียบกว่าปกติที่ Quick Mart ลดราคาเล็กน้อยหรือซื้อ 1 แถม 1 อาจช่วยดึงคนเพิ่ม",              tipEn: "Could earn +฿3,200 more",         tipTh: "อาจได้เพิ่ม +฿3,200" },
    ],
  },
  lumina: {
    kpi1: "฿318,000", kpi1Sub_en: "this month",          kpi1Sub_th: "เดือนนี้",
    kpi2: "415",      kpi2Sub_en: "visitors today",      kpi2Sub_th: "ผู้เข้าร้านวันนี้",
    kpi3: "38.1%",
    kpi4: "91/100",
    ai_en: { pre: "Lumina Artisan Roastery earned", money: "฿318,000 this month", mid: "— your highest-earning store! About", pct: "38% of visitors make a purchase", post: " — well above platform average. You're in the top 10% of all stores. Focus on maintaining quality and growing the loyal customer base." },
    ai_th: { pre: "Lumina Artisan Roastery ได้", money: "฿318,000 เดือนนี้", mid: "— ร้านที่ทำรายได้สูงสุดของคุณ! ประมาณ", pct: "38% ของผู้เข้าร้านซื้อสินค้า", post: " — สูงกว่าค่าเฉลี่ย คุณอยู่ใน top 10% ของแพลตฟอร์ม" },
    actions: [
      { catEn: "Earn More",      catTh: "เพิ่มรายได้",      icon: "trending_up",   bgCard: "bg-green-50",  border: "border-green-100",  iconColor: "text-green-600",  catColor: "text-green-700",  tipColor: "text-green-700",  titleEn: "Launch a premium seasonal menu",             titleTh: "เปิดตัวเมนูพรีเมียมตามฤดูกาล",          bodyEn: "Your customers spend ฿310/visit. A seasonal premium offering (e.g. single-origin coffee flight) could push the average basket to ฿340+.", bodyTh: "ลูกค้าใช้จ่าย ฿310 ต่อครั้ง เมนูพรีเมียมตามฤดูกาล (เช่น ชุดกาแฟ single-origin) อาจเพิ่ม basket เป็น ฿340+", tipEn: "Could add +฿12,000/mo",           tipTh: "อาจเพิ่ม +฿12,000/เดือน" },
      { catEn: "Keep Customers", catTh: "รักษาลูกค้า",      icon: "loyalty",       bgCard: "bg-blue-50",   border: "border-blue-100",   iconColor: "text-blue-600",   catColor: "text-blue-700",   tipColor: "text-blue-700",   titleEn: "Start a loyalty tier program",               titleTh: "เริ่มโปรแกรม loyalty tier",             bodyEn: "Your revisit rate (62%) is great. A 3-tier loyalty system (Bronze/Silver/Gold) could push it past 70% and build a strong regular base.", bodyTh: "Revisit rate (62%) ดีมากแล้ว ระบบ loyalty 3 ระดับ (Bronze/Silver/Gold) อาจดันให้เกิน 70% และสร้างฐานขาประจำแข็งแกร่ง",   tipEn: "High long-term value",            tipTh: "มูลค่าระยะยาวสูง" },
      { catEn: "Quick Win",      catTh: "ทำได้เดี๋ยวนี้เลย", icon: "business",      bgCard: "bg-amber-50",  border: "border-amber-100",  iconColor: "text-amber-600",  catColor: "text-amber-700",  tipColor: "text-amber-700",  titleEn: "Promote to nearby offices",                  titleTh: "โปรโมทไปยังออฟฟิศใกล้เคียง",            bodyEn: "Lumina is near office buildings. A corporate bulk order program could bring consistent weekday orders and boost revenue.",    bodyTh: "Lumina อยู่ใกล้ออฟฟิศ โปรแกรมสั่งซื้อแบบองค์กรอาจนำมาซึ่งออเดอร์สม่ำเสมอในวันธรรมดา",              tipEn: "Could add +฿25,000/mo",           tipTh: "อาจเพิ่ม +฿25,000/เดือน" },
    ],
  },
};

const STRINGS = {
  en: {
    exportReport: "Export Report",
    headerTitle: "How Are Your Shops Doing?",
    headerSubtitle: "Here's a summary of your stores this month.",
    kpi1Label: "Earned This Month",
    kpi2Label: "People who visited today",
    kpi2Trend_all: "~345 per store",
    kpi3Label: "Visitors who made a purchase",
    kpi3Sub: "~37 in every 100 visitors",
    kpi3Trend: "Up from last month",
    kpi4Label: "How you rank vs other shops",
    kpi4Sub: "platform score",
    kpi4Trend: "Top 25% of all shops",
    aiLabel: "Your shop in plain words",
    actionsTitle: "What You Should Do This Week",
    actionsCount_all: "3 actions",
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
    conversionTip: " Only about 35 out of 100 visitors buy something there — a bit lower than your other two stores. A simple combo deal could add about 15 more sales every day without needing any more foot traffic.",
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
    headerSubtitle: "สรุปภาพรวมร้านของคุณเดือนนี้",
    kpi1Label: "รายได้เดือนนี้",
    kpi2Label: "คนที่มาร้านวันนี้",
    kpi2Trend_all: "~345 คนต่อร้าน",
    kpi3Label: "ผู้เข้าร้านที่ซื้อสินค้า",
    kpi3Sub: "~37 คนจากทุกๆ 100 คน",
    kpi3Trend: "เพิ่มขึ้นจากเดือนที่แล้ว",
    kpi4Label: "คุณอยู่ตรงไหนเทียบกับร้านอื่น",
    kpi4Sub: "คะแนนในระบบ",
    kpi4Trend: "Top 25% ของร้านทั้งหมด",
    aiLabel: "สรุปภาพรวมร้านคุณ",
    actionsTitle: "สิ่งที่คุณควรทำสัปดาห์นี้",
    actionsCount_all: "3 รายการ",
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
    customersTip: " แต่กลุ่มอายุน้อยสุด (18–25 ปี) เติบโตเร็วที่สุด — เพิ่ม +8% เดือนนี้",
    conversionTitle: "ผู้เข้าร้านซื้อของไหม?",
    conversionSubtitle: "จากทุกคนที่เดินเข้ามา — กี่คนที่ซื้อสินค้าจริงๆ?",
    colStore: "ร้าน",
    colBought: "ซื้อ",
    colVisited: "เข้าร้าน",
    colPct: "% ที่ซื้อ",
    conversionTipBold: "Quick Mart ยังมีพื้นที่พัฒนาได้มากที่สุด",
    conversionTip: " ประมาณ 35 จาก 100 คนซื้อสินค้าที่ร้านนี้ ดีลรวมง่ายๆ อาจเพิ่มยอดขายได้ ~15 รายการต่อวัน",
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
  const { storeId } = useStoreFilter();
  const T = STRINGS[lang];

  const dd = DASH_BY_STORE[storeId];
  const kpi1Sub = lang === "th" ? dd.kpi1Sub_th : dd.kpi1Sub_en;
  const kpi2Sub = lang === "th" ? dd.kpi2Sub_th : dd.kpi2Sub_en;
  const aiText = lang === "th" ? dd.ai_th : dd.ai_en;

  const filteredConversion = storeId === "all"
    ? CONVERSION
    : CONVERSION.filter((c) => c.id === storeId);

  const filteredHighlights = storeId === "all"
    ? HIGHLIGHTS.filter((h) => h.id !== "lumina")
    : HIGHLIGHTS.filter((h) => h.id === storeId);

  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold italic text-[#1C3A1C]">{T.headerTitle}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{T.headerSubtitle}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
          <div className="text-3xl font-bold text-on-surface">{dd.kpi1}</div>
          <div className="text-sm text-on-surface-variant mb-3">{kpi1Sub}</div>
          <span className="text-xs font-bold text-primary">More than last month</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
          <div className="text-3xl font-bold text-on-surface">{dd.kpi2}</div>
          <div className="text-sm text-on-surface-variant mb-3">{kpi2Sub}</div>
          {storeId === "all" && <span className="text-xs text-on-surface-variant">{T.kpi2Trend_all}</span>}
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
          <div className="text-3xl font-bold text-on-surface">{dd.kpi3}</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi3Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi3Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
          <div className="text-3xl font-bold text-on-surface">{dd.kpi4}</div>
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
            {aiText.pre} <strong className="text-on-surface">{aiText.money}</strong> {aiText.mid}{" "}
            <strong className="text-on-surface">{aiText.pct}</strong>{aiText.post}
          </p>
        </div>
      </div>

      {/* What You Should Do This Week */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[18px] text-primary">bolt</span>
          <h3 className="text-base font-bold text-on-surface">{T.actionsTitle}</h3>
          <span className="ml-auto text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{T.actionsCount_all}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {dd.actions.map((a, i) => (
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
              <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
                {lang === "th" ? a.bodyTh : a.bodyEn}
              </p>
              <div className={`text-xs font-bold ${a.tipColor}`}>
                {lang === "th" ? a.tipTh : a.tipEn}
              </div>
            </div>
          ))}
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
            {filteredConversion.map((c) => (
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
              {storeId === "all" ? (
                <><strong className="text-on-surface">{T.conversionTipBold}</strong>{T.conversionTip}</>
              ) : storeId === "quick" ? (
                <>Only about <strong className="text-on-surface">35 out of 100 visitors</strong> buy something at Quick Mart — a bit lower than your other stores. A simple combo deal (e.g. coffee + snack for ฿79) could add about 15 more sales every day without any extra foot traffic.</>
              ) : storeId === "coffee" ? (
                <>Coffee Corner converts <strong className="text-on-surface">38.2% of visitors into buyers</strong> — well above the platform average. Saturday afternoons bring the most traffic. Extending hours or running a short weekend promo could push this even higher.</>
              ) : (
                <>Lumina Artisan Roastery converts <strong className="text-on-surface">38.1% of visitors</strong> — your top conversion rate. Customers who walk in are highly engaged. A loyalty card or upsell prompt at checkout could increase the average basket size further.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Store Report Cards */}
      <div className={`grid gap-6 ${filteredHighlights.length === 1 ? "grid-cols-1 max-w-xl" : "grid-cols-2"}`}>
        {filteredHighlights.map((h) => {
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
