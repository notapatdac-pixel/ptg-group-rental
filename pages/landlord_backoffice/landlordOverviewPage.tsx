import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";

const REVENUE_BARS = [
  { month: "JAN", gross: 58, net: 42 },
  { month: "FEB", gross: 64, net: 48 },
  { month: "MAR", gross: 90, net: 68 },
  { month: "APR", gross: 82, net: 62 },
  { month: "MAY", gross: 112, net: 85 },
  { month: "JUN", gross: 76, net: 56 },
];

const PENDING = [
  { name: "Artisan Brew Co.", sub: "Kasemsawat S.", station: "Sukhumvit 62 (B-04)", category: "FOOD & BEVERAGE", score: 92, status: "Under Review" },
  { name: "PureHealth Pharma", sub: "Nongnooch T.", station: "Rama IV (C-02)", category: "WELLNESS", score: 88, status: "In Verification" },
];

export default function LandlordOverviewPage() {
  const maxGross = Math.max(...REVENUE_BARS.map((b) => b.gross));

  return (
    <LandlordBackofficeLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">Executive Overview</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Welcome back, your retail ecosystem is performing{" "}
            <span className="font-bold text-primary">12% above benchmark</span> this month.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white cursor-pointer">Last 30 Days</button>
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white cursor-pointer flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">download</span>Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-on-surface mb-1">฿4.2M</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-primary">+8.4%</span>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wide">VS LAST MONTH</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Occupancy</div>
          <div className="text-3xl font-bold text-on-surface mb-1">94.2%</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-primary">Optimal</span>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wide">2 UNITS VACANT</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Pending Reviews</div>
          <div className="text-3xl font-bold text-on-surface mb-1">12</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-primary">4 Urgent</span>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wide">EXPIRING SOON</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Active Tenants</div>
          <div className="text-3xl font-bold text-on-surface mb-1">7</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-primary">+1 this month</span>
            <span className="text-[11px] text-on-surface-variant uppercase tracking-wide">ACTIVE LEASES</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Dual-bar revenue chart */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-on-surface">Rental Revenue Trend</h3>
              <p className="text-xs text-on-surface-variant">Monthly gross vs net (THB thousands)</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#344e00] inline-block" />Gross</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Net</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-44">
            {REVENUE_BARS.map((b) => (
              <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end">
                  <div className="flex-1 bg-[#344e00] rounded-t" style={{ height: `${(b.gross / maxGross) * 100}%`, minHeight: "6px" }} />
                  <div className="flex-1 bg-primary rounded-t" style={{ height: `${(b.net / maxGross) * 100}%`, minHeight: "6px" }} />
                </div>
                <span className="text-[10px] text-on-surface-variant">{b.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Space occupancy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-on-surface mb-4">Space Occupancy</h3>
          {[
            { station: "Sukhumvit 62", location: "Bang Chak, Bangkok", badge: "8/10 Units", cls: "bg-primary/10 text-primary" },
            { station: "Lat Phrao 71", location: "Wang Thonglang, Bangkok", badge: "10/10 Units", cls: "bg-secondary/10 text-secondary" },
            { station: "Rama IV", location: "Khlong Toei, Bangkok", badge: "5/6 Units", cls: "bg-primary/10 text-primary" },
          ].map((s) => (
            <div key={s.station} className="flex items-center justify-between py-3 border-b border-outline-variant/20 last:border-0">
              <div>
                <div className="text-sm font-bold text-on-surface">{s.station}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{s.location}</div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.badge}</span>
            </div>
          ))}
          <a href="/landlord_backoffice/landlordMyStationsPage" className="text-[11px] font-bold tracking-widest text-primary no-underline block text-center pt-3 hover:underline">
            VIEW ALL ASSETS
          </a>
        </div>
      </div>

      {/* Pending applications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold italic text-on-surface">Pending Applications</h3>
          <span className="text-[11px] font-bold tracking-wide text-primary bg-primary/10 px-3 py-1 rounded-full">4 NEW REQUESTS</span>
        </div>
        <div className="grid pb-2 border-b border-outline-variant/20 text-[10px] font-bold tracking-widest text-on-surface-variant gap-x-6"
          style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr 1fr auto" }}>
          <span>APPLICANT</span>
          <span>PROPOSED STATION</span>
          <span>CATEGORY</span>
          <span>SCORE</span>
          <span>STATUS</span>
          <span>ACTIONS</span>
        </div>
        {PENDING.map((app) => (
          <div
            key={app.name}
            className="grid items-center gap-x-6 py-3 border-b border-outline-variant/20 last:border-0"
            style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr 1fr auto" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{app.name[0]}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-on-surface">{app.name}</div>
                <div className="text-xs text-on-surface-variant">{app.sub}</div>
              </div>
            </div>
            <span className="text-sm text-on-surface">{app.station}</span>
            <span className="text-[10px] font-bold tracking-wide text-on-surface-variant border border-outline-variant rounded-full px-2 py-0.5 w-fit">{app.category}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-on-surface w-6 flex-shrink-0">{app.score}</span>
              <div className="flex-1 h-1.5 bg-outline-variant/20 rounded-full">
                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${app.score}%` }} />
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${app.status === "Under Review" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>
              {app.status}
            </span>
            <div className="flex items-center gap-2 justify-end">
              <button type="button" className="bg-transparent border-0 cursor-pointer p-0">
                <span className="material-symbols-outlined text-[22px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </button>
              <button type="button" className="bg-transparent border-0 cursor-pointer p-0">
                <span className="material-symbols-outlined text-[22px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </LandlordBackofficeLayout>
  );
}
