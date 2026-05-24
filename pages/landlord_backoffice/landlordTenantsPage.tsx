import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";

const TENANTS = [
  { id: 1, brand: "Coffee Corner Co.", category: "F&B", unit: "A2", station: "Rama 9", leaseStart: "Nov 15, 2025", leaseEnd: "May 14, 2026", rent: "25,200", status: "active", score: 92, payHistory: "100%" },
  { id: 2, brand: "7-Eleven Express", category: "Convenience", unit: "B3", station: "Sukhumvit Prime", leaseStart: "Jan 1, 2025", leaseEnd: "Dec 31, 2025", rent: "88,000", status: "active", score: 97, payHistory: "100%" },
  { id: 3, brand: "FreshMart Ltd.", category: "Convenience", unit: "A1", station: "Phra Khanong Hub", leaseStart: "Mar 1, 2025", leaseEnd: "Aug 31, 2025", rent: "34,000", status: "expiring", score: 74, payHistory: "95%" },
  { id: 4, brand: "Bloom Beauty", category: "Beauty", unit: "A4", station: "Phra Khanong Hub", leaseStart: "Dec 1, 2025", leaseEnd: "Nov 30, 2027", rent: "145,000", status: "pending", score: 91, payHistory: "N/A" },
  { id: 5, brand: "QuickBite Kitchen", category: "F&B", unit: "C2", station: "On Nut Central", leaseStart: "Jun 1, 2025", leaseEnd: "May 31, 2026", rent: "42,000", status: "active", score: 85, payHistory: "98%" },
];

const STATUS_STYLE: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  expiring: "bg-amber-100 text-amber-700",
  pending: "bg-blue-50 text-blue-600",
};

export default function LandlordTenantsPage() {
  return (
    <LandlordBackofficeLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Active Tenants</h1>
          <p className="text-sm text-on-surface-variant mt-1">Lease registry across all managed retail stations.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white cursor-pointer">Filter</button>
          <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">Export Leases</button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Tenants", value: "32" },
          { label: "Active Leases", value: "28" },
          { label: "Expiring (60 Days)", value: "4" },
          { label: "Avg AI Score", value: "87.4" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-on-surface">{k.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center gap-4">
          <div className="relative flex-1 max-w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
            <input placeholder="Search tenants…" className="w-full bg-[#F5F2EB] rounded-full py-2 pl-9 pr-4 text-sm border-none outline-none" />
          </div>
          <span className="text-xs text-on-surface-variant ml-auto">{TENANTS.length} tenants shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F2EB]">
                {["Brand", "Station · Unit", "Monthly Rent (THB)", "Lease Period", "Pay History", "AI Score", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TENANTS.map((t) => (
                <tr key={t.id} className="border-t border-outline-variant/10 hover:bg-[#F5F2EB]/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-on-surface">{t.brand}</div>
                    <div className="text-xs text-on-surface-variant">{t.category}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-on-surface">{t.station}</div>
                    <div className="text-xs text-on-surface-variant">Unit {t.unit}</div>
                  </td>
                  <td className="px-4 py-4 font-medium text-on-surface">{t.rent}</td>
                  <td className="px-4 py-4">
                    <div className="text-xs text-on-surface-variant">{t.leaseStart}</div>
                    <div className="text-xs text-on-surface-variant">→ {t.leaseEnd}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold ${t.payHistory === "100%" ? "text-primary" : "text-amber-600"}`}>{t.payHistory}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-primary">{t.score}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <button type="button" className="text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer">View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
