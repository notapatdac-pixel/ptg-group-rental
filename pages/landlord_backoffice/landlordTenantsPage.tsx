import { useState, useEffect } from "react";
import Link from "next/link";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";
import { useStationFilter } from "@/lib/stationFilterContext";
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

type ApiTenant = {
  id: string;
  retailerId: string;
  brand: string;
  category: string;
  stationId: string;
  station: string;
  unit: string;
  rent: string;
  leaseStart: string;
  leaseEnd: string;
  payHistory: string;
  aiScore: number;
  status: string;
  storePerf: string;
};

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-primary/10 text-primary",
  expiring: "bg-amber-100 text-amber-700",
  pending:  "bg-blue-50 text-blue-600",
};

export default function LandlordTenantsPage() {
  const { stationId } = useStationFilter();
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const [allTenants, setAllTenants] = useState<ApiTenant[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/landlord/tenants")
      .then(r => r.ok ? r.json() : [])
      .then((d: ApiTenant[]) => setAllTenants(d))
      .catch(() => {});
  }, []);

  const byStation = stationId === "all" ? allTenants : allTenants.filter(t => t.stationId === stationId);
  const visible = search
    ? byStation.filter(t => t.brand.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
    : byStation;

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
            <input
              placeholder={T.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#F5F2EB] rounded-full py-2 pl-9 pr-4 text-sm border-none outline-none"
            />
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
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>
                        {T.statusLabels[t.status]}
                      </span>
                      {t.status === "expiring" && (
                        <Link
                          href="/landlord_backoffice/landlordApplicationsPage"
                          className="text-[10px] font-semibold text-amber-700 underline no-underline hover:opacity-80"
                        >
                          {lang === "th" ? "ติดต่อต่อสัญญา" : "Initiate Renewal"}
                        </Link>
                      )}
                    </div>
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

      {/* AI Suggestion */}
      <div className="mt-6">
        <AiSuggestionInline
          role="landlord"
          pageContext="Tenant Management"
          dataContext={`Total tenants: ${visible.length} | Active: ${visible.filter(t => t.status === "active").length} | Expiring (60 days): ${visible.filter(t => t.status === "expiring").length} | Pending: ${visible.filter(t => t.status === "pending").length} | Expiring tenants: ${visible.filter(t => t.status === "expiring").map(t => `${t.brand} at ${t.station} (ends ${t.leaseEnd}, ฿${t.rent}/mo)`).join("; ") || "none"}`}
          label="AI TENANT INSIGHT"
        />
      </div>
    </LandlordBackofficeLayout>
  );
}
