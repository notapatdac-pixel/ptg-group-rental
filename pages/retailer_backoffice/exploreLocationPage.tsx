import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import Link from "next/link";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";

const STATS = [
  { label: "Daily Customers", value: "12,450+", icon: "group" },
  { label: "Avg Dwell Time", value: "18.5 min", icon: "schedule" },
  { label: "Monthly Revenue", value: "฿285k", icon: "payments" },
  { label: "AI Location Score", value: "94", icon: "auto_awesome" },
];

const UNITS = [
  { id: "A", label: "Corner Unit", sqm: 72, rent: "฿36,500/mo", status: "available" },
  { id: "B", label: "Mid Unit", sqm: 38, rent: "฿18,000/mo", status: "available" },
  { id: "C", label: "Compact Unit", sqm: 48, rent: "฿8,500/mo", status: "available" },
];

const SPECS = [
  ["Total Area", "1,200 sqm"],
  ["EV Charging Bays", "6 Stations"],
  ["Nearest MRT", "Yellow Line 1.2 km"],
  ["Operating Hours", "06:00 – 24:00"],
  ["Parking Spaces", "240"],
  ["Anchor Tenant", "PTG Energy"],
];

export default function ExploreLocationPage() {
  return (
    <RetailerBackofficeLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/retailer_backoffice/myApplicationsPage" className="text-on-surface-variant text-sm hover:text-on-surface">← Back</Link>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">PTG Station Lat Phrao 71</h1>
          <p className="text-sm text-on-surface-variant mt-1">Lat Phrao, Bangkok · Premium Transit Retail Hub</p>
        </div>
        <Link href="/retailer_backoffice/slotSelectionPage">
          <button type="button" className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full border-0 cursor-pointer hover:brightness-105">
            Select a Unit →
          </button>
        </Link>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[#1C3A1C] to-[#2d5a2d] rounded-2xl h-44 mb-6 flex items-end p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">3 Units Available</div>
        <div>
          <h2 className="text-2xl font-bold text-white">Lat Phrao 71</h2>
          <p className="text-sm text-white/70">PTG Premium Partner Location · Est. 2021</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">{s.icon}</span>
            </div>
            <div>
              <div className="text-lg font-bold text-on-surface">{s.value}</div>
              <div className="text-[10px] text-on-surface-variant">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Available units */}
        <div className="col-span-2 space-y-4">
          <h3 className="font-semibold text-on-surface">Available Retail Units</h3>
          {UNITS.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F5F2EB] rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-on-surface">Unit {u.id}</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-on-surface text-sm">{u.label}</div>
                <div className="text-xs text-on-surface-variant">{u.sqm} sqm</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-on-surface text-sm">{u.rent}</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Available</span>
              </div>
              <Link href="/retailer_backoffice/slotSelectionPage">
                <button type="button" className="text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer whitespace-nowrap">Select →</button>
              </Link>
            </div>
          ))}
        </div>

        {/* Station info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-3">Station Details</h3>
            <div className="space-y-2 text-sm">
              {SPECS.map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className="font-medium text-on-surface">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <AiSuggestionInline
            role="retailer"
            pageContext="Explore Location — PTG Lat Phrao 71"
            staticText="Score 94 — Top performer in Lat Phrao cluster. High repeat footfall, premium commuter profile. Ideal for coffee & specialty F&B."
            label="AI LOCATION SCORE"
          />
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
