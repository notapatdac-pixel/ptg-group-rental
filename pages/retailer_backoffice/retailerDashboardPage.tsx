import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const BARS = [
  { month: "JAN", coffee: 60, mart: 38 },
  { month: "FEB", coffee: 72, mart: 44 },
  { month: "MAR", coffee: 65, mart: 50 },
  { month: "APR", coffee: 85, mart: 55 },
  { month: "MAY", coffee: 78, mart: 48 },
  { month: "JUN", coffee: 92, mart: 62 },
];

const STORES = [
  { name: "Coffee Corner", location: "Lat Phrao 71", revenue: "฿142,000", status: "Active", score: 92 },
  { name: "Quick Mart",    location: "Sukhumvit 62",  revenue: "฿98,000",  status: "Active", score: 78 },
];

const TRAFFIC = [
  { label: "Morning",   pct: 62 },
  { label: "Afternoon", pct: 24 },
  { label: "Evening",   pct: 10 },
  { label: "Night",     pct: 4  },
];

export default function RetailerDashboardPage() {
  return (
    <RetailerBackofficeLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">Retailer Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Overview of your retail performance and activity.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white cursor-pointer">Refresh</button>
          <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">Export Report</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Monthly Revenue</div>
          <div className="text-3xl font-bold text-on-surface mb-1">฿5k</div>
          <div className="text-xs text-primary">↑ 12% from last month</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Daily Customers</div>
          <div className="text-3xl font-bold text-on-surface mb-1">340</div>
          <div className="h-1.5 bg-outline-variant/20 rounded-full mt-2"><div className="h-1.5 bg-primary rounded-full w-[68%]" /></div>
        </div>
        <div className="bg-[#1C3A1C] rounded-2xl p-5 shadow-sm text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-2">Active Stores</div>
          <div className="text-3xl font-bold mb-1">2</div>
          <div className="text-xs text-white/70">All stores operational</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-1">Monthly Revenue by Store</h3>
          <p className="text-xs text-on-surface-variant mb-4">Comparative analysis across core retail units.</p>
          <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />Coffee Corner</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-outline-variant/50 inline-block" />Quick Mart</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {BARS.map((b) => (
              <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 items-end">
                  <div className="flex-1 bg-primary rounded-t" style={{ height: `${b.coffee}%`, minHeight: "8px" }} />
                  <div className="flex-1 bg-outline-variant/40 rounded-t" style={{ height: `${b.mart}%`, minHeight: "8px" }} />
                </div>
                <span className="text-[10px] text-on-surface-variant">{b.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic distribution */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-on-surface mb-4">Traffic Distribution</h3>
          <div className="space-y-3">
            {TRAFFIC.map((t) => (
              <div key={t.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">{t.label}</span>
                  <span className="font-bold text-on-surface">{t.pct}%</span>
                </div>
                <div className="h-2 bg-outline-variant/20 rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Stores */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-on-surface mb-4">My Stores</h3>
        <div className="space-y-3">
          {STORES.map((s) => (
            <div key={s.name} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">storefront</span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-on-surface">{s.name}</div>
                <div className="text-xs text-on-surface-variant">{s.location}</div>
              </div>
              <div className="font-bold text-on-surface text-sm">{s.revenue}</div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s.status}</span>
              <div className="text-xs text-primary font-bold">Score {s.score}</div>
            </div>
          ))}
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
