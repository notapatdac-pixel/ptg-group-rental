import stationLatphrao71 from "@/components/image/station-ptg-latphrao71.png";
import stationRamaix    from "@/components/image/station-ptg-ramaix.png";
import stationBangna    from "@/components/image/station-ptg-bangna.png";
import { STATIONS_DATA } from "@/components/landlord_backoffice/stationsData";

const D = {
  latphrao71: STATIONS_DATA["PTG Lat Phrao 71"],
  sukhumvit:  STATIONS_DATA["PTG Sukhumvit 62"],
  bangna:     STATIONS_DATA["PTG Bang Na"],
} as const;

function parseFootfall(s: string): number { return parseInt(s.replace(/,/g, ""), 10); }
function parseRevenueK(s: string): number  { return parseInt(s, 10); }

export interface StationSpace {
  unit: string;
  name: string;
  price: string;
  desc: string;
  img: string;
}

export interface TenantUnit {
  id: string;
  type: string;
  tenant: string | null;
  sqm: number;
  rent: number;
  status: "occupied" | "vacant";
}

export interface StationDetail {
  daily_customers: string;
  daily_delta: string;
  dwell_min: string;
  est_revenue: string;
  ai_score: string;
  daily_customers_num: number;
  dwell_min_num: number;
  est_revenue_k: number;
  ai_score_num: number;
  pro_card_stat: { value: number; suffix: string; label: string };
  chart_heights_pct: number[];
  chart_peak_label: string;
  specs: [string, string, string][];
  spaces: StationSpace[];
  operating_hours: string;
  total_area: number;
  vacant_count: number;
  occupied_count: number;
  rent_min: number;
  rent_max: number;
  ai_score_landlord: number;
  ai_note: string;
  tenant_mix: TenantUnit[];
}

export interface Station {
  id: string;
  title: string;
  province: string;
  traffic_level: string;
  location: string;
  match_badge: string;
  traffic_badge: string;
  traffic_badge_class: string;
  image: string;
  max_area: [string, string];
  available: [string, string];
  spaces_count: number;
  lat: number;
  lng: number;
  traffic_badge_short: string;
  region_line: string;
  detail: StationDetail;
}

const UNIT_IMG_A = "https://lh3.googleusercontent.com/aida-public/AB6AXuCz3XtqGbmMTSMsargnXfJ5zf0xl5MGmmzhDayN0Tncwt_lqg8fuqix60xpeUM4Vq7hewDMFte2Ri1deDQqcVQc3SJMylk118zYqatT7z44ow-EI9MtsZJB3vk_fsVSgRdTfnX0HmTbeEQV9--dtPUxN7qQnwFBJS3tOuJlGEirzYRdYLBJNmyPDEw28drrUhuPAepy-jf-EBMXmsI-8Pp_PchALiEuKCraSqoKF-Ztt1yzcrm5S-LgltxiXOJBQCwaF8O7CCzG8wU";
const UNIT_IMG_B = "https://lh3.googleusercontent.com/aida-public/AB6AXuAjEPBYzF1nbHKkByLnab6NwdRzzKNR5lot2R8o4j8y2gD3WVDURycK3t57SVyHYOippPCco3jGJFriKvQ7HrKlzVjYxR1K6Wa5agQ2_Xyvvmm8uWWGVJnX0KKyUy1Tm2tgMBcSoLX8mmi6SLJ2339T9IAaFrlIVAC748W7_y6G585FqNQrm9PKKo2AH8b-5swymlJFCHcbttdLfRTDiDRWlS45KGmJwY8j6AYpPhuT7hgt9oX5OhdCs0pmtfhF3VrgBtkT7tQm2o0";
const UNIT_IMG_C = "https://lh3.googleusercontent.com/aida-public/AB6AXuB9BiLTGmDNpskH2e2fcCCKjU6V8AaWuFDnQ-Uo4_ao1tUeT-nerhVjJAWaxDAx1nqzKao6S4fvzWl3WhZ9YmwQefiL2UBYaDOrJVRKIBmDa21q6JkVRzFgIWMQcxWy17uesk9igQyY8Y2vlQFvu8_a4cH3xm1tINCsytmvM_sTNQ0CRfhBFN5iAJIxQPcRDO1JaAYzPGAkmk1rDrJ7uBSZjG4HIjdnRSpWkCsVYE9MNmp1GEHpHx1OEEqGiGZ9FqZhcihTJPGvBUs";

export const STATIONS: Station[] = [
  // ── STN-001 Lat Phrao 71 ───────────────────────────────────────────────────
  {
    id: "STN-001",
    title: "PTG Station Lat Phrao 71",
    province: "Bangkok",
    traffic_level: "high",
    location: "Lat Phrao Road, Bangkok",
    match_badge: "99.8% Match",
    traffic_badge: "High Traffic",
    traffic_badge_class: "bg-on-secondary-container/10 text-on-secondary-container",
    image: stationLatphrao71.src,
    max_area: ["Max Area", "45 sqm"],
    available: ["Available", "2 Spaces"],
    spaces_count: 2,
    lat: 13.8046, lng: 100.5800,
    traffic_badge_short: "High",
    region_line: "Bangkok, Thailand",
    detail: {
      daily_customers: D.latphrao71.footfall,
      daily_delta:     D.latphrao71.dailyDelta,
      dwell_min:       String(D.latphrao71.dwellMinNum),
      est_revenue:     D.latphrao71.revenue,
      ai_score: "94%",
      daily_customers_num: parseFootfall(D.latphrao71.footfall),
      dwell_min_num:   D.latphrao71.dwellMinNum,
      est_revenue_k:   parseRevenueK(D.latphrao71.revenue),
      ai_score_num: 94,
      operating_hours: D.latphrao71.hours,
      total_area:      D.latphrao71.area,
      vacant_count:    D.latphrao71.total - D.latphrao71.occupied,
      occupied_count:  D.latphrao71.occupied,
      rent_min: Math.min(...D.latphrao71.units.map(u => u.rent)),
      rent_max: Math.max(...D.latphrao71.units.map(u => u.rent)),
      ai_score_landlord: D.latphrao71.aiScore,
      ai_note:          D.latphrao71.aiNote,
      tenant_mix:       D.latphrao71.units.map(u => ({ ...u })),
      pro_card_stat: { value: 99.8, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [40, 55, 85, 60, 45, 70],
      chart_peak_label: "924 Peak",
      specs: [
        ["Land Area", "3,800 sq.m.", "VERIFIED"],
        ["Fueling Points", "8 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "07:00 – 09:00, 17:00 – 19:00", "ESTIMATED"],
        ["Nearby Competitors", "3 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        { unit: "UNIT E-01", name: "Pop-up Stand", price: "10k", desc: "Compact pop-up space near exit. Ideal for beverages or snacks.", img: UNIT_IMG_A },
        { unit: "UNIT E-02", name: "Pop-up Stand", price: "10k", desc: "Second pop-up spot with good foot-traffic exposure.", img: UNIT_IMG_B },
      ],
    },
  },

  // ── STN-002 Sukhumvit 62 ──────────────────────────────────────────────────
  {
    id: "STN-002",
    title: "PTG Station Sukhumvit 62",
    province: "Bangkok",
    traffic_level: "high",
    location: "Sukhumvit Road, Bangkok",
    match_badge: "99.7% Match",
    traffic_badge: "High Traffic",
    traffic_badge_class: "bg-on-secondary-container/10 text-on-secondary-container",
    image: stationRamaix.src,
    max_area: ["Max Area", "120 sqm"],
    available: ["Available", "0 Spaces"],
    spaces_count: 0,
    lat: 13.7200, lng: 100.5990,
    traffic_badge_short: "High",
    region_line: "Bangkok, Thailand",
    detail: {
      daily_customers: D.sukhumvit.footfall,
      daily_delta:     D.sukhumvit.dailyDelta,
      dwell_min:       String(D.sukhumvit.dwellMinNum),
      est_revenue:     D.sukhumvit.revenue,
      ai_score: "89%",
      daily_customers_num: parseFootfall(D.sukhumvit.footfall),
      dwell_min_num:   D.sukhumvit.dwellMinNum,
      est_revenue_k:   parseRevenueK(D.sukhumvit.revenue),
      ai_score_num: 89,
      operating_hours: D.sukhumvit.hours,
      total_area:      D.sukhumvit.area,
      vacant_count:    D.sukhumvit.total - D.sukhumvit.occupied,
      occupied_count:  D.sukhumvit.occupied,
      rent_min: Math.min(...D.sukhumvit.units.map(u => u.rent)),
      rent_max: Math.max(...D.sukhumvit.units.map(u => u.rent)),
      ai_score_landlord: D.sukhumvit.aiScore,
      ai_note:          D.sukhumvit.aiNote,
      tenant_mix:       D.sukhumvit.units.map(u => ({ ...u })),
      pro_card_stat: { value: 99.7, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [38, 52, 80, 58, 48, 68],
      chart_peak_label: "850 Peak",
      specs: [
        ["Land Area", "4,200 sq.m.", "VERIFIED"],
        ["Fueling Points", "14 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "07:00 – 09:30, 16:30 – 19:00", "ESTIMATED"],
        ["Nearby Competitors", "2 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [],
    },
  },

  // ── STN-003 Rama 9 ────────────────────────────────────────────────────────
  {
    id: "STN-003",
    title: "PTG Station Rama 9",
    province: "Bangkok",
    traffic_level: "medium",
    location: "Rama IX Road, Bangkok",
    match_badge: "99.8% Match",
    traffic_badge: "Medium Traffic",
    traffic_badge_class: "bg-tertiary-container/20 text-on-tertiary-container",
    image: stationRamaix.src,
    max_area: ["Max Area", "35 sqm"],
    available: ["Available", "2 Spaces"],
    spaces_count: 2,
    lat: 13.7500, lng: 100.5650,
    traffic_badge_short: "Medium",
    region_line: "Bangkok, Thailand",
    detail: {
      daily_customers: "8,326",
      daily_delta: "-0.9%",
      dwell_min: "21",
      est_revenue: "287",
      ai_score: "81%",
      daily_customers_num: 8326,
      dwell_min_num: 21,
      est_revenue_k: 287,
      ai_score_num: 81,
      operating_hours: "06:00 – 22:00",
      total_area: 3100,
      vacant_count: 2,
      occupied_count: 4,
      rent_min: 9000,
      rent_max: 35000,
      ai_score_landlord: 81,
      ai_note: "Growing office district. F-01 and F-02 vacancies ideal for café or lunch kiosk targeting the 26–45 professional demographic.",
      tenant_mix: [
        { id: "A-01", type: "Corner Kiosk",   sqm: 25, rent: 22000, status: "occupied", tenant: "Bloom Snacks" },
        { id: "A-02", type: "Boutique Shop",  sqm: 35, rent: 35000, status: "occupied", tenant: "QuickBite" },
        { id: "B-01", type: "Express Counter",sqm: 12, rent: 14000, status: "occupied", tenant: "FreshMart Ltd." },
        { id: "B-02", type: "Inner Kiosk",    sqm: 18, rent: 18000, status: "occupied", tenant: "PharmaPlus" },
        { id: "F-01", type: "Boutique Shop",  sqm: 35, rent: 35000, status: "vacant",   tenant: null },
        { id: "F-02", type: "Pop-up Stand",   sqm: 8,  rent: 9000,  status: "vacant",   tenant: null },
      ],
      pro_card_stat: { value: 99.8, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [35, 48, 62, 55, 50, 58],
      chart_peak_label: "780 Peak",
      specs: [
        ["Land Area", "3,100 sq.m.", "VERIFIED"],
        ["Fueling Points", "16 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "07:30 – 10:00, 17:00 – 19:30", "ESTIMATED"],
        ["Nearby Competitors", "2 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        { unit: "UNIT F-01", name: "Boutique Shop", price: "35k", desc: "35 sqm boutique space in growing office corridor. Perfect for café or lunch F&B.", img: UNIT_IMG_A },
        { unit: "UNIT F-02", name: "Pop-up Stand",  price: "9k",  desc: "Compact 8 sqm pop-up near car park entrance. Ideal for drinks or snacks.", img: UNIT_IMG_B },
      ],
    },
  },

  // ── STN-004 Bang Na Complex ───────────────────────────────────────────────
  {
    id: "STN-004",
    title: "PTG Station Bang Na Complex",
    province: "Samut Prakan",
    traffic_level: "medium",
    location: "Bang Na, Samut Prakan",
    match_badge: "99.7% Match",
    traffic_badge: "Medium Traffic",
    traffic_badge_class: "bg-secondary-container/30 text-on-secondary-container",
    image: stationBangna.src,
    max_area: ["Max Area", "35 sqm"],
    available: ["Available", "4 Spaces"],
    spaces_count: 4,
    lat: 13.6740, lng: 100.5930,
    traffic_badge_short: "Medium",
    region_line: "Samut Prakan, Thailand",
    detail: {
      daily_customers: D.bangna.footfall,
      daily_delta:     D.bangna.dailyDelta,
      dwell_min:       String(D.bangna.dwellMinNum),
      est_revenue:     D.bangna.revenue,
      ai_score: "75%",
      daily_customers_num: parseFootfall(D.bangna.footfall),
      dwell_min_num:   D.bangna.dwellMinNum,
      est_revenue_k:   parseRevenueK(D.bangna.revenue),
      ai_score_num: 75,
      operating_hours: D.bangna.hours,
      total_area:      D.bangna.area,
      vacant_count:    4,
      occupied_count:  2,
      rent_min: 8000,
      rent_max: 30000,
      ai_score_landlord: D.bangna.aiScore,
      ai_note:          D.bangna.aiNote,
      tenant_mix: [
        { id: "A-01", type: "Corner Kiosk",   sqm: 25, rent: 20000, status: "occupied", tenant: "Coffee Express" },
        { id: "A-02", type: "Boutique Shop",  sqm: 35, rent: 30000, status: "occupied", tenant: "QuickBite" },
        { id: "B-01", type: "Inner Kiosk",    sqm: 18, rent: 15000, status: "vacant",   tenant: null },
        { id: "B-02", type: "Express Counter",sqm: 12, rent: 12000, status: "vacant",   tenant: null },
        { id: "C-01", type: "Pop-up Stand",   sqm: 8,  rent: 8000,  status: "vacant",   tenant: null },
        { id: "C-02", type: "Pop-up Stand",   sqm: 8,  rent: 8000,  status: "vacant",   tenant: null },
      ],
      pro_card_stat: { value: 99.7, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [42, 50, 78, 52, 48, 65],
      chart_peak_label: "702 Peak",
      specs: [
        ["Land Area", "1,900 sq.m.", "VERIFIED"],
        ["Fueling Points", "10 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "06:30 – 09:00, 16:00 – 18:30", "ESTIMATED"],
        ["Nearby Competitors", "4 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        { unit: "UNIT B-01", name: "Inner Kiosk",    price: "15k", desc: "18 sqm indoor kiosk with utilities. Suited for F&B or retail.", img: UNIT_IMG_A },
        { unit: "UNIT B-02", name: "Express Counter", price: "12k", desc: "12 sqm express counter, high footfall near fuel pumps.", img: UNIT_IMG_B },
        { unit: "UNIT C-01", name: "Pop-up Stand",    price: "8k",  desc: "Compact 8 sqm pop-up. Low cost entry point.", img: UNIT_IMG_C },
        { unit: "UNIT C-02", name: "Pop-up Stand",    price: "8k",  desc: "Second pop-up spot near customer restrooms.", img: UNIT_IMG_A },
      ],
    },
  },

  // ── STN-005 Chatuchak ─────────────────────────────────────────────────────
  {
    id: "STN-005",
    title: "PTG Station Chatuchak",
    province: "Bangkok",
    traffic_level: "high",
    location: "Din Daeng, Bangkok",
    match_badge: "99.7% Match",
    traffic_badge: "High Traffic",
    traffic_badge_class: "bg-on-secondary-container/10 text-on-secondary-container",
    image: stationLatphrao71.src,
    max_area: ["Max Area", "40 sqm"],
    available: ["Available", "2 Spaces"],
    spaces_count: 2,
    lat: 13.8008, lng: 100.5551,
    traffic_badge_short: "High",
    region_line: "Bangkok, Thailand",
    detail: {
      daily_customers: "9,100",
      daily_delta: "+0.9%",
      dwell_min: "23",
      est_revenue: "337",
      ai_score: "87%",
      daily_customers_num: 9100,
      dwell_min_num: 23,
      est_revenue_k: 337,
      ai_score_num: 87,
      operating_hours: "07:00 – 22:00",
      total_area: 2800,
      vacant_count: 2,
      occupied_count: 4,
      rent_min: 12000,
      rent_max: 42000,
      ai_score_landlord: 87,
      ai_note: "Consistent performer near Chatuchak market and MRT hub. C-01 and C-02 available — good match for weekend retail or F&B brands.",
      tenant_mix: [
        { id: "A-01", type: "Corner Kiosk",   sqm: 25, rent: 28000, status: "occupied", tenant: "Artisan Brew" },
        { id: "A-02", type: "Boutique Shop",  sqm: 40, rent: 42000, status: "occupied", tenant: "FreshMart Ltd." },
        { id: "B-01", type: "Express Counter",sqm: 12, rent: 18000, status: "occupied", tenant: "Bloom Snacks" },
        { id: "B-02", type: "Inner Kiosk",    sqm: 18, rent: 22000, status: "occupied", tenant: "Coffee Express" },
        { id: "C-01", type: "Pop-up Stand",   sqm: 8,  rent: 12000, status: "vacant",   tenant: null },
        { id: "C-02", type: "Express Counter",sqm: 12, rent: 18000, status: "vacant",   tenant: null },
      ],
      pro_card_stat: { value: 99.7, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [36, 50, 75, 55, 48, 62],
      chart_peak_label: "810 Peak",
      specs: [
        ["Land Area", "2,800 sq.m.", "VERIFIED"],
        ["Fueling Points", "10 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "07:00 – 09:00, 17:00 – 20:00", "ESTIMATED"],
        ["Nearby Competitors", "5 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        { unit: "UNIT C-01", name: "Pop-up Stand",    price: "12k", desc: "8 sqm pop-up near Chatuchak market foot-traffic corridor.", img: UNIT_IMG_A },
        { unit: "UNIT C-02", name: "Express Counter",  price: "18k", desc: "12 sqm express counter with strong commuter visibility.", img: UNIT_IMG_B },
      ],
    },
  },

  // ── STN-018 Nonthaburi ────────────────────────────────────────────────────
  {
    id: "STN-018",
    title: "PTG Station Nonthaburi",
    province: "Nonthaburi",
    traffic_level: "medium",
    location: "Nonthaburi City District",
    match_badge: "99.7% Match",
    traffic_badge: "Medium Traffic",
    traffic_badge_class: "bg-tertiary-container/20 text-on-tertiary-container",
    image: stationBangna.src,
    max_area: ["Max Area", "30 sqm"],
    available: ["Available", "2 Spaces"],
    spaces_count: 2,
    lat: 13.8624, lng: 100.5185,
    traffic_badge_short: "Medium",
    region_line: "Nonthaburi, Thailand",
    detail: {
      daily_customers: "340",
      daily_delta: "+11.3%",
      dwell_min: "37",
      est_revenue: "142",
      ai_score: "88%",
      daily_customers_num: 340,
      dwell_min_num: 37,
      est_revenue_k: 142,
      ai_score_num: 88,
      operating_hours: "07:00 – 21:30",
      total_area: 2200,
      vacant_count: 2,
      occupied_count: 2,
      rent_min: 9000,
      rent_max: 24000,
      ai_score_landlord: 88,
      ai_note: "Fast-growing commuter station north of Bangkok. Revenue surged 11% last month. B-01 and B-02 are ideal entry points for new F&B concepts.",
      tenant_mix: [
        { id: "A-01", type: "Corner Kiosk", sqm: 20, rent: 18000, status: "occupied", tenant: "Lumina Artisan" },
        { id: "A-02", type: "Boutique Shop",sqm: 30, rent: 24000, status: "occupied", tenant: "Coffee Express" },
        { id: "B-01", type: "Pop-up Stand", sqm: 8,  rent: 9000,  status: "vacant",   tenant: null },
        { id: "B-02", type: "Express Counter",sqm: 10, rent: 12000, status: "vacant",  tenant: null },
      ],
      pro_card_stat: { value: 99.7, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [30, 42, 65, 48, 42, 58],
      chart_peak_label: "340 Peak",
      specs: [
        ["Land Area", "2,200 sq.m.", "VERIFIED"],
        ["Fueling Points", "8 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "07:00 – 09:00, 17:00 – 19:30", "ESTIMATED"],
        ["Nearby Competitors", "2 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        { unit: "UNIT B-01", name: "Pop-up Stand",    price: "9k",  desc: "8 sqm pop-up facing commuter entrance. Low entry cost, high visibility.", img: UNIT_IMG_A },
        { unit: "UNIT B-02", name: "Express Counter",  price: "12k", desc: "10 sqm counter with power and water supply. Suited for beverages.", img: UNIT_IMG_B },
      ],
    },
  },
];

export const STATIONS_BY_ID: Record<string, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.id, s])
);

export function markersForLeaflet() {
  return STATIONS.map((s) => ({
    id:            s.id,
    title:         s.title,
    province:      s.province,
    traffic_level: s.traffic_level,
    spaces_count:  s.spaces_count,
    lat:           s.lat,
    lng:           s.lng,
    location:      s.location,
    traffic_badge: s.traffic_badge,
    match_badge:   s.match_badge,
    image:         s.image,
  }));
}
