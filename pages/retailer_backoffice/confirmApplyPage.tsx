import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import Link from "next/link";

export default function ConfirmApplyPage() {
  return (
    <RetailerBackofficeLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/retailer_backoffice/slotSelectionPage" className="text-on-surface-variant text-sm hover:text-on-surface">← Back to Slot Selection</Link>
        </div>
        <h1 className="text-3xl font-bold text-on-surface">Confirm Application</h1>
        <p className="text-sm text-on-surface-variant mt-1">Review your unit selection and complete your retailer details.</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Business Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Legal Business Name</label>
                  <input defaultValue="Coffee Corner Co., Ltd." className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Tax ID</label>
                  <input placeholder="0-0000-00000-00-0" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Registered Address</label>
                <input placeholder="Full registered business address" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Contact Person</label>
                  <input placeholder="Full name" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Phone Number</label>
                  <input placeholder="+66 XX-XXXX-XXXX" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Proposed Operations</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Store Concept</label>
                <textarea rows={2} defaultValue="Specialty coffee and artisan pastry kiosk targeting morning and afternoon commuters." className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Preferred Start Date</label>
                  <input type="date" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Lease Duration</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer">
                      <option>6 Months</option>
                      <option>12 Months</option>
                      <option>24 Months</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Operating Hours</label>
                <div className="flex gap-2">
                  {["06:00–14:00", "08:00–20:00", "10:00–22:00", "24 Hours"].map((h) => (
                    <button key={h} type="button" className={`flex-1 py-2 rounded-full text-xs font-medium cursor-pointer border-0 ${h === "08:00–20:00" ? "bg-primary text-white" : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"}`}>{h}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Document Upload</h3>
            <div className="space-y-3">
              {[
                { label: "Business Registration Certificate", required: true },
                { label: "VAT Registration (PP.20)", required: true },
                { label: "Director's ID Copy", required: true },
                { label: "Brand Portfolio / Lookbook", required: false },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">upload_file</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-on-surface">{doc.label}</div>
                    <div className="text-xs text-on-surface-variant">{doc.required ? "Required" : "Optional"}</div>
                  </div>
                  <button type="button" className="text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer">Upload</button>
                </div>
              ))}
            </div>
          </div>

          <Link href="/retailer_backoffice/bookingConfirmPage">
            <button type="button" className="w-full bg-[#1C3A1C] text-white font-bold py-4 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
              Submit Application →
            </button>
          </Link>
        </div>

        {/* Unit summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Unit Summary</div>
            <div className="bg-[#F5F2EB] rounded-xl p-4 mb-4">
              <div className="text-lg font-bold text-on-surface">A2 — Pop-up Corner</div>
              <div className="text-sm text-on-surface-variant">Rama 9 Station, Level 1</div>
              <div className="text-xs text-on-surface-variant mt-1">8 sqm</div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {[
                ["Monthly Rent", "22,000 THB"],
                ["Service Charge", "3,200 THB"],
                ["Security Deposit", "66,000 THB"],
                ["Lease Term", "6 Months"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className="font-medium text-on-surface">{v}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-outline-variant/20 mb-3" />
            <div className="flex justify-between font-bold text-sm">
              <span>Due at Signing</span>
              <span className="text-primary">91,200 THB</span>
            </div>
          </div>
          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-xs text-on-surface leading-relaxed">
              <strong>48-hour hold</strong> applied to your selected slot. Complete this form before <strong>Oct 28, 2025</strong> to secure your unit.
            </p>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
