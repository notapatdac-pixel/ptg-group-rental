export type StationUnit = {
  id: string;
  type: string;
  sqm: number;
  rent: number;
  status: "occupied" | "vacant";
  tenant: string | null;
};

export type StationData = {
  name: string;
  fullName: string;
  location: string;
  province: string;
  type: string;
  area: number;
  hours: string;
  description: string;
  image: string;
  occupied: number;
  total: number;
  revenue: string;
  footfall: string;
  aiScore: number;
  aiNote: string;
  aiNoteTh: string;
  units: StationUnit[];
  // retailer-facing KPIs (shared source of truth with lib/stations.ts)
  dailyCustomersNum: number;
  dailyDelta: string;
  dwellMinNum: number;
  estRevenueK: number;
};

export const STATIONS_DATA: Record<string, StationData> = {
  "PTG Lat Phrao 71": {
    name: "PTG Lat Phrao 71",
    fullName: "PTG Lat Phrao 71 – Retail Hub",
    location: "Lat Phrao Road, Bangkok",
    province: "Bangkok",
    type: "Premium Transit Hub",
    area: 3800,
    hours: "06:00 – 24:00",
    description:
      "Transit retail hub serving daily commuters along Lat Phrao Road. Strong F&B performance with high repeat visitor rate.",
    image: "/images/station-ptg-latphrao71.png",
    occupied: 6,
    total: 8,
    revenue: "498K",
    footfall: "12,715",
    aiScore: 88,
    aiNote:
      "Strong performer. Recommend targeting premium F&B or wellness tenants for the two vacant units to maximise revenue per sqm.",
    aiNoteTh:
      "สาขานี้มีผลงานดี แนะนำให้เน้นหา F&B พรีเมียมหรือผู้เช่าด้านสุขภาพสำหรับยูนิตว่าง 2 แห่ง เพื่อเพิ่มรายได้ต่อตารางเมตรให้สูงสุด",
    dailyCustomersNum: 890,
    dailyDelta: "+12%",
    dwellMinNum: 12,
    estRevenueK: 285,
    units: [
      { id: "A1", type: "Premium Kiosk",   sqm: 25, rent: 65000, status: "occupied", tenant: "Coffee Corner Co." },
      { id: "A2", type: "Pop-up Corner",   sqm: 8,  rent: 18000, status: "occupied", tenant: "Artisan Brew" },
      { id: "A3", type: "Express Counter", sqm: 12, rent: 28000, status: "occupied", tenant: "FreshMart Ltd." },
      { id: "B1", type: "Standard Kiosk",  sqm: 20, rent: 45000, status: "occupied", tenant: "PharmaPlus" },
      { id: "B2", type: "Boutique Unit",   sqm: 35, rent: 85000, status: "vacant",   tenant: null },
      { id: "B3", type: "Standard Kiosk",  sqm: 18, rent: 42000, status: "occupied", tenant: "QuickBite" },
      { id: "C1", type: "Express Counter", sqm: 10, rent: 24000, status: "vacant",   tenant: null },
      { id: "C2", type: "Pop-up Corner",   sqm: 8,  rent: 18000, status: "occupied", tenant: "Bloom Snacks" },
    ],
  },
  "PTG Sukhumvit 62": {
    name: "PTG Sukhumvit 62",
    fullName: "PTG Sukhumvit 62 – Retail Hub",
    location: "Sukhumvit Road, Bangkok",
    province: "Bangkok",
    type: "Premium Transit Hub",
    area: 4200,
    hours: "06:00 – 24:00",
    description:
      "Premium transit retail hub near BTS On Nut. High-income catchment with strong expat community presence.",
    image: "/images/station-ptg-ramaix.png",
    occupied: 8,
    total: 8,
    revenue: "318K",
    footfall: "10,398",
    aiScore: 94,
    aiNote:
      "Top 10% of PTG network. Fully occupied — consider a waitlist strategy and premium pricing at next renewal cycle.",
    aiNoteTh:
      "ติด 10% สูงสุดของเครือข่าย PTG เช่าเต็มทุกยูนิต — ควรพิจารณาสร้างรายชื่อรอและปรับราคาเบี้ยเช่าขึ้นในรอบต่อสัญญา",
    dailyCustomersNum: 720,
    dailyDelta: "+8%",
    dwellMinNum: 9,
    estRevenueK: 198,
    units: [
      { id: "A1", type: "Premium Kiosk",   sqm: 30,  rent: 85000,  status: "occupied", tenant: "7-Eleven Express" },
      { id: "A2", type: "Pop-up Corner",   sqm: 8,   rent: 22000,  status: "occupied", tenant: "Coffee Corner Co." },
      { id: "A3", type: "Express Counter", sqm: 12,  rent: 34000,  status: "occupied", tenant: "Bloom Beauty" },
      { id: "B1", type: "Boutique Unit",   sqm: 60,  rent: 145000, status: "occupied", tenant: "QuickBite Kitchen" },
      { id: "B2", type: "Standard Kiosk",  sqm: 20,  rent: 55000,  status: "occupied", tenant: "FreshMart Ltd." },
      { id: "B3", type: "Flagship Store",  sqm: 120, rent: 280000, status: "occupied", tenant: "Tanaka Premium Market" },
      { id: "C1", type: "Express Counter", sqm: 10,  rent: 28000,  status: "occupied", tenant: "PharmaPlus Express" },
      { id: "C2", type: "Standard Kiosk",  sqm: 18,  rent: 42000,  status: "occupied", tenant: "Artisan Brew" },
    ],
  },
  "PTG Bang Na": {
    name: "PTG Bang Na",
    fullName: "PTG Bang Na – Highway Stop",
    location: "Bang Na Road, Samut Prakan",
    province: "Samut Prakan",
    type: "Highway Stop",
    area: 1900,
    hours: "06:30 – 23:00",
    description:
      "Highway-facing station serving Bang Na–Trat corridor traffic. High transient volume with strong fuel-stop conversion.",
    image: "/images/station-ptg-bangna.png",
    occupied: 1,
    total: 1,
    revenue: "210K",
    footfall: "8,420",
    aiScore: 84,
    aiNote:
      "High growth trajectory. Single unit fully leased — consider subdividing the space at lease renewal to increase revenue per sqm.",
    aiNoteTh:
      "ศักยภาพเติบโตสูง ยูนิตเดียวเช่าเต็ม — พิจารณาแบ่งพื้นที่เมื่อต่อสัญญาเพื่อเพิ่มรายได้ต่อตารางเมตร",
    dailyCustomersNum: 640,
    dailyDelta: "+15%",
    dwellMinNum: 11,
    estRevenueK: 210,
    units: [
      { id: "A1", type: "Highway Frontage", sqm: 80, rent: 180000, status: "occupied", tenant: "QSR Express" },
    ],
  },
};
