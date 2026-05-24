import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import latphrao71Img from "@/components/image/station-ptg-latphrao71.png";
import ramaIxImg from "@/components/image/station-ptg-ramaix.png";

const STATIONS = [
  {
    name: "PTG Lat Phrao 71",
    location: "Lat Phrao Road, Bangkok",
    image: latphrao71Img.src,
    occupied: 4,
    total: 5,
    revenue: "498K THB/MO",
    performance: "+12%",
    renewal: "Oct '24",
  },
  {
    name: "PTG Sukhumvit 62",
    location: "Sukhumvit Road, Bangkok",
    image: ramaIxImg.src,
    occupied: 8,
    total: 8,
    revenue: "318K THB/MO",
    performance: "+27%",
    renewal: "Jan '25",
  },
];

export default function LandlordMyStationsPage() {
  return (
    <LandlordBackofficeLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Stations Performance</h1>
        <button
          type="button"
          className="bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full border-0 cursor-pointer hover:brightness-105 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add New Station
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Active Stations</div>
            <div className="text-4xl font-bold text-on-surface leading-tight">12</div>
            <div className="text-xs font-bold text-primary mt-1">+2 this quarter</div>
          </div>
          <span className="material-symbols-outlined text-[36px] text-outline-variant/50">ev_station</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">AVG. OCCUPANCY</div>
            <div className="text-4xl font-bold text-on-surface leading-tight">94%</div>
            <div className="text-xs font-bold text-primary mt-1">+1.8% vs. last month</div>
          </div>
          <span className="material-symbols-outlined text-[36px] text-outline-variant/50">apartment</span>
        </div>
      </div>

      {/* Station cards */}
      <div className="grid grid-cols-2 gap-6">
        {STATIONS.map((st) => (
          <div key={st.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="rounded-t-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={st.image} alt={st.name} className="w-full h-48 object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-xl font-bold text-on-surface">{st.name}</div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
                    <span className="text-xs text-on-surface-variant">{st.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">OCCUPANCY</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-on-surface">{st.occupied}</span>
                    <span className="text-sm text-on-surface-variant self-end pb-0.5">/ {st.total} units</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                {[
                  { label: "Revenue", value: st.revenue },
                  { label: "Performance", value: st.performance },
                  { label: "Renewals", value: st.renewal },
                ].map((m) => (
                  <div key={m.label} className="bg-surface-container-low rounded-lg px-3 py-2">
                    <div className="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant">{m.label}</div>
                    <div className="text-sm font-bold text-on-surface">{m.value}</div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-full px-4 py-2.5 text-sm font-bold text-on-surface cursor-pointer hover:bg-surface-container transition-colors"
              >
                Edit Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </LandlordBackofficeLayout>
  );
}
