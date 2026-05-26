import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useStationFilter, type StationId } from "@/lib/stationFilterContext";
import { useLanguage } from "@/lib/languageContext";

const STRINGS = {
  en: {
    title: "Active Tenants",
    subtitle: "Lease registry across all managed retail stations.",
    kpis: ["Total Tenants", "Active Leases", "Expiring (60 Days)"],
    searchPlaceholder: "Search tenants…",
    tableHeaders: ["Brand", "Station · Unit", "Monthly Rent (THB)", "Lease Period", "Pay History", "Status"],
    unit: "Unit",
    noTenants: "No tenants for this station.",
    statusLabels: {
      active: "Active",
      expiring: "Expiring Soon",
      pending: "Pending",
    } as Record<string, string>,
    tenantsShown: (n: number) => `${n} tenants shown`,
  },
  th: {
    title: "ผู้เช่าที่ใช้งาน",
    subtitle: "ทะเบียนการเช่าทั้งหมดของสาขาที่คุณดูแล",
    kpis: ["ผู้เช่าทั้งหมด", "สัญญาที่ใช้งาน", "หมดอายุใน 60 วัน"],
    searchPlaceholder: "ค้นหาผู้เช่า…",
    tableHeaders: ["แบรนด์", "สาขา · ยูนิต", "ค่าเช่ารายเดือน (บาท)", "ระยะเวลาสัญญา", "ประวัติการชำระ", "สถานะ"],
    unit: "ยูนิต",
    noTenants: "ไม่มีผู้เช่าสำหรับสาขานี้",
    statusLabels: {
      active: "ใช้งานอยู่",
      expiring: "ใกล้หมดอายุ",
      pending: "รอดำเนินการ",
    } as Record<string, string>,
    tenantsShown: (n: number) => `แสดง ${n} รายการ`,
  },
};

const TENANTS = [
  { id: 1, stationId: "rama9"     as StationId, brand: "Coffee Corner Co.",  category: "F&B",          unit: "A2", station: "PTG Rama 9",          leaseStart: "Nov 15, 2025", leaseEnd: "May 14, 2026", rent: "25,200",  status: "active",   score: 92, payHistory: "100%" },
  { id: 2, stationId: "sukhumvit" as StationId, brand: "7-Eleven Express",   category: "Convenience",  unit: "B3", station: "PTG Sukhumvit 62",    leaseStart: "Jan 1, 2025",  leaseEnd: "Dec 31, 2025", rent: "88,000",  status: "active",   score: 97, payHistory: "100%" },
  { id: 3, stationId: "lat_phrao" as StationId, brand: "FreshMart Ltd.",     category: "Convenience",  unit: "A1", station: "PTG Lat Phrao 71",    leaseStart: "Mar 1, 2025",  leaseEnd: "Aug 31, 2025", rent: "34,000",  status: "expiring", score: 74, payHistory: "95%"  },
  { id: 4, stationId: "bang_na"   as StationId, brand: "Bloom Beauty",       category: "Beauty",       unit: "A4", station: "PTG Bang Na Complex", leaseStart: "Dec 1, 2025",  leaseEnd: "Nov 30, 2027", rent: "145,000", status: "pending",  score: 91, payHistory: "N/A"  },
  { id: 5, stationId: "main"      as StationId, brand: "QuickBite Kitchen",  category: "F&B",          unit: "C2", station: "PTG Main Station",    leaseStart: "Jun 1, 2025",  leaseEnd: "May 31, 2026", rent: "42,000",  status: "active",   score: 85, payHistory: "98%"  },
];

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-primary/10 text-primary",
  expiring: "bg-amber-100 text-amber-700",
  pending:  "bg-blue-50 text-blue-600",
};

export default function LandlordTenantsPage() {
  const { stationId } = useStationFilter();
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const visible = stationId === "all" ? TENANTS : TENANTS.filter((t) => t.stationId === stationId);

  return (
    <LandlordBackofficeLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">{T.title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{T.subtitle}</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: T.kpis[0], value: String(visible.length) },
          { label: T.kpis[1], value: String(visible.filter((t) => t.status === "active").length) },
          { label: T.kpis[2], value: String(visible.filter((t) => t.status === "expiring").length) },
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
            <input placeholder={T.searchPlaceholder} className="w-full bg-[#F5F2EB] rounded-full py-2 pl-9 pr-4 text-sm border-none outline-none" />
          </div>
          <span className="text-xs text-on-surface-variant ml-auto">{T.tenantsShown(visible.length)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F5F2EB]">
                {T.tableHeaders.map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id} className="border-t border-outline-variant/10 hover:bg-[#F5F2EB]/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-on-surface">{t.brand}</div>
                    <div className="text-xs text-on-surface-variant">{t.category}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-on-surface">{t.station}</div>
                    <div className="text-xs text-on-surface-variant">{T.unit} {t.unit}</div>
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
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>
                      {T.statusLabels[t.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-on-surface-variant">
                    {T.noTenants}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
