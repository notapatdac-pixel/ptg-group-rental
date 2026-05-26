import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";

const SPACE_DIST = [
  { type: "Anchor retail",  pct: 42, color: "bg-[#1C3A1C]" },
  { type: "Boutique units", pct: 28, color: "bg-[#4a7c2f]" },
  { type: "Popup / kiosks", pct: 18, color: "bg-lime-400"  },
  { type: "Dining terrace", pct: 12, color: "bg-lime-200"  },
];

export default function LandlordRevenuePage() {
  return (
    <LandlordBackofficeLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Revenue Portfolio</h1>
          <p className="text-sm text-on-surface-variant mt-1">Rental income tracking and financial forecasting.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select className="appearance-none bg-white border border-outline-variant text-on-surface text-xs font-medium py-2 px-4 pr-8 rounded-full outline-none cursor-pointer">
              <option>All Stations</option>
              <option>Rama 9</option>
              <option>Sukhumvit Prime</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none text-outline">expand_more</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-on-surface mb-1">฿4.2M</div>
          <div className="text-xs text-primary font-medium">+8.4% vs last month</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Occupancy</div>
          <div className="text-3xl font-bold text-on-surface mb-1">94.2%</div>
          <div className="text-xs text-on-surface-variant">Optimal · 2 units vacant</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Available Units</div>
          <div className="text-3xl font-bold text-on-surface mb-1">17</div>
          <div className="text-xs text-on-surface-variant">Across 10 stations</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Avg. Tenant Score</div>
          <div className="text-3xl font-bold text-on-surface mb-1">87%</div>
          <div className="text-xs text-primary font-medium">+0.2 improved sentiment</div>
        </div>
      </div>

      {/* Space distribution */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-3 bg-white rounded-2xl p-6 shadow-sm flex flex-col">
          <div>
            <h3 className="font-semibold text-on-surface mb-1">Space distribution</h3>
            <p className="text-xs text-on-surface-variant mb-5">Revenue share by unit type</p>
            <div className="space-y-4">
              {SPACE_DIST.map((d) => (
                <div key={d.type}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-on-surface-variant">{d.type}</span>
                    <span className="font-bold text-on-surface">{d.pct}%</span>
                  </div>
                  <div className="h-2 bg-outline-variant/20 rounded-full">
                    <div className={`h-2 ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
