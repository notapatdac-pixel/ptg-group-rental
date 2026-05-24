import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import Link from "next/link";

const UNITS = [
  { id: "A1", type: "Premium Kiosk", sqm: 30, rent: 85000, status: "occupied", tenant: "7-Eleven Express" },
  { id: "A2", type: "Pop-up Corner", sqm: 8, rent: 22000, status: "occupied", tenant: "Coffee Corner Co." },
  { id: "A3", type: "Express Counter", sqm: 12, rent: 34000, status: "vacant", tenant: null },
  { id: "B1", type: "Boutique Unit", sqm: 60, rent: 145000, status: "occupied", tenant: "QuickBite Kitchen" },
  { id: "B2", type: "Standard Kiosk", sqm: 20, rent: 55000, status: "occupied", tenant: "FreshMart Ltd." },
  { id: "B3", type: "Flagship Store", sqm: 120, rent: 280000, status: "vacant", tenant: null },
];

export default function LandlordEditStationPage() {
  return (
    <LandlordBackofficeLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/landlord_backoffice/landlordMyStationsPage" className="text-on-surface-variant text-sm hover:text-on-surface">← My Stations</Link>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Edit Station</h1>
            <p className="text-sm text-on-surface-variant mt-1">Rama 9 Station · Pathumgao, Bangkok</p>
          </div>
          <div className="flex gap-3">
            <button type="button" className="border border-outline-variant text-on-surface text-sm font-medium px-4 py-2 rounded-full bg-white cursor-pointer">Discard</button>
            <button type="button" className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">Save Changes</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main form */}
        <div className="col-span-2 space-y-6">
          {/* Station info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Station Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Station Name</label>
                <input defaultValue="Rama 9 Station – Retail Hub" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Province</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer">
                      <option>Bangkok</option>
                      <option>Chiang Mai</option>
                      <option>Phuket</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Station Type</label>
                  <div className="relative">
                    <select className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer">
                      <option>Premium Transit Hub</option>
                      <option>Community Station</option>
                      <option>Highway Stop</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Total Retail Area (sqm)</label>
                  <input type="number" defaultValue={4200} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Operating Hours</label>
                  <input defaultValue="06:00 – 24:00" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Station Description</label>
                <textarea rows={3} defaultValue="Premium transit retail hub serving 12,400 daily commuters. Anchor tenants include PTG Energy, 7-Eleven, and McDonald's Express." className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* Unit inventory */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface">Unit Inventory</h3>
              <button type="button" className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span>Add Unit
              </button>
            </div>
            <div className="space-y-3">
              {UNITS.map((unit) => (
                <div key={unit.id} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-on-surface">{unit.id}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-on-surface">{unit.type} · {unit.sqm} sqm</div>
                    <div className="text-xs text-on-surface-variant">{unit.tenant ?? "Vacant"}</div>
                  </div>
                  <div className="text-sm font-medium text-on-surface">{unit.rent.toLocaleString()} THB/mo</div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${unit.status === "occupied" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>{unit.status}</span>
                  <button type="button" className="text-xs text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Station Photos</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-video bg-[#F5F2EB] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-outline text-2xl">add_photo_alternate</span>
                  <span className="text-xs text-on-surface-variant">Add Photo</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Station Stats</h3>
            <div className="space-y-3 text-sm">
              {[
                ["Total Units", "12"],
                ["Occupied", "10"],
                ["Vacant", "2"],
                ["Occupancy Rate", "83%"],
                ["Monthly Revenue", "1.42M THB"],
                ["Daily Footfall", "12,400"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className="font-medium text-on-surface">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1C3A1C] rounded-2xl p-5 text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-lime-300 mb-2">AI Station Score</div>
            <div className="text-4xl font-bold mb-1">94</div>
            <p className="text-xs text-white/70 mb-3">Top 10% of PTG network stations. Strong candidate for flagship retail expansion.</p>
            <button type="button" className="text-xs text-lime-400 font-semibold bg-transparent border-0 cursor-pointer">View AI Insights →</button>
          </div>
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
