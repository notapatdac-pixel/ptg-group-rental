// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the demo retailer's stores.
//
// Dual-key data model (kept in one place so adding a store = one array entry):
//   storeId   = "STN-xxx"  → store_monthly_* tables, the store filter, UI labels
//   mlStoreId = "STR-xxx"  → ml_sales_forecasts / churn / origins / catchment
//
// Imported by the retailer dashboard, ML predictions page, and /api/retailer/ml.
// ─────────────────────────────────────────────────────────────────────────────

export const RETAILER_ID = "RET-001";
// The demo retailer account (retailer@ptg.test = Lumina Retail Group) profile id.
export const RETAILER_PROFILE_ID = "55555555-0000-0000-0000-000000000001";

export type RetailerStore = {
  storeId:   string; // STN-xxx
  mlStoreId: string; // STR-xxx
  shortName: string; // station short label, e.g. "Lat Phrao 71"
  brand:     string; // store brand / concept name
  type:      string; // store type (EN)
  typeTh:    string; // store type (TH)
};

export const RETAILER_STORES: RetailerStore[] = [
  { storeId: "STN-001", mlStoreId: "STR-001", shortName: "Lat Phrao 71", brand: "Lumina Artisan Roastery", type: "Artisan Cafe",       typeTh: "คาเฟ่กาแฟพิเศษ" },
  { storeId: "STN-002", mlStoreId: "STR-002", shortName: "Sukhumvit 62", brand: "Lumina Fresh Market",     type: "Premium Market",     typeTh: "พรีเมียมมาร์เก็ต" },
  { storeId: "STN-003", mlStoreId: "STR-003", shortName: "Rama 9",       brand: "Lumina Wellness",         type: "Wellness Pharmacy",  typeTh: "ร้านสุขภาพ" },
  { storeId: "STN-018", mlStoreId: "STR-077", shortName: "Nonthaburi",   brand: "Lumina Express",          type: "Grab & Go Coffee",   typeTh: "กาแฟซื้อกลับบ้าน" },
];

// ── Derived lookups ─────────────────────────────────────────────────────────
export const RETAILER_ML_STORE_IDS = RETAILER_STORES.map((s) => s.mlStoreId); // ["STR-001", ...]
export const RETAILER_STATION_IDS  = RETAILER_STORES.map((s) => s.storeId);   // ["STN-001", ...]

export const STORE_TO_STATION: Record<string, string> =
  Object.fromEntries(RETAILER_STORES.map((s) => [s.mlStoreId, s.storeId]));

// storeId ("all" | "STN-xxx") → list of ml store ids
export const STORE_ID_MAP: Record<string, string[]> = {
  all: RETAILER_ML_STORE_IDS,
  ...Object.fromEntries(RETAILER_STORES.map((s) => [s.storeId, [s.mlStoreId]])),
};

export function mlStoreIdsFor(storeId: string): string[] {
  return STORE_ID_MAP[storeId] ?? RETAILER_ML_STORE_IDS;
}

// storeId ("all" | "STN-xxx") → branch/location label (e.g. "Lat Phrao 71")
export function storeShortName(storeId: string, lang: "en" | "th" = "en"): string {
  if (storeId === "all") return lang === "th" ? "ทุกสาขา" : "All Branches";
  return RETAILER_STORES.find((s) => s.storeId === storeId)?.shortName ?? storeId;
}

// storeId ("all" | "STN-xxx") → STORE/brand name (e.g. "Lumina Artisan Roastery").
// Retailer-facing surfaces use this — the user wants the shop name, not the
// station/branch location, and never the raw "STN-xxx" code.
export function storeBrand(storeId: string, lang: "en" | "th" = "en"): string {
  if (storeId === "all") return lang === "th" ? "ทุกร้านของคุณ" : "All Your Stores";
  return RETAILER_STORES.find((s) => s.storeId === storeId)?.brand ?? storeId;
}

// storeId ("STN-xxx") → store TYPE/category (e.g. "Artisan Cafe"). Returns "" if
// the station is not one of the retailer's stores.
export function storeType(storeId: string, lang: "en" | "th" = "en"): string {
  const s = RETAILER_STORES.find((s) => s.storeId === storeId);
  if (!s) return "";
  return lang === "th" ? s.typeTh : s.type;
}
