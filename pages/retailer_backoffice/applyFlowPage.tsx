"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { useAuth } from "@/lib/authContext";
import { loadProfile } from "./retailerProfileSetupPage";
import stationLatphrao71Img from "@/components/image/station-ptg-latphrao71.png";
import stationRamaixImg     from "@/components/image/station-ptg-ramaix.png";
import stationBangnaImg     from "@/components/image/station-ptg-bangna.png";

// Static image map: display_id → imported image src
// Images are static assets — this mapping is intentionally local, not in the DB.
const STATION_IMAGES: Record<string, string> = {
  "STN-001": stationLatphrao71Img.src,
  "STN-002": stationRamaixImg.src,
  "STN-003": stationRamaixImg.src,
  "STN-004": stationBangnaImg.src,
  "STN-005": stationLatphrao71Img.src,
  "STN-018": stationBangnaImg.src,
};

// Placeholder unit images (stable URLs, no DB photos)
const UNIT_IMGS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCz3XtqGbmMTSMsargnXfJ5zf0xl5MGmmzhDayN0Tncwt_lqg8fuqix60xpeUM4Vq7hewDMFte2Ri1deDQqcVQc3SJMylk118zYqatT7z44ow-EI9MtsZJB3vk_fsVSgRdTfnX0HmTbeEQV9--dtPUxN7qQnwFBJS3tOuJlGEirzYRdYLBJNmyPDEw28drrUhuPAepy-jf-EBMXmsI-8Pp_PchALiEuKCraSqoKF-Ztt1yzcrm5S-LgltxiXOJBQCwaF8O7CCzG8wU",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAjEPBYzF1nbHKkByLnab6NwdRzzKNR5lot2R8o4j8y2gD3WVDURycK3t57SVyHYOippPCco3jGJFriKvQ7HrKlzVjYxR1K6Wa5agQ2_Xyvvmm8uWWGVJnX0KKyUy1Tm2tgMBcSoLX8mmi6SLJ2339T9IAaFrlIVAC748W7_y6G585FqNQrm9PKKo2AH8b-5swymlJFCHcbttdLfRTDiDRWlS45KGmJwY8j6AYpPhuT7hgt9oX5OhdCs0pmtfhF3VrgBtkT7tQm2o0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9BiLTGmDNpskH2e2fcCCKjU6V8AaWuFDnQ-Uo4_ao1tUeT-nerhVjJAWaxDAx1nqzKao6S4fvzWl3WhZ9YmwQefiL2UBYaDOrJVRKIBmDa21q6JkVRzFgIWMQcxWy17uesk9igQyY8Y2vlQFvu8_a4cH3xm1tINCsytmvM_sTNQ0CRfhBFN5iAJIxQPcRDO1JaAYzPGAkmk1rDrJ7uBSZjG4HIjdnRSpWkCsVYE9MNmp1GEHpHx1OEEqGiGZ9FqZhcihTJPGvBUs",
];

// ── API response types ────────────────────────────────────────────────────────

interface ApiUnit {
  id: string;
  unit_code: string;
  unit_label: string;
  area_sqm: number;
  price_thb: number;
  lease_type: string;
}

interface ApiStation {
  id: string;           // display_id e.g. "STN-001"
  filterKey: string;
  name: string;
  location: string;     // province
  region_line: string;  // "Province, Thailand"
  trafficLevel: string;
  traffic_badge: string;
  traffic_badge_class: string;
  lat: number;
  lng: number;
  occupied: number;
  total: number;
  spaces_count: number;
  daily_customers: string;
  dwell_min: string;
  ai_score: string;
  ai_score_num: number;
  available_units: ApiUnit[];
  all_units: (ApiUnit & { available: boolean })[];
}

// ── Unit view model used by Step 2 UI ────────────────────────────────────────

interface UnitView {
  unit:  string;   // unit_code
  name:  string;   // unit_label
  price: string;   // formatted "฿10,000"
  priceNum: number; // raw number for storage
  desc:  string;
  img:   string;
}

function formatPrice(priceThb: number): string {
  return `฿${priceThb.toLocaleString()}`;
}

function unitToView(u: ApiUnit, idx: number): UnitView {
  return {
    unit:     u.unit_code,
    name:     u.unit_label,
    price:    formatPrice(u.price_thb),
    priceNum: u.price_thb,
    desc:     `${u.unit_label} — ${u.area_sqm} sqm. ${u.lease_type === "short_term" ? "Short-term lease available." : "Standard lease terms."}`,
    img:      UNIT_IMGS[idx % UNIT_IMGS.length],
  };
}

// ─────────────────────────────────────────────────────────────────────────────

const STEP_LABELS = ["Choose Station", "Choose Space", "Application", "Done"];

export default function ApplyFlowPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [stations, setStations]           = useState<ApiStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);

  const [isApplyNow, setIsApplyNow]       = useState(false);
  const [step, setStep]                   = useState<1 | 2 | 3 | 4>(1);
  const [selectedStnId, setSelectedStnId] = useState("");
  const [selectedUnit, setSelectedUnit]   = useState<UnitView | null>(null);
  const [leaseDuration, setLeaseDuration] = useState("12 Months");
  const [businessName, setBusinessName]   = useState("");
  const [contactName, setContactName]     = useState("");
  const [phone, setPhone]                 = useState("");
  const [category, setCategory]           = useState("");
  const [concept, setConcept]             = useState("");
  const [startDate, setStartDate]         = useState("");
  const [refNum, setRefNum]               = useState(() => `APP-2026-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState("");
  const [autofillToast, setAutofillToast] = useState("");

  // Fetch stations from API on mount
  useEffect(() => {
    async function loadStations() {
      try {
        const res = await fetch("/api/stations");
        if (res.ok) {
          const data = await res.json() as ApiStation[];
          setStations(data);
        }
      } catch {}
      setLoadingStations(false);
    }
    loadStations();
  }, []);

  // Pre-fill from saved profile
  useEffect(() => {
    const p = loadProfile();
    if (!p) return;
    if (p.businessName) setBusinessName(p.businessName);
    if (p.contactName)  setContactName(p.contactName);
    if (p.phone)        setPhone(p.phone);
    if (p.category)     setCategory(p.category);
    if (p.concept)      setConcept(p.concept);
  }, []);

  // Handle Apply / Apply Now URL params (runs after stations are loaded)
  useEffect(() => {
    if (!router.isReady || loadingStations || stations.length === 0) return;
    const { applyNow, stationId, unitCode } = router.query;
    if (typeof stationId === "string") {
      const matchedStation = stations.find(s => s.id === stationId);
      if (matchedStation) {
        setSelectedStnId(stationId);
        if (applyNow === "1" && typeof unitCode === "string") {
          const units = matchedStation.available_units.map((u, i) => unitToView(u, i));
          const sp = units.find(u => u.unit === unitCode);
          if (sp) {
            setSelectedUnit(sp);
            setIsApplyNow(true);
            setStep(3);
            return;
          }
        }
        setStep(2);
      }
    }
  }, [router.isReady, loadingStations, stations]); // eslint-disable-line react-hooks/exhaustive-deps

  const station      = selectedStnId ? stations.find(s => s.id === selectedStnId) : undefined;
  const stationSpaces: UnitView[] = station
    ? station.available_units.map((u, i) => unitToView(u, i))
    : [];

  // ── Full floor plan: group ALL units (available + occupied) by row letter.
  // unit_code format is "<LETTER>-<NN>" (A-01, B-02, ...). Each letter = a
  // physical row in the building, rendered as a horizontal strip.
  type FloorUnit = {
    unit_code: string;
    unit_label: string;
    area_sqm: number;
    price_thb: number;
    available: boolean;
    row: string;          // e.g. "A"
    col: number;          // e.g. 1, 2, 3
  };

  const floorRows: { row: string; units: FloorUnit[] }[] = (() => {
    if (!station?.all_units?.length) return [];
    const parsed: FloorUnit[] = station.all_units.map((u) => {
      const [row, num] = (u.unit_code || "X-00").split("-");
      return {
        unit_code:  u.unit_code,
        unit_label: u.unit_label,
        area_sqm:   u.area_sqm,
        price_thb:  u.price_thb,
        available:  !!u.available,
        row:        row || "X",
        col:        parseInt(num, 10) || 0,
      };
    });
    const grouped: Record<string, FloorUnit[]> = {};
    for (const u of parsed) {
      grouped[u.row] = grouped[u.row] ?? [];
      grouped[u.row].push(u);
    }
    for (const r of Object.keys(grouped)) {
      grouped[r].sort((a, b) => a.col - b.col);
    }
    return Object.keys(grouped)
      .sort()
      .map((r) => ({ row: r, units: grouped[r] }));
  })();

  function toUnitView(u: FloorUnit, idx: number): UnitView {
    return {
      unit:     u.unit_code,
      name:     u.unit_label,
      price:    formatPrice(u.price_thb),
      priceNum: u.price_thb,
      desc:     `${u.unit_label} — ${u.area_sqm} sqm. Standard lease terms.`,
      img:      UNIT_IMGS[idx % UNIT_IMGS.length],
    };
  }

  // Pull the user's business profile from the API and apply to form fields.
  // Falls back to localStorage's loadProfile() if the API is empty.
  async function handleAutofillFromProfile() {
    setAutofillToast("");
    let filled = false;
    if (user?.id) {
      try {
        const res = await fetch(`/api/retailer/profile?userId=${user.id}`);
        if (res.ok) {
          const p = await res.json() as {
            businessName?: string;
            category?:     string;
            concept?:      string;
          };
          if (p.businessName) { setBusinessName(p.businessName); filled = true; }
          if (p.category)     { setCategory(p.category);         filled = true; }
          if (p.concept)      { setConcept(p.concept);           filled = true; }
        }
      } catch {}
    }
    if (user?.name) { setContactName(user.name); filled = true; }
    if (!filled) {
      const local = loadProfile();
      if (local) {
        if (local.businessName) { setBusinessName(local.businessName); filled = true; }
        if (local.contactName)  { setContactName(local.contactName);   filled = true; }
        if (local.phone)        { setPhone(local.phone);               filled = true; }
        if (local.category)     { setCategory(local.category);         filled = true; }
        if (local.concept)      { setConcept(local.concept);           filled = true; }
      }
    }
    setAutofillToast(filled ? "Profile loaded" : "No saved profile found");
    setTimeout(() => setAutofillToast(""), 2400);
  }

  // Find the station_unit UUID from the loaded API station data.
  function findStationUnitUuid(): string | null {
    if (!station || !selectedUnit) return null;
    const u = station.all_units.find(x => x.unit_code === selectedUnit.unit);
    return u?.id ?? null;
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitError("");

    const stationUnitId = findStationUnitUuid();
    if (!stationUnitId) {
      setSubmitError("Selected unit could not be resolved. Please reselect a space.");
      return;
    }

    setSubmitting(true);

    // Local cache snapshot (kept so the existing local-only flows still work)
    const localApp = {
      refNum,
      stationName: station?.name          ?? "",
      unitCode:    selectedUnit?.unit      ?? "",
      unitLabel:   selectedUnit?.name      ?? "",
      price:       selectedUnit?.priceNum  ?? 0,
      submittedAt: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("ptg_applications") ?? "[]") as typeof localApp[];
      localStorage.setItem("ptg_applications", JSON.stringify([localApp, ...prev]));
    } catch {}

    // Real POST to /api/retailer/apply — writes to applications table,
    // sends a landlord notification server-side.
    try {
      const res = await fetch("/api/retailer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationUnitId,
          userId:        user?.id,
          concept:       concept || undefined,
          businessName:  businessName || undefined,
          contactName:   contactName || undefined,
          category:      category || undefined,
          startDate:     startDate || undefined,
          leaseDuration,
        }),
      });

      if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error ?? "An active application already exists for this unit.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error ?? "Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }

      const result = await res.json() as { retailerDisplayId: string; landlordDisplayId: string };
      setRefNum(result.retailerDisplayId);
      setStep(4);
    } catch {
      setSubmitError("Network error — please try again.");
    }
    setSubmitting(false);
  }

  return (
    <RetailerBackofficeLayout>

      {/* ── Progress bar ── */}
      {step < 4 && (
        <div className="flex items-center mb-8">
          {STEP_LABELS.map((label, i) => {
            const num  = i + 1;
            const done = isApplyNow ? num <= 2 : num < step;
            const curr = num === step;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    done ? "bg-primary text-white" : curr ? "bg-[#1C3A1C] text-white" : "bg-outline-variant/20 text-on-surface-variant"
                  }`}>
                    {done ? <span className="material-symbols-outlined text-[12px]">check</span> : num}
                  </div>
                  <span className={`text-[9px] whitespace-nowrap font-medium ${curr ? "text-on-surface" : "text-on-surface-variant"}`}>{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`h-0.5 w-16 mx-2 mb-4 transition-colors ${done ? "bg-primary" : "bg-outline-variant/20"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 1: Choose Station ── */}
      {step === 1 && (
        <>
          <h1 className="text-2xl font-bold text-on-surface mb-1">Choose a PTG Station</h1>
          <p className="text-sm text-on-surface-variant mb-6">Select the location where you&apos;d like to open your shop.</p>

          {loadingStations ? (
            <div className="py-12 text-center text-sm text-on-surface-variant">Loading stations…</div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stations.map(s => {
                const sel = selectedStnId === s.id;
                const img = STATION_IMAGES[s.id] ?? stationLatphrao71Img.src;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStnId(s.id)}
                    className={`text-left bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all border-2 ${
                      sel ? "border-[#1C3A1C]" : "border-transparent hover:border-outline-variant/30"
                    }`}
                  >
                    <div className="h-36 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={s.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {sel && (
                        <div className="absolute top-3 right-3">
                          <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.traffic_badge_class}`}>{s.traffic_badge}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm font-bold text-on-surface mb-0.5">{s.name}</div>
                      <div className="text-xs text-on-surface-variant mb-3">{s.region_line}</div>
                      <div className="flex gap-3 text-xs text-on-surface-variant mb-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">group</span>
                          {s.daily_customers}/day
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">storefront</span>
                          {s.spaces_count} spaces
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-primary/5 text-primary rounded-full px-2.5 py-1">High Match</span>
                        <span className="text-[10px] text-on-surface-variant">AI {s.ai_score}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!selectedStnId}
              onClick={() => setStep(2)}
              className="bg-[#1C3A1C] text-white font-bold px-8 py-3 rounded-full text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 transition-all"
            >
              Browse Spaces at {station?.name ?? "Selected Station"} →
            </button>
          </div>
        </>
      )}

      {/* ── Step 2: Choose Space ── */}
      {step === 2 && (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm text-on-surface-variant hover:text-on-surface mb-4 flex items-center gap-1 bg-transparent border-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Stations
          </button>
          <h1 className="text-2xl font-bold text-on-surface mb-0.5">Choose Your Space</h1>
          <p className="text-sm text-on-surface-variant mb-5">{station?.name} · {station?.region_line}</p>

          <div className="grid grid-cols-3 gap-5 mb-6">

            {/* ── Gas Station Floor Plan ── */}
            <div className="col-span-2">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-outline-variant/10">

                {/* Header + legend */}
                <div className="px-5 py-3.5 flex items-center justify-between border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">local_gas_station</span>
                    <span className="font-semibold text-sm text-on-surface">Ground Floor Plan</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />Available</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1C3A1C] inline-block" />Selected</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />Occupied</span>
                  </div>
                </div>

                {/* Overhead plan */}
                <div className="p-4 bg-[#D6D2CA]">

                  {/* Road */}
                  <div className="h-6 bg-[#9CA3AF] rounded-t-md relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center gap-4 px-4">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="w-6 h-0.5 bg-white/40 flex-shrink-0" />
                      ))}
                    </div>
                    <span className="relative text-[9px] font-bold uppercase tracking-widest text-white/80 bg-[#9CA3AF] px-2">Road</span>
                  </div>

                  {/* Forecourt with canopy + pumps */}
                  <div className="bg-[#C8C4BC] border-x border-b border-[#A8A4A0] py-4 px-5">
                    <div className="border-2 border-dashed border-[#8B8880]/60 rounded-lg p-3 relative">
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest text-[#6B6864] bg-[#C8C4BC] px-2 whitespace-nowrap">
                        Fuel Canopy
                      </span>
                      <div className="flex justify-around items-end py-1">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="flex flex-col items-center gap-0.5">
                            <div className="flex gap-1.5">
                              <div className="w-4 h-9 bg-[#4B5563] rounded-sm">
                                <div className="w-full h-2.5 bg-[#6B7280] rounded-t-sm" />
                              </div>
                              <div className="w-4 h-9 bg-[#4B5563] rounded-sm">
                                <div className="w-full h-2.5 bg-[#6B7280] rounded-t-sm" />
                              </div>
                            </div>
                            <div className="w-11 h-1 bg-[#374151] rounded-sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Retail building */}
                  <div className="bg-white border-x-2 border-b-2 border-[#6B7280] rounded-b-xl overflow-hidden">
                    <div className="py-1.5 border-b border-gray-100 flex items-center justify-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Retail Building</span>
                    </div>

                    <div className="p-4">
                      {/* Floor plan — one strip per row letter. Width within
                          a row scales with area_sqm so larger units look
                          larger. Available units are green + clickable;
                          occupied units are gray + locked. */}
                      <div className="space-y-2.5 mb-3">
                        {floorRows.map(({ row, units }) => {
                          const rowTotalArea = units.reduce((s, u) => s + Math.max(u.area_sqm, 8), 0);
                          return (
                            <div key={row} className="flex items-stretch gap-1.5">
                              <div className="w-5 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                {row}
                              </div>
                              <div className="flex-1 flex gap-1.5">
                                {units.map((u, idx) => {
                                  const sp = toUnitView(u, idx);
                                  const sel = selectedUnit?.unit === u.unit_code;
                                  const widthPct = (Math.max(u.area_sqm, 8) / rowTotalArea) * 100;

                                  if (!u.available) {
                                    return (
                                      <div
                                        key={u.unit_code}
                                        title={`${u.unit_code} · ${u.unit_label} · ${u.area_sqm} sqm · occupied`}
                                        className="rounded-lg border-2 border-gray-200 bg-gray-100 p-2 min-h-[88px] flex flex-col items-center justify-center gap-0.5"
                                        style={{ flex: `0 0 ${widthPct}%`, maxWidth: `${widthPct}%` }}
                                      >
                                        <span className="material-symbols-outlined text-gray-300 text-[18px]">lock</span>
                                        <span className="text-[9px] font-medium text-gray-400">{u.unit_code}</span>
                                        <span className="text-[9px] font-medium text-gray-400">{u.area_sqm}sqm</span>
                                      </div>
                                    );
                                  }

                                  return (
                                    <button
                                      key={u.unit_code}
                                      type="button"
                                      onClick={() => setSelectedUnit(sel ? null : sp)}
                                      title={`${u.unit_code} · ${u.unit_label} · ${u.area_sqm} sqm · ฿${u.price_thb.toLocaleString()}/mo`}
                                      className={`relative text-left rounded-lg p-2.5 transition-all cursor-pointer min-h-[88px] flex flex-col border-2 ${
                                        sel
                                          ? "bg-[#1C3A1C] border-[#1C3A1C] shadow-md"
                                          : "bg-emerald-50 border-emerald-400 hover:bg-emerald-100 hover:border-emerald-500"
                                      }`}
                                      style={{ flex: `0 0 ${widthPct}%`, maxWidth: `${widthPct}%` }}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${sel ? "text-emerald-300" : "text-emerald-700"}`}>
                                          {u.unit_code}
                                        </span>
                                        {sel && (
                                          <span className="material-symbols-outlined text-emerald-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        )}
                                      </div>
                                      <div className={`text-[10px] font-bold leading-tight flex-1 ${sel ? "text-white" : "text-gray-800"}`}>
                                        {u.unit_label}
                                      </div>
                                      <div className={`mt-1 flex items-center justify-between text-[10px] font-bold ${sel ? "text-emerald-300" : "text-emerald-700"}`}>
                                        <span>{u.area_sqm}sqm</span>
                                        <span>฿{(u.price_thb / 1000).toFixed(0)}k</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Support rooms */}
                      <div className="grid grid-cols-3 gap-2">
                        {["WC", "Corridor", "Back Office"].map(room => (
                          <div key={room} className="h-7 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-[9px] text-gray-400 font-medium">{room}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Entrance */}
                    <div className="border-t-2 border-dashed border-gray-300 py-2 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-gray-400 text-[14px]">door_front</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Main Entrance</span>
                    </div>
                  </div>

                  {/* Parking strip */}
                  <div className="h-6 bg-[#C8C4BC] border-x border-b border-[#A8A4A0] rounded-b-md flex items-center justify-center">
                    <span className="text-[9px] text-[#8B8880] font-medium uppercase tracking-widest">Parking</span>
                  </div>

                </div>
              </div>
            </div>

            {/* ── Detail panel ── */}
            <div>
              {selectedUnit ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
                  <div className="h-44 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedUnit.img} alt={selectedUnit.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-[10px] font-bold text-white/60 mb-0.5">{selectedUnit.unit}</div>
                      <div className="text-base font-bold text-white leading-tight">{selectedUnit.name}</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-end justify-between mb-3">
                      <div className="text-2xl font-bold text-[#1C3A1C]">{selectedUnit.price}</div>
                      <div className="text-xs text-on-surface-variant">/month</div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{selectedUnit.desc}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: "group",        label: "Traffic",  val: station?.daily_customers ?? "—" },
                        { icon: "schedule",     label: "Dwell",    val: `${station?.dwell_min ?? "—"}min` },
                        { icon: "auto_awesome", label: "AI Score", val: station?.ai_score ?? "—" },
                      ].map(s => (
                        <div key={s.label} className="bg-[#F5F2EB] rounded-xl p-2.5 text-center">
                          <span className="material-symbols-outlined text-primary text-[15px] mb-0.5 block">{s.icon}</span>
                          <div className="text-xs font-bold text-on-surface">{s.val}</div>
                          <div className="text-[9px] text-on-surface-variant">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C3A1C]">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Selected · tap slot to deselect
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F5F2EB] rounded-2xl p-6 text-center sticky top-24">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-[44px] mb-3 block">touch_app</span>
                  <p className="text-sm font-medium text-on-surface-variant mb-1">Select a space</p>
                  <p className="text-xs text-on-surface-variant/60">Tap a green slot on the floor plan to see details</p>
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setSelectedUnit(null); setStep(1); }}
              className="text-sm text-on-surface-variant hover:text-on-surface bg-transparent border-0 cursor-pointer"
            >
              ← Change Station
            </button>
            <button
              type="button"
              disabled={!selectedUnit}
              onClick={() => setStep(3)}
              className="bg-[#1C3A1C] text-white font-bold px-8 py-3 rounded-full text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105"
            >
              Apply for This Space →
            </button>
          </div>
        </>
      )}

      {/* ── Step 3: Application Form ── */}
      {step === 3 && (
        <>
          {!isApplyNow && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-on-surface-variant hover:text-on-surface mb-4 flex items-center gap-1 bg-transparent border-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Space Selection
            </button>
          )}

          <div className="flex items-start justify-between mb-1 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on-surface mb-1">Application Details</h1>
              <p className="text-sm text-on-surface-variant mb-2">
                Review your details below and submit your application to the landlord.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <button
                type="button"
                onClick={handleAutofillFromProfile}
                className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                Use my Business Profile
              </button>
              {autofillToast && (
                <span className="text-[11px] text-on-surface-variant">{autofillToast}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 mt-4">
            {/* Form */}
            <div className="col-span-2 space-y-5">

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-semibold text-on-surface">Business Details</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Click &quot;Use my Business Profile&quot; above, or fill in manually. All fields are editable.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="Your registered business name"
                      className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Category</label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="e.g. Coffee &amp; Beverages"
                      className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Contact Person</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Full name"
                      className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0XX-XXX-XXXX"
                      className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-on-surface mb-4">Proposed Operations</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Store Concept</label>
                    <textarea
                      rows={3}
                      value={concept}
                      onChange={e => setConcept(e.target.value)}
                      placeholder="Describe your product concept and target customers…"
                      className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none resize-none leading-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Preferred Start Date</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Lease Duration</label>
                      <div className="relative">
                        <select value={leaseDuration} onChange={e => setLeaseDuration(e.target.value)} className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer">
                          <option>3 Months</option>
                          <option>6 Months</option>
                          <option>12 Months</option>
                          <option>24 Months</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#1C3A1C] text-white font-bold py-4 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit Application →"}
              </button>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm sticky top-24">
                {selectedUnit && (
                  <div className="h-32 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedUnit.img} alt={selectedUnit.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">{selectedUnit.unit}</span>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Selected Space</div>
                  <div className="text-base font-bold text-on-surface">{selectedUnit?.unit} — {selectedUnit?.name}</div>
                  <div className="text-sm text-on-surface-variant mb-1">{station?.name}</div>
                  <div className="text-xs text-on-surface-variant mb-4">{station?.region_line}</div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Monthly Rent</span>
                      <span className="font-bold text-on-surface">{selectedUnit?.price}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Daily Traffic</span>
                      <span className="font-medium text-on-surface">{station?.daily_customers} visits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">AI Match</span>
                      <span className="font-medium text-on-surface">{station?.ai_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Lease Term</span>
                      <span className="font-medium text-on-surface">{leaseDuration}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F2EB] rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[16px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                  <p className="text-xs text-on-surface leading-relaxed">
                    Your application will be sent to the PTG landlord team. Review typically takes <strong>3–5 business days</strong>. Booking and scheduling happen only after approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Step 4: Success ── */}
      {step === 4 && (
        <div className="flex flex-col items-center py-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface mb-2 text-center">Application Submitted</h1>
          <p className="text-sm text-on-surface-variant text-center mb-2">
            Your application has been sent to the PTG landlord team for review.
          </p>
          <div className="text-xs font-bold text-on-surface-variant bg-[#F5F2EB] px-3 py-1.5 rounded-full mb-8">
            Ref: {refNum}
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden w-full max-w-md mb-6">
            {selectedUnit && (
              <div className="h-28 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedUnit.img} alt={selectedUnit.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <div className="px-6 py-5 text-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-on-surface">{selectedUnit?.unit} — {selectedUnit?.name}</div>
                  <div className="text-on-surface-variant text-xs mt-0.5">{station?.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-on-surface">{selectedUnit?.price}/mo</div>
                  <div className="text-xs text-on-surface-variant">{station?.region_line}</div>
                </div>
              </div>
              <div className="h-px bg-outline-variant/10 mb-3" />
              <div className="text-xs text-on-surface-variant">
                Submitted {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-md mb-8">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-5">What Happens Next</div>
            <div className="space-y-5">
              {[
                { icon: "mail",           title: "Application under review",  body: "The landlord will review your application within 3–5 business days.", active: true },
                { icon: "handshake",      title: "Landlord decision",         body: "You'll receive a notification. If approved, you'll be invited to schedule a site visit.", active: false },
                { icon: "calendar_month", title: "Booking & signing",         body: "Once approved, schedule your site visit and sign the lease agreement.", active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.active ? "bg-primary text-white" : "bg-outline-variant/15 text-on-surface-variant"}`}>
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold mb-0.5 ${item.active ? "text-on-surface" : "text-on-surface-variant"}`}>{item.title}</div>
                    <div className="text-xs text-on-surface-variant">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/retailer_backoffice/myApplicationsPage">
              <button type="button" className="bg-[#1C3A1C] text-white font-bold px-6 py-3 rounded-full text-sm cursor-pointer border-0 hover:brightness-105">
                View My Applications
              </button>
            </Link>
          </div>
        </div>
      )}

    </RetailerBackofficeLayout>
  );
}
