import type { StationId } from "@/lib/stationFilterContext";

export type AppBadge = "PENDING REVIEW" | "APPROVED" | "NOT APPROVED";

export interface SharedApp {
  retailerAppId: string;
  landlordAppId: string;
  stationId: StationId;
  stationName: string;
  unitCode: string;
  unitLabel: string;
  location: string;
  price: number;
  leaseType: string;
  duration: string;
  appliedDate: string;
  retailerBadge: AppBadge;

  // Tenant profile (shared across all views)
  storeName: string;
  applicantName: string;
  category: string;
  experience: string;
  numStores: string;
  maxBudget: string;
  concept: string;
  panelColor: string;
  aiText: string;

  // Specialist
  specialistName: string;
  specialistInitials: string;
}

export const SHARED_APPS: SharedApp[] = [
  {
    retailerAppId: "PTG-APP-2025-8821",
    landlordAppId: "LAND-APP-2025-001",
    stationId: "sukhumvit",
    stationName: "PTG Sukhumvit 62",
    unitCode: "A-02",
    unitLabel: "Shopfront Unit",
    location: "Khlong Toei, Bangkok",
    price: 22000,
    leaseType: "Shopfront · 35 sqm",
    duration: "12 Months",
    appliedDate: "12 Jan 2026",
    retailerBadge: "APPROVED",
    storeName: "The Artisan Brew",
    applicantName: "Wanida Suthep",
    category: "Artisan Cafe",
    experience: "12 Years",
    numStores: "3",
    maxBudget: "฿20,000",
    concept: "Specialty coffee kiosk serving the EV charging community with premium single-origin brews and artisan pastry.",
    panelColor: "#4a5568",
    aiText: "High potential for morning commuter synergy. Proximity to EV chargers aligns with customer dwell times of 20–30 minutes. Budget fits the available units at this station.",
    specialistName: "Kanya Srisuk",
    specialistInitials: "KS",
  },
  {
    retailerAppId: "PTG-APP-2025-6174",
    landlordAppId: "LAND-APP-2025-002",
    stationId: "lat_phrao",
    stationName: "PTG Lat Phrao 71",
    unitCode: "B-02",
    unitLabel: "Premium Shopfront",
    location: "Lat Phrao, Bangkok",
    price: 28000,
    leaseType: "Premium Shopfront · 38 sqm",
    duration: "12 Months",
    appliedDate: "04 Mar 2026",
    retailerBadge: "PENDING REVIEW",
    storeName: "Tanaka Premium Market",
    applicantName: "Tanaka Foods Co.",
    category: "Premium Retail",
    experience: "25 Years",
    numStores: "12",
    maxBudget: "฿90,000",
    concept: "Premium Japanese convenience market with curated snacks, ready meals, and lifestyle products for urban commuters.",
    panelColor: "#744210",
    aiText: "Enterprise-grade tenant with stable long-term outlook. Strong brand fit for the Lat Phrao residential catchment — ideal anchor for the vacant boutique unit.",
    specialistName: "Kanya Srisuk",
    specialistInitials: "KS",
  },
  {
    retailerAppId: "PTG-APP-2025-3302",
    landlordAppId: "LAND-APP-2025-003",
    stationId: "rama9",
    stationName: "PTG Rama 9",
    unitCode: "F-02",
    unitLabel: "Pop-up Bay",
    location: "Huai Khwang, Bangkok",
    price: 12000,
    leaseType: "Pop-up Bay · 20 sqm",
    duration: "3 Months",
    appliedDate: "18 Nov 2025",
    retailerBadge: "NOT APPROVED",
    storeName: "PharmaPlus Express",
    applicantName: "PharmaCare Ltd.",
    category: "Pharmacy",
    experience: "8 Years",
    numStores: "5",
    maxBudget: "฿35,000",
    concept: "Express pharmacy and health essentials kiosk offering OTC medication, vitamins, and wellness products for daily commuters.",
    panelColor: "#1a4a5e",
    aiText: "Service-oriented anchor with consistent repeat-visit draw. May require specialized ventilation and security upgrades — factor into lease terms. Good fit for underperforming Rama 9 unit.",
    specialistName: "Kanya Srisuk",
    specialistInitials: "KS",
  },
];

export const LANDLORD_TO_RETAILER: Record<string, string> = Object.fromEntries(
  SHARED_APPS.map(a => [a.landlordAppId, a.retailerAppId])
);

export const RETAILER_TO_LANDLORD: Record<string, string> = Object.fromEntries(
  SHARED_APPS.map(a => [a.retailerAppId, a.landlordAppId])
);

export function getAppByRetailerId(id: string): SharedApp | undefined {
  return SHARED_APPS.find(a => a.retailerAppId === id);
}

export function getAppByLandlordId(id: string): SharedApp | undefined {
  return SHARED_APPS.find(a => a.landlordAppId === id);
}
