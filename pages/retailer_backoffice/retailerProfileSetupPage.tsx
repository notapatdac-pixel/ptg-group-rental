"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

// ── Exports used by other pages ───────────────────────────────────────────────

export interface RetailerProfile {
  businessName: string;
  contactName: string;
  phone: string;
  category: string;
  concept: string;
  numStores: string;
  yearsExperience: string;
  maxRentBudget: string;
}

export const PROFILE_KEY = "ptg_retailer_profile";

export function loadProfile(): RetailerProfile | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null"); } catch { return null; }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Coffee & Beverages", "Quick Service Restaurant", "Convenience Retail",
  "Health & Wellness", "Fashion & Apparel", "Specialty Food",
];

const NUM_STORES_OPTIONS = ["1 Store", "2–3 Stores", "4–9 Stores", "10+ Stores"];
const YEARS_EXP_OPTIONS  = ["< 1 Year", "1–3 Years", "3–5 Years", "5+ Years"];

// ── Shared select style ───────────────────────────────────────────────────────

const SELECT_CLS = "w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-10 cursor-pointer text-on-surface";

// ── Component ─────────────────────────────────────────────────────────────────

export default function RetailerProfileSetupPage() {
  const router = useRouter();

  const [businessName, setBusinessName]       = useState("");
  const [contactName, setContactName]         = useState("");
  const [phone, setPhone]                     = useState("");
  const [category, setCategory]               = useState("");
  const [concept, setConcept]                 = useState("");
  const [numStores, setNumStores]             = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [maxRentBudget, setMaxRentBudget]     = useState("");
  const [saved, setSaved]                     = useState(false);
  const [addStorePing, setAddStorePing]       = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p) return;
    setBusinessName(p.businessName ?? "");
    setContactName(p.contactName ?? "");
    setPhone(p.phone ?? "");
    setCategory(p.category ?? "");
    setConcept(p.concept ?? "");
    setNumStores(p.numStores ?? "");
    setYearsExperience(p.yearsExperience ?? "");
    setMaxRentBudget(p.maxRentBudget ?? "");
  }, []);

  const filledCount = [businessName, contactName, phone, category, concept, numStores, yearsExperience, maxRentBudget].filter(Boolean).length;
  const pct = Math.round((filledCount / 8) * 100);

  function handleSave() {
    const profile: RetailerProfile = {
      businessName, contactName, phone,
      category, concept,
      numStores, yearsExperience,
      maxRentBudget,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleSaveAndBrowse() {
    handleSave();
    router.push("/explorepage/explorePage");
  }

  function handleAddStore() {
    setAddStorePing(true);
    setTimeout(() => setAddStorePing(false), 2800);
  }

  return (
    <RetailerBackofficeLayout>

      {/* ── Page heading ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">My Business Profile</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Your details pre-fill applications and power AI location matching.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
          <span className="material-symbols-outlined text-primary text-[16px]">verified</span>
          {pct}% complete
        </div>
      </div>

      {/* ── Store selector ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2.5 bg-white border-2 border-primary/20 rounded-xl px-4 py-2.5 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Store 1</div>
            <div className="text-sm font-semibold text-on-surface leading-tight">{businessName || "Your Store"}</div>
          </div>
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant ml-1">expand_more</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={handleAddStore}
            className="flex items-center gap-1.5 bg-white border border-outline-variant/30 text-on-surface text-sm font-medium px-4 py-2.5 rounded-xl cursor-pointer hover:bg-[#F5F2EB] transition-colors border-solid"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Store
          </button>
          {addStorePing && (
            <div className="absolute left-0 top-[calc(100%+8px)] bg-[#1C3A1C] text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap shadow-lg z-10">
              <span className="material-symbols-outlined text-[12px] mr-1 align-middle">schedule</span>
              Multi-store support coming soon
            </div>
          )}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="space-y-5">

        {/* Section 1 – Identity & Contact */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-on-surface">Identity & Contact</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Pre-fills every rental application automatically.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Business / Brand Name</label>
              <input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Coffee Corner Co., Ltd."
                className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Contact Person</label>
              <input
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="Full name"
                className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+66 XX-XXXX-XXXX"
                className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2 – Store Profile */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-on-surface">Store Profile</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Matches your brand to the right audience and station type.</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Business Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Select a category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Store Concept (1–2 sentences)</label>
              <textarea
                value={concept}
                onChange={e => setConcept(e.target.value)}
                rows={3}
                placeholder="e.g. Specialty coffee and artisan pastry kiosk targeting morning and afternoon commuters."
                className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3 – Business Experience */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-on-surface">Business Experience</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Helps us match you to the right station size and support level.</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">How many stores do you currently operate?</label>
              <div className="relative">
                <select
                  value={numStores}
                  onChange={e => setNumStores(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Select number of stores…</option>
                  {NUM_STORES_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Years of retail experience</label>
              <div className="relative">
                <select
                  value={yearsExperience}
                  onChange={e => setYearsExperience(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Select years of experience…</option>
                  {YEARS_EXP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 – Expansion Budget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-on-surface">Expansion Budget</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">How much monthly rent can your business comfortably afford?</p>
          </div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Max Monthly Rent Budget</label>
          <div className="relative max-w-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">฿</span>
            <input
              type="text"
              inputMode="numeric"
              value={maxRentBudget}
              onChange={e => setMaxRentBudget(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 25000"
              className="w-full bg-[#F5F2EB] rounded-xl pl-8 pr-16 py-3 text-sm border-none outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">/ mo</span>
          </div>
          {maxRentBudget && (
            <p className="text-xs text-on-surface-variant mt-2">
              Budget: <strong className="text-on-surface">฿{Number(maxRentBudget).toLocaleString()} / month</strong>
            </p>
          )}
        </div>

        {/* Save buttons */}
        <div className="flex gap-3 pb-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-[#1C3A1C] text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105 transition-all flex items-center justify-center gap-2"
          >
            {saved ? (
              <><span className="material-symbols-outlined text-[16px]">check</span> Saved</>
            ) : "Save Profile"}
          </button>
          <button
            type="button"
            onClick={handleSaveAndBrowse}
            className="flex-1 border border-outline-variant/30 text-on-surface font-bold py-3.5 rounded-xl text-sm cursor-pointer bg-white hover:bg-[#F5F2EB] transition-colors"
          >
            Save & Browse Stations →
          </button>
        </div>

      </div>
    </RetailerBackofficeLayout>
  );
}
