import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { useLanguage } from "@/lib/languageContext";

const STRINGS = {
  en: {
    title: "Retailer Profile Setup",
    subtitle: "Complete your profile to unlock premium station applications.",
    steps: ["Brand Identity", "Store Category", "Budget Range", "Preferred Locations", "Brand Assets"],
    brandIdentityHeader: "Brand Identity",
    brandName: "Brand Name",
    businessReg: "Business Registration No.",
    yearsInBusiness: "Years in Business",
    brandDescription: "Brand Description",
    brandDescPlaceholder: "Describe your brand, products, and target customer base…",
    storeCategoryHeader: "Store Category",
    storeCategorySubtitle: "Select all categories that apply to your retail concept.",
    budgetRangeHeader: "Monthly Budget Range (THB)",
    minimum: "Minimum",
    maximum: "Maximum",
    preferredLocationsHeader: "Preferred Locations",
    preferredLocationsSubtitle: "Select regions where you want to expand.",
    brandAssetsHeader: "Brand Assets",
    dragDrop: "Drag & drop or click to browse",
    upload: "Upload",
    saveAndContinue: "Save & Continue →",
    profileCompletion: "Profile Completion",
    profileCompletionSubtitle: "Complete all 5 sections to unlock premium station listings.",
    whyCompleteHeader: "Why Complete Your Profile?",
    benefits: [
      { icon: "star",   label: "Priority Matching",  desc: "Get matched to stations that fit your brand profile." },
      { icon: "speed",  label: "Faster Approvals",   desc: "Complete profiles are reviewed 3× faster." },
      { icon: "shield", label: "Verified Badge",     desc: "Gain trust with landlords and PTG partners." },
    ],
  },
  th: {
    title: "ตั้งค่าโปรไฟล์ร้าน",
    subtitle: "กรอกโปรไฟล์ให้ครบเพื่อปลดล็อกการสมัครสาขาพรีเมียม",
    steps: ["ข้อมูลแบรนด์", "หมวดหมู่ร้าน", "ช่วงงบประมาณ", "ทำเลที่ต้องการ", "สื่อแบรนด์"],
    brandIdentityHeader: "ข้อมูลแบรนด์",
    brandName: "ชื่อแบรนด์",
    businessReg: "เลขทะเบียนธุรกิจ",
    yearsInBusiness: "อายุธุรกิจ (ปี)",
    brandDescription: "คำอธิบายแบรนด์",
    brandDescPlaceholder: "อธิบายแบรนด์ สินค้า และกลุ่มลูกค้าเป้าหมายของคุณ…",
    storeCategoryHeader: "หมวดหมู่ร้าน",
    storeCategorySubtitle: "เลือกหมวดหมู่ที่ตรงกับธุรกิจของคุณ",
    budgetRangeHeader: "ช่วงงบประมาณรายเดือน (บาท)",
    minimum: "ขั้นต่ำ",
    maximum: "สูงสุด",
    preferredLocationsHeader: "ทำเลที่ต้องการ",
    preferredLocationsSubtitle: "เลือกพื้นที่ที่คุณต้องการขยายสาขา",
    brandAssetsHeader: "สื่อแบรนด์",
    dragDrop: "ลากวางหรือคลิกเพื่อเลือกไฟล์",
    upload: "อัปโหลด",
    saveAndContinue: "บันทึกและต่อไป →",
    profileCompletion: "ความสมบูรณ์ของโปรไฟล์",
    profileCompletionSubtitle: "กรอกให้ครบทั้ง 5 ส่วนเพื่อปลดล็อกสาขาพรีเมียม",
    whyCompleteHeader: "ทำไมต้องกรอกโปรไฟล์ให้ครบ?",
    benefits: [
      { icon: "star",   label: "จับคู่ทำเลได้ก่อน",  desc: "รับการจับคู่กับสาขาที่เหมาะกับแบรนด์ของคุณ" },
      { icon: "speed",  label: "อนุมัติเร็วกว่า",      desc: "โปรไฟล์ที่สมบูรณ์จะได้รับการพิจารณาเร็วขึ้น 3 เท่า" },
      { icon: "shield", label: "ป้ายรับรอง",           desc: "สร้างความน่าเชื่อถือกับเจ้าของพื้นที่และพันธมิตร PTG" },
    ],
  },
} as const;

const CATEGORIES = [
  "Coffee & Beverages", "Quick Service Restaurant", "Convenience Retail",
  "Health & Wellness", "Fashion & Apparel", "Electronics",
  "Books & Stationery", "Beauty & Cosmetics",
];

const LOCATIONS = [
  "Bangkok Metropolis", "Eastern Seaboard", "Chiang Mai Cluster",
  "Southern Tourism Hubs", "Northern Highlands", "Central Plains",
];

const BRAND_ASSETS = ["Brand Logo (PNG/SVG)", "Brand Style Guide (PDF)", "Product Catalogue (PDF)"];

export default function RetailerProfileSetupPage() {
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  return (
    <RetailerBackofficeLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">{T.title}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{T.subtitle}</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {T.steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary text-white" : i < 1 ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface-variant"}`}>
                {i < 1 ? <span className="material-symbols-outlined text-[13px]">check</span> : i + 1}
              </div>
              <span className="text-[9px] text-on-surface-variant whitespace-nowrap">{step}</span>
            </div>
            {i < T.steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 ${i < 0 ? "bg-primary" : "bg-outline-variant/20"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main form */}
        <div className="col-span-2 space-y-6">
          {/* Brand Identity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">{T.brandIdentityHeader}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">{T.brandName}</label>
                <input placeholder="e.g. Coffee Corner Co." className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">{T.businessReg}</label>
                  <input placeholder="TH-2023-XXXXXXX" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">{T.yearsInBusiness}</label>
                  <input type="number" placeholder="0" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">{T.brandDescription}</label>
                <textarea rows={3} placeholder={T.brandDescPlaceholder} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* Store Category */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-1">{T.storeCategoryHeader}</h3>
            <p className="text-xs text-on-surface-variant mb-4">{T.storeCategorySubtitle}</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 transition-colors ${
                    cat === "Coffee & Beverages" || cat === "Quick Service Restaurant"
                      ? "bg-primary text-white"
                      : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">{T.budgetRangeHeader}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">{T.minimum}</label>
                <input type="number" defaultValue={50000} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">{T.maximum}</label>
                <input type="number" defaultValue={200000} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              {["< 50K", "50K–100K", "100K–200K", "200K+"].map((r) => (
                <button key={r} type="button" className={`flex-1 py-2 rounded-full text-xs font-medium cursor-pointer border-0 ${r === "50K–100K" ? "bg-primary text-white" : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"}`}>{r}</button>
              ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-1">{T.preferredLocationsHeader}</h3>
            <p className="text-xs text-on-surface-variant mb-4">{T.preferredLocationsSubtitle}</p>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button key={loc} type="button" className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 transition-colors ${loc === "Bangkok Metropolis" ? "bg-primary text-white" : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"}`}>
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Assets */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">{T.brandAssetsHeader}</h3>
            <div className="space-y-3">
              {BRAND_ASSETS.map((asset) => (
                <div key={asset} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">upload_file</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-on-surface">{asset}</div>
                    <div className="text-xs text-on-surface-variant">{T.dragDrop}</div>
                  </div>
                  <button type="button" className="text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer">{T.upload}</button>
                </div>
              ))}
            </div>
          </div>

          <button type="button" className="w-full bg-[#1C3A1C] text-white font-bold py-4 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
            {T.saveAndContinue}
          </button>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          <div className="bg-[#1C3A1C] rounded-2xl p-5 text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-2">{T.profileCompletion}</div>
            <div className="text-4xl font-bold mb-1">35%</div>
            <div className="h-2 bg-white/10 rounded-full mb-3">
              <div className="h-2 bg-lime-400 rounded-full w-[35%]" />
            </div>
            <p className="text-xs text-white/70">{T.profileCompletionSubtitle}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-3">{T.whyCompleteHeader}</h3>
            <div className="space-y-3">
              {T.benefits.map((i) => (
                <div key={i.label} className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">{i.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-on-surface">{i.label}</div>
                    <div className="text-xs text-on-surface-variant">{i.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
