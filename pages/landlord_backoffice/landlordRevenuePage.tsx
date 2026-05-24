import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";

const MONTHLY = [
  { month: "JAN", rama: 1240, sukhumvit: 880, phrakhanong: 1040, onnut: 520 },
  { month: "FEB", rama: 1280, sukhumvit: 900, phrakhanong: 1080, onnut: 540 },
  { month: "MAR", rama: 1220, sukhumvit: 860, phrakhanong: 1020, onnut: 500 },
  { month: "APR", rama: 1350, sukhumvit: 940, phrakhanong: 1120, onnut: 560 },
  { month: "MAY", rama: 1300, sukhumvit: 920, phrakhanong: 1100, onnut: 540 },
  { month: "JUN", rama: 1420, sukhumvit: 980, phrakhanong: 1160, onnut: 580 },
];

const EVENTS = [
  { date: "Oct 28", label: "FreshMart Lease Renewal Due", type: "renewal" },
  { date: "Nov 01", label: "Bloom Beauty Security Deposit", type: "deposit" },
  { date: "Nov 15", label: "Coffee Corner First Month Due", type: "payment" },
  { date: "Dec 01", label: "7-Eleven Lease Renewal Due", type: "renewal" },
];

const DISTRIBUTION = [
  { station: "Rama 9 Station", pct: 34, color: "bg-[#1C3A1C]" },
  { station: "Phra Khanong Hub", pct: 28, color: "bg-primary" },
  { station: "Sukhumvit Prime", pct: 24, color: "bg-lime-400" },
  { station: "On Nut Central", pct: 14, color: "bg-outline-variant/50" },
];

export default function LandlordRevenuePage() {
  return (
    <LandlordBackofficeLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">Revenue Portfolio</h1>
          <p className="text-sm text-on-surface-variant mt-1">Rental income tracking and financial forecasting.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select className="appearance-none bg-white border border-outline-variant text-on-surface text-xs font-medium py-2 px-4 pr-8 rounded-full border-none outline-none cursor-pointer">
              <option>All Stations</option>
              <option>Rama 9</option>
              <option>Sukhumvit Prime</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none text-outline">expand_more</span>
          </div>
          <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">Export Report</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">YTD Revenue</div>
          <div className="text-3xl font-bold text-on-surface mb-1">28.4M</div>
          <div className="text-xs text-primary">↑ 18% vs last year</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Monthly Avg</div>
          <div className="text-3xl font-bold text-on-surface mb-1">4.2M</div>
          <div className="text-xs text-on-surface-variant">THB across all stations</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Outstanding</div>
          <div className="text-3xl font-bold text-on-surface mb-1">124K</div>
          <div className="text-xs text-amber-600">2 tenants overdue</div>
        </div>
        <div className="bg-[#1C3A1C] rounded-2xl p-5 shadow-sm text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-2">Q4 Forecast</div>
          <div className="text-3xl font-bold mb-1">13.8M</div>
          <div className="text-xs text-white/70">Confidence: 91%</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Revenue trend chart */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-1">Monthly Revenue by Station (K THB)</h3>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1C3A1C] inline-block" />Rama 9</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Phra Khanong</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block" />Sukhumvit</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant/50 inline-block" />On Nut</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {MONTHLY.map((b) => {
              const total = b.rama + b.sukhumvit + b.phrakhanong + b.onnut;
              const max = 4200;
              return (
                <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 items-end" style={{ height: `${Math.round((total / max) * 100)}%`, minHeight: "12px" }}>
                    <div className="flex-1 bg-[#1C3A1C] rounded-t" style={{ height: `${Math.round((b.rama / total) * 100)}%` }} />
                    <div className="flex-1 bg-primary rounded-t" style={{ height: `${Math.round((b.phrakhanong / total) * 100)}%` }} />
                    <div className="flex-1 bg-lime-400 rounded-t" style={{ height: `${Math.round((b.sukhumvit / total) * 100)}%` }} />
                    <div className="flex-1 bg-outline-variant/50 rounded-t" style={{ height: `${Math.round((b.onnut / total) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{b.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Space distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-4">Revenue Distribution</h3>
          <div className="space-y-3 mb-5">
            {DISTRIBUTION.map((d) => (
              <div key={d.station}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">{d.station}</span>
                  <span className="font-bold text-on-surface">{d.pct}%</span>
                </div>
                <div className="h-2 bg-outline-variant/20 rounded-full">
                  <div className={`h-2 ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#F5F2EB] rounded-xl p-3">
            <p className="text-[10px] text-on-surface-variant leading-relaxed">Rama 9 generates the highest per-unit revenue at <strong className="text-on-surface">103K THB/unit/mo</strong>.</p>
          </div>
        </div>
      </div>

      {/* Upcoming events */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-on-surface mb-4">Upcoming Financial Events</h3>
        <div className="space-y-3">
          {EVENTS.map((e) => (
            <div key={e.label} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
              <div className="w-12 text-center">
                <div className="text-xs font-bold text-on-surface-variant uppercase">{e.date.split(" ")[0]}</div>
                <div className="text-lg font-bold text-on-surface">{e.date.split(" ")[1]}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-on-surface">{e.label}</div>
                <div className={`text-xs capitalize ${e.type === "renewal" ? "text-amber-600" : e.type === "deposit" ? "text-blue-600" : "text-primary"}`}>{e.type}</div>
              </div>
              <button type="button" className="text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer">Action →</button>
            </div>
          ))}
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
