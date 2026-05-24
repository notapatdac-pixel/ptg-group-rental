import stationLatphrao71 from "@/components/image/station-ptg-latphrao71.png";
import stationRamaix from "@/components/image/station-ptg-ramaix.png";
import stationBangna from "@/components/image/station-ptg-bangna.png";

export interface StationSpace {
  unit: string;
  name: string;
  price: string;
  desc: string;
  img: string;
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

export const STATIONS: Station[] = [
  {
    id: "latphrao71",
    title: "PTG Station Lat Phrao 71",
    province: "Bangkok",
    traffic_level: "high",
    location: "Bangkok · 2.4 km away",
    match_badge: "98% Match",
    traffic_badge: "High Traffic",
    traffic_badge_class: "bg-on-secondary-container/10 text-on-secondary-container",
    image: stationLatphrao71.src,
    max_area: ["Max Area", "45 sqm"],
    available: ["Available", "3 Spaces"],
    spaces_count: 3,
    lat: 13.8046,
    lng: 100.58,
    traffic_badge_short: "High",
    region_line: "Bangkok, Thailand",
    detail: {
      daily_customers: "890",
      daily_delta: "+12%",
      dwell_min: "12",
      est_revenue: "285K",
      ai_score: "87%",
      daily_customers_num: 890,
      dwell_min_num: 12,
      est_revenue_k: 285,
      ai_score_num: 87,
      pro_card_stat: { value: 98, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [40, 55, 85, 60, 45, 70],
      chart_peak_label: "924 Peak",
      specs: [
        ["Land Area", "2,400 sq.m.", "VERIFIED"],
        ["Fueling Points", "12 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "07:00 - 09:30, 16:30 - 19:00", "ESTIMATED"],
        ["Nearby Competitors", "3 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        {
          unit: "UNIT A",
          name: "Premium Corner",
          price: "12k",
          desc: "High visibility spot near main entrance. Perfect for convenience stores or cafes.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz3XtqGbmMTSMsargnXfJ5zf0xl5MGmmzhDayN0Tncwt_lqg8fuqix60xpeUM4Vq7hewDMFte2Ri1deDQqcVQc3SJMylk118zYqatT7z44ow-EI9MtsZJB3vk_fsVSgRdTfnX0HmTbeEQV9--dtPUxN7qQnwFBJS3tOuJlGEirzYRdYLBJNmyPDEw28drrUhuPAepy-jf-EBMXmsI-8Pp_PchALiEuKCraSqoKF-Ztt1yzcrm5S-LgltxiXOJBQCwaF8O7CCzG8wU",
        },
        {
          unit: "UNIT B",
          name: "Mid-Section Bay",
          price: "8.5k",
          desc: "Efficient layout with plumbing ready. Ideal for bubble tea or snack kiosk.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjEPBYzF1nbHKkByLnab6NwdRzzKNR5lot2R8o4j8y2gD3WVDURycK3t57SVyHYOippPCco3jGJFriKvQ7HrKlzVjYxR1K6Wa5agQ2_Xyvvmm8uWWGVJnX0KKyUy1Tm2tgMBcSoLX8mmi6SLJ2339T9IAaFrlIVAC748W7_y6G585FqNQrm9PKKo2AH8b-5swymlJFCHcbttdLfRTDiDRWlS45KGmJwY8j6AYpPhuT7hgt9oX5OhdCs0pmtfhF3VrgBtkT7tQm2o0",
        },
        {
          unit: "UNIT C",
          name: "Logistics Hub",
          price: "15k",
          desc: "Large rear access for delivery trucks. Best for fulfillment centers or auto-parts.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9BiLTGmDNpskH2e2fcCCKjU6V8AaWuFDnQ-Uo4_ao1tUeT-nerhVjJAWaxDAx1nqzKao6S4fvzWl3WhZ9YmwQefiL2UBYaDOrJVRKIBmDa21q6JkVRzFgIWMQcxWy17uesk9igQyY8Y2vlQFvu8_a4cH3xm1tINCsytmvM_sTNQ0CRfhBFN5iAJIxQPcRDO1JaAYzPGAkmk1rDrJ7uBSZjG4HIjdnRSpWkCsVYE9MNmp1GEHpHx1OEEqGiGZ9FqZhcihTJPGvBUs",
        },
      ],
    },
  },
  {
    id: "ramaix",
    title: "PTG Station Rama IX",
    province: "Bangkok",
    traffic_level: "medium",
    location: "Bangkok · 5.1 km away",
    match_badge: "92% Match",
    traffic_badge: "Medium Traffic",
    traffic_badge_class: "bg-tertiary-container/20 text-on-tertiary-container",
    image: stationRamaix.src,
    max_area: ["Max Area", "120 sqm"],
    available: ["Available", "5 Spaces"],
    spaces_count: 5,
    lat: 13.75,
    lng: 100.565,
    traffic_badge_short: "Medium",
    region_line: "Bangkok, Thailand",
    detail: {
      daily_customers: "720",
      daily_delta: "+8%",
      dwell_min: "9",
      est_revenue: "198K",
      ai_score: "81%",
      daily_customers_num: 720,
      dwell_min_num: 9,
      est_revenue_k: 198,
      ai_score_num: 81,
      pro_card_stat: { value: 92, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [35, 48, 62, 55, 50, 58],
      chart_peak_label: "780 Peak",
      specs: [
        ["Land Area", "3,100 sq.m.", "VERIFIED"],
        ["Fueling Points", "16 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "07:30 - 10:00, 17:00 - 19:30", "ESTIMATED"],
        ["Nearby Competitors", "2 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        {
          unit: "UNIT A",
          name: "Front Atrium",
          price: "14k",
          desc: "Prime visibility facing the main road. Suited for flagship retail or café.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz3XtqGbmMTSMsargnXfJ5zf0xl5MGmmzhDayN0Tncwt_lqg8fuqix60xpeUM4Vq7hewDMFte2Ri1deDQqcVQc3SJMylk118zYqatT7z44ow-EI9MtsZJB3vk_fsVSgRdTfnX0HmTbeEQV9--dtPUxN7qQnwFBJS3tOuJlGEirzYRdYLBJNmyPDEw28drrUhuPAepy-jf-EBMXmsI-8Pp_PchALiEuKCraSqoKF-Ztt1yzcrm5S-LgltxiXOJBQCwaF8O7CCzG8wU",
        },
        {
          unit: "UNIT B",
          name: "Courtyard Kiosk",
          price: "7.2k",
          desc: "Compact footprint with utilities in place. Ideal for F&B pop-ups.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjEPBYzF1nbHKkByLnab6NwdRzzKNR5lot2R8o4j8y2gD3WVDURycK3t57SVyHYOippPCco3jGJFriKvQ7HrKlzVjYxR1K6Wa5agQ2_Xyvvmm8uWWGVJnX0KKyUy1Tm2tgMBcSoLX8mmi6SLJ2339T9IAaFrlIVAC748W7_y6G585FqNQrm9PKKo2AH8b-5swymlJFCHcbttdLfRTDiDRWlS45KGmJwY8j6AYpPhuT7hgt9oX5OhdCs0pmtfhF3VrgBtkT7tQm2o0",
        },
        {
          unit: "UNIT C",
          name: "Service Annex",
          price: "11k",
          desc: "Flexible bay with loading access. Great for auto-care or parcel lockers.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9BiLTGmDNpskH2e2fcCCKjU6V8AaWuFDnQ-Uo4_ao1tUeT-nerhVjJAWaxDAx1nqzKao6S4fvzWl3WhZ9YmwQefiL2UBYaDOrJVRKIBmDa21q6JkVRzFgIWMQcxWy17uesk9igQyY8Y2vlQFvu8_a4cH3xm1tINCsytmvM_sTNQ0CRfhBFN5iAJIxQPcRDO1JaAYzPGAkmk1rDrJ7uBSZjG4HIjdnRSpWkCsVYE9MNmp1GEHpHx1OEEqGiGZ9FqZhcihTJPGvBUs",
        },
      ],
    },
  },
  {
    id: "bangna",
    title: "PTG Station Bang Na",
    province: "Samut Prakan",
    traffic_level: "high",
    location: "Samut Prakan · 12.8 km away",
    match_badge: "85% Match",
    traffic_badge: "High Traffic",
    traffic_badge_class: "bg-secondary-container/30 text-on-secondary-container",
    image: stationBangna.src,
    max_area: ["Max Area", "32 sqm"],
    available: ["Available", "1 Space"],
    spaces_count: 1,
    lat: 13.674,
    lng: 100.593,
    traffic_badge_short: "High",
    region_line: "Samut Prakan, Thailand",
    detail: {
      daily_customers: "640",
      daily_delta: "+15%",
      dwell_min: "11",
      est_revenue: "210K",
      ai_score: "84%",
      daily_customers_num: 640,
      dwell_min_num: 11,
      est_revenue_k: 210,
      ai_score_num: 84,
      pro_card_stat: { value: 85, suffix: "%", label: "Match confidence" },
      chart_heights_pct: [42, 50, 78, 52, 48, 65],
      chart_peak_label: "702 Peak",
      specs: [
        ["Land Area", "1,900 sq.m.", "VERIFIED"],
        ["Fueling Points", "10 Active Dispensers", "VERIFIED"],
        ["Peak Hours", "06:30 - 09:00, 16:00 - 18:30", "ESTIMATED"],
        ["Nearby Competitors", "4 Stations (within 2km)", "ESTIMATED"],
      ],
      spaces: [
        {
          unit: "UNIT A",
          name: "Highway Frontage",
          price: "18k",
          desc: "Maximum exposure to expressway traffic. Ideal for QSR or showroom.",
          img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz3XtqGbmMTSMsargnXfJ5zf0xl5MGmmzhDayN0Tncwt_lqg8fuqix60xpeUM4Vq7hewDMFte2Ri1deDQqcVQc3SJMylk118zYqatT7z44ow-EI9MtsZJB3vk_fsVSgRdTfnX0HmTbeEQV9--dtPUxN7qQnwFBJS3tOuJlGEirzYRdYLBJNmyPDEw28drrUhuPAepy-jf-EBMXmsI-8Pp_PchALiEuKCraSqoKF-Ztt1yzcrm5S-LgltxiXOJBQCwaF8O7CCzG8wU",
        },
      ],
    },
  },
];

export const STATIONS_BY_ID: Record<string, Station> = Object.fromEntries(
  STATIONS.map((s) => [s.id, s])
);

export function markersForLeaflet() {
  return STATIONS.map((s) => ({
    id: s.id,
    title: s.title,
    province: s.province,
    traffic_level: s.traffic_level,
    spaces_count: s.spaces_count,
    lat: s.lat,
    lng: s.lng,
    location: s.location,
    traffic_badge: s.traffic_badge,
    match_badge: s.match_badge,
    image: s.image,
  }));
}
