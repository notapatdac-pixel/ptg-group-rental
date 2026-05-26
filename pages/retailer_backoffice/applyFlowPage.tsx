"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { STATIONS, STATIONS_BY_ID, StationSpace } from "@/lib/stations";
import { loadProfile } from "./retailerProfileSetupPage";

// Convert price string "12k" / "8.5k" to number for storage
function parsePrice(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return price.toLowerCase().includes("k") ? n * 1000 : n;
}

const STEP_LABELS = ["Choose Station", "Choose Space", "Application", "Done"];

export default function ApplyFlowPage() {
  const router = useRouter();

  const [isApplyNow, setIsApplyNow]       = useState(false);
  const [step, setStep]                   = useState<1 | 2 | 3 | 4>(1);
  const [selectedStnId, setSelectedStnId] = useState("");
  const [selectedUnit, setSelectedUnit]   = useState<StationSpace | null>(null);
  const [leaseDuration, setLeaseDuration] = useState("12 Months");
  const [businessName, setBusinessName]   = useState("");
  const [contactName, setContactName]     = useState("");
  const [phone, setPhone]                 = useState("");
  const [category, setCategory]           = useState("");
  const [concept, setConcept]             = useState("");
  const [startDate, setStartDate]         = useState("");
  const [refNum]                          = useState(() => `APP-2026-${Math.floor(Math.random() * 9000 + 1000)}`);

  // Pre-fill from saved profile
  useEffect(() => {
    const p = loadProfile();
    if (!p) return;
    if (p.businessName)    setBusinessName(p.businessName);
    if (p.contactName)     setContactName(p.contactName);
    if (p.phone)           setPhone(p.phone);
    if (p.category)        setCategory(p.category);
    if (p.concept)         setConcept(p.concept);
  }, []);

  // Handle Apply / Apply Now URL params
  useEffect(() => {
    if (!router.isReady) return;
    const { applyNow, stationId, unitCode } = router.query;
    if (typeof stationId === "string" && STATIONS_BY_ID[stationId]) {
      setSelectedStnId(stationId);
      if (applyNow === "1" && typeof unitCode === "string") {
        const sp = STATIONS_BY_ID[stationId].detail.spaces.find(s => s.unit === unitCode);
        if (sp) {
          setSelectedUnit(sp);
          setIsApplyNow(true);
          setStep(3);
          return;
        }
      }
      setStep(2);
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const station      = selectedStnId ? STATIONS_BY_ID[selectedStnId] : undefined;
  const stationSpaces = station?.detail.spaces ?? [];

  function handleSubmit() {
    const app = {
      refNum,
      stationName: station?.title         ?? "",
      unitCode:    selectedUnit?.unit      ?? "",
      unitLabel:   selectedUnit?.name      ?? "",
      price:       parsePrice(selectedUnit?.price ?? "0"),
      submittedAt: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("ptg_applications") ?? "[]") as typeof app[];
      localStorage.setItem("ptg_applications", JSON.stringify([app, ...prev]));
    } catch {}
    setStep(4);
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
          <h1 className="text-2xl font-bold text-[#1C3A1C] mb-1">Choose a PTG Station</h1>
          <p className="text-sm text-on-surface-variant mb-6">Select the location where you&apos;d like to open your shop.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {STATIONS.map(s => {
              const sel = selectedStnId === s.id;
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
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
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
                    <div className="text-sm font-bold text-on-surface mb-0.5">{s.title}</div>
                    <div className="text-xs text-on-surface-variant mb-3">{s.region_line}</div>
                    <div className="flex gap-3 text-xs text-on-surface-variant mb-3">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">group</span>
                        {s.detail.daily_customers}/day
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">storefront</span>
                        {s.spaces_count} spaces
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-primary/5 text-primary rounded-full px-2.5 py-1">{s.match_badge}</span>
                      <span className="text-[10px] text-on-surface-variant">AI {s.detail.ai_score}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!selectedStnId}
              onClick={() => setStep(2)}
              className="bg-[#1C3A1C] text-white font-bold px-8 py-3 rounded-full text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 transition-all"
            >
              Browse Spaces at {station?.title ?? "Selected Station"} →
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
          <h1 className="text-2xl font-bold text-[#1C3A1C] mb-0.5">Choose Your Space</h1>
          <p className="text-sm text-on-surface-variant mb-5">{station?.title} · {station?.region_line}</p>

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
                      {/* Retail unit slots — 4-column grid */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {stationSpaces.map(sp => {
                          const sel = selectedUnit?.unit === sp.unit;
                          return (
                            <button
                              key={sp.unit}
                              type="button"
                              onClick={() => setSelectedUnit(sel ? null : sp)}
                              className={`relative text-left rounded-lg p-3 transition-all cursor-pointer min-h-[100px] flex flex-col border-2 ${
                                sel
                                  ? "bg-[#1C3A1C] border-[#1C3A1C] shadow-md"
                                  : "bg-emerald-50 border-emerald-400 hover:bg-emerald-100 hover:border-emerald-500"
                              } ${stationSpaces.length === 1 ? "col-span-2" : ""}`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${sel ? "text-emerald-300" : "text-emerald-700"}`}>
                                  {sp.unit}
                                </span>
                                {sel && (
                                  <span className="material-symbols-outlined text-emerald-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                )}
                              </div>
                              <div className={`text-[11px] font-bold leading-tight flex-1 ${sel ? "text-white" : "text-gray-800"}`}>
                                {sp.name}
                              </div>
                              <div className={`mt-2 text-[11px] font-bold ${sel ? "text-emerald-300" : "text-emerald-600"}`}>
                                ฿{sp.price}
                              </div>
                            </button>
                          );
                        })}

                        {/* Occupied fillers to complete 4-col row */}
                        {Array.from({ length: stationSpaces.length === 1 ? 2 : 4 - stationSpaces.length }).map((_, i) => (
                          <div key={`occ-${i}`} className="rounded-lg border-2 border-gray-200 bg-gray-100 p-3 min-h-[100px] flex flex-col items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-gray-300 text-[18px]">lock</span>
                            <span className="text-[9px] font-medium text-gray-400">{["Storage", "Utility", "Staff Room"][i]}</span>
                          </div>
                        ))}
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
                      <div className="text-2xl font-bold text-[#1C3A1C]">฿{selectedUnit.price}</div>
                      <div className="text-xs text-on-surface-variant">/month</div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-4">{selectedUnit.desc}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: "group",        label: "Traffic",   val: station?.detail.daily_customers ?? "—" },
                        { icon: "schedule",     label: "Dwell",     val: `${station?.detail.dwell_min ?? "—"}min` },
                        { icon: "auto_awesome", label: "AI Score",  val: station?.detail.ai_score ?? "—" },
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

          <h1 className="text-2xl font-bold text-[#1C3A1C] mb-1">Application Details</h1>
          <p className="text-sm text-on-surface-variant mb-6">
            Review your details below and submit your application to the landlord.
          </p>

          <div className="grid grid-cols-3 gap-8">
            {/* Form */}
            <div className="col-span-2 space-y-5">

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="font-semibold text-on-surface">Business Details</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Pulled from your business profile.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Business Name</div>
                    <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm text-on-surface min-h-[46px] flex items-center">
                      {businessName || <span className="text-on-surface-variant">—</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Category</div>
                    <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm text-on-surface min-h-[46px] flex items-center">
                      {category || <span className="text-on-surface-variant">—</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Contact Person</div>
                    <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm text-on-surface min-h-[46px] flex items-center">
                      {contactName || <span className="text-on-surface-variant">—</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Phone Number</div>
                    <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm text-on-surface min-h-[46px] flex items-center">
                      {phone || <span className="text-on-surface-variant">—</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-on-surface mb-4">Proposed Operations</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">Store Concept</div>
                    <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm text-on-surface leading-relaxed">
                      {concept || <span className="text-on-surface-variant">No concept added — update your profile.</span>}
                    </div>
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

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-[#1C3A1C] text-white font-bold py-4 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105"
              >
                Submit Application →
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
                  <div className="text-sm text-on-surface-variant mb-1">{station?.title}</div>
                  <div className="text-xs text-on-surface-variant mb-4">{station?.region_line}</div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Monthly Rent</span>
                      <span className="font-bold text-on-surface">฿{selectedUnit?.price}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Daily Traffic</span>
                      <span className="font-medium text-on-surface">{station?.detail.daily_customers} visits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">AI Match</span>
                      <span className="font-medium text-on-surface">{station?.detail.ai_score}</span>
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
          <h1 className="text-3xl font-bold text-[#1C3A1C] mb-2 text-center">Application Submitted</h1>
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
                  <div className="text-on-surface-variant text-xs mt-0.5">{station?.title}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-on-surface">฿{selectedUnit?.price}/mo</div>
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
