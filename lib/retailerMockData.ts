// Canonical single source of truth for all retailer backoffice pages.
// Change numbers here and every page stays consistent.

export const STORES = [
  {
    name: "Lumina Artisan Roastery",
    station: "PTG Lat Phrao 71",
    stationShort: "Lat Phrao 71",
    revenue: 318,       // THB thousands / month
    rent: 49,           // THB thousands / month
    dailyCustomers: 415,
    conversionRate: 38.1,
    avgBasket: 265,
  },
  {
    name: "Coffee Corner",
    station: "PTG Rama IX",
    stationShort: "Rama IX",
    revenue: 143,
    rent: 22,
    dailyCustomers: 340,
    conversionRate: 38.2,
    avgBasket: 248,
  },
  {
    name: "Quick Mart",
    station: "PTG Ari Station",
    stationShort: "Ari Station",
    revenue: 143,
    rent: 37,
    dailyCustomers: 280,
    conversionRate: 34.6,
    avgBasket: 195,
  },
] as const;

// Portfolio-level aggregates
export const PORTFOLIO = {
  monthlyRevenue: 604,          // THB thousands
  totalRent: 108,               // THB thousands
  rentToRevenue: 17.9,          // %
  dailyCustomers: 1035,         // combined across all stores
  avgDailyPerStore: 345,        // mean across 3 stores
  weightedConversion: 37.2,     // % weighted by traffic
  avgBasket: 249,               // THB
  storeCount: 3,
} as const;

// Customer segments — single source for all pages
export const SEGMENTS = [
  { gen: "Gen Z",      pct: 28, basket: "฿195", revenueShareGrowth: "+8%",  color: "#344e00" },
  { gen: "Millennial", pct: 42, basket: "฿265", revenueShareGrowth: "+12%", color: "#6ab04c" },
  { gen: "Gen X",      pct: 20, basket: "฿270", revenueShareGrowth: "+3%",  color: "#a5d6a7" },
  { gen: "Boomer",     pct: 10, basket: "฿240", revenueShareGrowth: "+1%",  color: "#D4C9B0" },
] as const;

// ML forecast numbers
export const ML_FORECAST = {
  nextMonthRevenue: 672,        // THB thousands
  nextMonthGrowth: 11.3,        // % vs current month
  q2Revenue: 2000,              // THB thousands  (฿2.0M)
  q2Low: 1800,                  // THB thousands
  q2High: 2200,                 // THB thousands
  q2Confidence: 89,             // %
  avgBasketPredicted: 271,      // THB
  avgBasketCurrent: 249,        // THB
  avgBasketGrowth: 9,           // %
  revenueAtRisk: 110,           // THB thousands / year
  churnSegmentsAtRisk: 2,
} as const;
