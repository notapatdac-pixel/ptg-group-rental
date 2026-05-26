"use client";
import { useState, useEffect, useRef } from "react";
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
  coverImage?: string;
  logoImage?: string;
  productImages?: string[];
}

export const PROFILE_KEY = "ptg_retailer_profile";

export function loadProfile(): RetailerProfile | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "null"); } catch { return null; }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_PROFILE: RetailerProfile = {
  businessName: "", contactName: "", phone: "",
  category: "", concept: "", numStores: "",
  yearsExperience: "", maxRentBudget: "",
};

const CATEGORIES = [
  "Coffee & Beverages", "Quick Service Restaurant", "Convenience Retail",
  "Health & Wellness", "Fashion & Apparel", "Specialty Food",
];

const NUM_STORES_OPTIONS = [
  ...Array.from({ length: 20 }, (_, i) => String(i + 1)),
  "20+",
];
const YEARS_EXP_OPTIONS = [
  ...Array.from({ length: 30 }, (_, i) => String(i + 1)),
  "30+",
];

// ── Shared select style ───────────────────────────────────────────────────────

const SELECT_CLS = "w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-10 cursor-pointer text-on-surface";

// ── Component ─────────────────────────────────────────────────────────────────

export default function RetailerProfileSetupPage() {
  const router = useRouter();

  const [profiles,  setProfiles]  = useState<RetailerProfile[]>([{ ...EMPTY_PROFILE }]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    try {
      const multiRaw = localStorage.getItem("ptg_retailer_profiles");
      if (multiRaw) {
        const multi = JSON.parse(multiRaw) as RetailerProfile[];
        if (multi.length > 0) {
          setProfiles(multi);
          const savedIdx = Number(localStorage.getItem("ptg_active_store_index") ?? "0");
          setActiveIdx(Math.min(savedIdx, multi.length - 1));
          return;
        }
      }
      const single = loadProfile();
      if (single) setProfiles([single]);
    } catch {}
  }, []);

  const active = profiles[activeIdx] ?? EMPTY_PROFILE;

  function updateField<K extends keyof RetailerProfile>(field: K, value: RetailerProfile[K]) {
    setProfiles(prev => prev.map((p, i) => i === activeIdx ? { ...p, [field]: value } : p));
  }

  const coverInputRef    = useRef<HTMLInputElement>(null);
  const logoInputRef     = useRef<HTMLInputElement>(null);
  const productInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);

  function handleImageUpload(field: "coverImage" | "logoImage", file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateField(field, base64);
      const name = profiles[activeIdx]?.businessName;
      if (name) {
        try {
          const key = `ptg_store_images_${name}`;
          const existing = JSON.parse(localStorage.getItem(key) ?? "{}");
          existing[field === "coverImage" ? "cover" : "logo"] = base64;
          localStorage.setItem(key, JSON.stringify(existing));
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  }

  function handleProductUpload(index: number, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const current = active.productImages ?? [];
      const next = [...current];
      next[index] = base64;
      updateField("productImages", next);
      const name = profiles[activeIdx]?.businessName;
      if (name) {
        try {
          const key = `ptg_store_images_${name}`;
          const existing = JSON.parse(localStorage.getItem(key) ?? "{}");
          const products = [...((existing.products as string[]) ?? [])];
          products[index] = base64;
          existing.products = products;
          localStorage.setItem(key, JSON.stringify(existing));
        } catch {}
      }
    };
    reader.readAsDataURL(file);
  }

  const filledCount = [active.businessName, active.contactName, active.phone, active.category, active.concept, active.numStores, active.yearsExperience, active.maxRentBudget].filter(Boolean).length;
  const pct = Math.round((filledCount / 8) * 100);

  function handleSave() {
    try {
      localStorage.setItem("ptg_retailer_profiles", JSON.stringify(profiles));
      localStorage.setItem("ptg_active_store_index", String(activeIdx));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles[0]));
      profiles.forEach(p => {
        if (!p.businessName) return;
        try {
          const key = `ptg_store_images_${p.businessName}`;
          const existing = JSON.parse(localStorage.getItem(key) ?? "{}");
          if (p.coverImage)    existing.cover    = p.coverImage;
          if (p.logoImage)     existing.logo     = p.logoImage;
          if (p.productImages) existing.products = p.productImages;
          localStorage.setItem(key, JSON.stringify(existing));
        } catch {}
      });
    } catch {}
    router.push("/retailer_backoffice/retailerDashboardPage");
  }

  function handleAddStore() {
    setProfiles(prev => [...prev, { ...EMPTY_PROFILE }]);
    setActiveIdx(profiles.length);
  }

  return (
    <RetailerBackofficeLayout>

      {/* ── Page heading ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">My Business Profile</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Your details pre-fill applications and power AI location matching.
        </p>
      </div>

      {/* ── Store selector ── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {profiles.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 shadow-sm transition-all border-2 border-solid ${
              activeIdx === i
                ? "bg-white border-primary/30"
                : "bg-white border-outline-variant/20 hover:border-primary/20"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>store</span>
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">Store {i + 1}</div>
              <div className="text-sm font-semibold text-on-surface leading-tight">{p.businessName || "New Store"}</div>
            </div>
            {activeIdx === i && <span className="material-symbols-outlined text-[16px] text-on-surface-variant ml-1">expand_more</span>}
          </button>
        ))}
        <button
          type="button"
          onClick={handleAddStore}
          className="flex items-center gap-1.5 bg-white border border-outline-variant/30 border-solid text-on-surface text-sm font-medium px-4 py-2.5 rounded-xl cursor-pointer hover:bg-[#F5F2EB] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Store
        </button>
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
                value={active.businessName}
                onChange={e => updateField("businessName", e.target.value)}
                placeholder="e.g. Coffee Corner Co., Ltd."
                className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Contact Person</label>
              <input
                value={active.contactName}
                onChange={e => updateField("contactName", e.target.value)}
                placeholder="Full name"
                className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Phone Number</label>
              <input
                value={active.phone}
                onChange={e => updateField("phone", e.target.value)}
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
                  value={active.category}
                  onChange={e => updateField("category", e.target.value)}
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
                value={active.concept}
                onChange={e => updateField("concept", e.target.value)}
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
                  value={active.numStores}
                  onChange={e => updateField("numStores", e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Select…</option>
                  {NUM_STORES_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Years of retail experience</label>
              <div className="relative">
                <select
                  value={active.yearsExperience}
                  onChange={e => updateField("yearsExperience", e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Select…</option>
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
              value={active.maxRentBudget}
              onChange={e => updateField("maxRentBudget", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="e.g. 25000"
              className="w-full bg-[#F5F2EB] rounded-xl pl-8 pr-16 py-3 text-sm border-none outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">/ mo</span>
          </div>
          {active.maxRentBudget && (
            <p className="text-xs text-on-surface-variant mt-2">
              Budget: <strong className="text-on-surface">฿{Number(active.maxRentBudget).toLocaleString()} / month</strong>
            </p>
          )}
        </div>

        {/* Section 5 – Store Photos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-on-surface">Store Photos</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Uploaded photos are shown to landlords when reviewing your application.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map(idx => (
              <div key={idx}>
                <div
                  className="relative w-full aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  style={{ backgroundColor: "#F5F2EB" }}
                  onClick={() => productInputRefs.current[idx]?.click()}
                >
                  {active.productImages?.[idx] ? (
                    <>
                      <img src={active.productImages[idx]} alt={`photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-[20px]">edit</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[28px]">add_photo_alternate</span>
                      <span className="text-xs font-medium">Photo {idx + 1}</span>
                    </div>
                  )}
                </div>
                <input
                  ref={el => { productInputRefs.current[idx] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleProductUpload(idx, f); }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pb-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-[#1C3A1C] text-white font-bold py-3.5 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105 transition-all"
          >
            Save Profile
          </button>
        </div>

      </div>
    </RetailerBackofficeLayout>
  );
}
