// ─────────────────────────────────────────────────────────────────────────────
// SYMBOLIC AI — Station ↔ store-type fit.
//
// Recommends which retail store TYPES suit a station. The station's SURROUNDINGS
// (what's nearby — a school, offices, a hospital, a mall) DRIVE the pick and the
// reasoning ("next to a university → a dessert/bubble-tea shop for students"),
// with traffic + average spend as supporting signal. Pure function.
// ─────────────────────────────────────────────────────────────────────────────

export type StationSignal = {
  displayId?:     string;
  trafficLevel:   "high" | "medium" | "low" | string;
  basketThb:      number | null;
  dailyCustomers: number | null;
};

export type StoreTypeFit = {
  category:   string;
  categoryTh: string;
  fitScore:   number; // 0–100
  reason:     string;
  reasonTh:   string;
};

const CATALOG: { cat: string; catTh: string; wantTraffic: "high" | "medium" | "low"; wantBasket: number }[] = [
  { cat: "Premium Convenience / Market", catTh: "พรีเมียมคอนวีเนียนซ์/มาร์เก็ต", wantTraffic: "high",   wantBasket: 305 },
  { cat: "Specialty / Artisan Cafe",     catTh: "คาเฟ่สเปเชียลตี้",              wantTraffic: "high",   wantBasket: 295 },
  { cat: "Grab & Go Coffee",             catTh: "กาแฟซื้อกลับบ้าน",             wantTraffic: "high",   wantBasket: 250 },
  { cat: "Quick-Service Food",           catTh: "อาหารจานด่วน",                 wantTraffic: "high",   wantBasket: 235 },
  { cat: "Bakery & Dessert",             catTh: "เบเกอรี่ & ของหวาน",           wantTraffic: "medium", wantBasket: 265 },
  { cat: "Pharmacy & Wellness",          catTh: "ร้านยา & สุขภาพ",              wantTraffic: "medium", wantBasket: 240 },
  { cat: "Essentials Convenience",       catTh: "ของใช้จำเป็น",                 wantTraffic: "low",    wantBasket: 215 },
];

const TRAFFIC_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

// Per-station surroundings (the 6 stations are fixed) — what's nearby + which
// store types that neighbourhood actually pulls. `favors` is ranked best-first.
type Area = { landmark: string; landmarkTh: string; favors: string[] };
const STATION_AREA: Record<string, Area> = {
  "STN-001": { landmark: "a dense office-and-condo cluster", landmarkTh: "ย่านออฟฟิศและคอนโดหนาแน่น",
    favors: ["Specialty / Artisan Cafe", "Grab & Go Coffee", "Bakery & Dessert"] },
  "STN-002": { landmark: "premium offices and expat residences", landmarkTh: "ออฟฟิศพรีเมียมและที่พักชาวต่างชาติ",
    favors: ["Premium Convenience / Market", "Specialty / Artisan Cafe", "Bakery & Dessert"] },
  "STN-003": { landmark: "a university and student condos", landmarkTh: "มหาวิทยาลัยและคอนโดนักศึกษา",
    favors: ["Bakery & Dessert", "Quick-Service Food", "Grab & Go Coffee"] },
  "STN-004": { landmark: "a big-box mall and suburban family homes", landmarkTh: "ห้างใหญ่และบ้านครอบครัวชานเมือง",
    favors: ["Quick-Service Food", "Bakery & Dessert", "Essentials Convenience"] },
  "STN-005": { landmark: "a major transit and weekend-market hub", landmarkTh: "ศูนย์กลางขนส่งและตลาดสุดสัปดาห์",
    favors: ["Grab & Go Coffee", "Quick-Service Food", "Premium Convenience / Market"] },
  "STN-018": { landmark: "a residential area beside a hospital", landmarkTh: "ย่านที่พักอาศัยติดโรงพยาบาล",
    favors: ["Pharmacy & Wellness", "Essentials Convenience", "Bakery & Dessert"] },
};

const trafficTh = (t: string) => (t === "high" ? "สูง" : t === "low" ? "ต่ำ" : "ปานกลาง");

// Landmark/surroundings phrase for a station (used by the explore/station chat).
export function stationLandmark(displayId: string): string {
  return STATION_AREA[displayId]?.landmark ?? "";
}

export function recommendStoreTypes(signal: StationSignal): StoreTypeFit[] {
  const tRank = TRAFFIC_RANK[signal.trafficLevel] ?? 2;
  const basket = signal.basketThb ?? 260;
  const area = signal.displayId ? STATION_AREA[signal.displayId] : undefined;
  const dayStr = signal.dailyCustomers ? ` (~${signal.dailyCustomers.toLocaleString()}/day)` : "";
  const dayStrTh = signal.dailyCustomers ? ` (~${signal.dailyCustomers.toLocaleString()}/วัน)` : "";

  const scored = CATALOG.map((c) => {
    // Base from traffic + spend fit (supporting signal).
    const trafficGap = Math.abs(tRank - TRAFFIC_RANK[c.wantTraffic]);
    const basketGap = Math.abs(basket - c.wantBasket);
    const base = 68 - trafficGap * 8 - Math.min(18, basketGap / 6);
    // Surroundings DRIVE the pick.
    const favIdx = area ? area.favors.indexOf(c.cat) : -1;
    const favorBoost = favIdx === 0 ? 34 : favIdx === 1 ? 22 : favIdx === 2 ? 12 : 0;
    const fitScore = Math.max(40, Math.min(99, Math.round(base + favorBoost)));

    const reason = area
      ? `Right by ${area.landmark}, a ${c.cat.toLowerCase()} fits the people here — supported by ${signal.trafficLevel} foot traffic${dayStr} and ฿${Math.round(basket)} average spend.`
      : `${signal.trafficLevel} foot traffic${dayStr} and ฿${Math.round(basket)} average spend suit a ${c.cat.toLowerCase()}.`;
    const reasonTh = area
      ? `ติด${area.landmarkTh} ${c.catTh}จึงเหมาะกับคนแถวนี้ — หนุนด้วยทราฟฟิกระดับ${trafficTh(signal.trafficLevel)}${dayStrTh} และยอดใช้จ่ายเฉลี่ย ฿${Math.round(basket)}`
      : `ทราฟฟิกระดับ${trafficTh(signal.trafficLevel)}${dayStrTh} และยอดใช้จ่าย ฿${Math.round(basket)} เหมาะกับ${c.catTh}`;
    return { category: c.cat, categoryTh: c.catTh, fitScore, reason, reasonTh };
  });

  return scored.sort((a, b) => b.fitScore - a.fitScore).slice(0, 3);
}
