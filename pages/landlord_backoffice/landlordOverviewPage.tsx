import { useState, useEffect } from "react";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useStationFilter, type StationId } from "@/lib/stationFilterContext";
import { useLanguage } from "@/lib/languageContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";
import StationFitPanel from "@/components/landlord_backoffice/StationFitPanel";

const STRINGS = {
  en: {
    title: "Executive Overview",
    subtitle: "Portfolio revenue is tracking",
    benchmarkText: "12% above network benchmark",
    subtitleSuffix: "this month.",
    aiSummaryLabel: "AI Summary",
    monthlyRevenueTrend: "Revenue Performance",
    chartSubtitle: "6-month rolling · THB thousands",
    stationPerformance: "Station Performance",
    stationCol: "Station",
    revenueCol: "Revenue / Mo",
    customersCol: "Customers",
    occupancyCol: "Occupancy",
    perMonth: "/ month",
    avgPerDay: "avg / day",
    occupied: "occupied",
    kpiLabels: {
      "MONTHLY REVENUE (THB)": "MONTHLY REVENUE (THB)",
      "DAILY CUSTOMERS": "DAILY CUSTOMERS",
      "AVG BASKET SIZE (THB)": "AVG BASKET SIZE (THB)",
      "REPEAT VISIT RATE (%)": "REPEAT VISIT RATE (%)",
    } as Record<string, string>,
  },
  th: {
    title: "ภาพรวมทั้งหมด",
    subtitle: "รายได้พอร์ตโฟลิโออยู่ในเกณฑ์ดี",
    benchmarkText: "12% เหนือค่ามาตรฐานเครือข่าย",
    subtitleSuffix: "เดือนนี้",
    aiSummaryLabel: "สรุปโดย AI",
    monthlyRevenueTrend: "ประสิทธิภาพรายได้",
    chartSubtitle: "6 เดือนย้อนหลัง · บาท (พัน)",
    stationPerformance: "ประสิทธิภาพสาขา",
    stationCol: "สาขา",
    revenueCol: "รายได้ / เดือน",
    customersCol: "ลูกค้า",
    occupancyCol: "อัตราการใช้งาน",
    perMonth: "/ เดือน",
    avgPerDay: "เฉลี่ย / วัน",
    occupied: "ถูกใช้งาน",
    kpiLabels: {
      "MONTHLY REVENUE (THB)": "รายได้รายเดือน (บาท)",
      "DAILY CUSTOMERS": "ลูกค้าต่อวัน",
      "AVG BASKET SIZE (THB)": "มูลค่าเฉลี่ยต่อครั้ง (บาท)",
      "REPEAT VISIT RATE (%)": "อัตราการกลับมาซื้อซ้ำ (%)",
    } as Record<string, string>,
  },
} as const;

// ── Station display labels ───────────────────────────────────────────────────

const STATION_LABEL: Record<StationId, string> = {
  all:       "All Stations (avg)",
  lat_phrao: "PTG Lat Phrao 71",
  sukhumvit: "PTG Sukhumvit 62",
  rama9:     "PTG Rama IX",
  bang_na:   "PTG Bang Na Complex",
  main:      "PTG Chatuchak",
};

// ── Display types ────────────────────────────────────────────────────────────

type KpiRow = { label: string; value: string; trend: string; trendTh: string; up: boolean };

const OCCUPANCY_COLOR: Record<string, string> = {
  Full:    "text-primary",
  Partial: "text-amber-600",
  Low:     "text-red-500",
};

// ── API types ────────────────────────────────────────────────────────────────

type ApiKpis = {
  revenue: number;
  revenueChange: string;
  revenueUp: boolean;
  dailyCustomers: number;
  customersChange: string;
  customersUp: boolean;
  basketSize: number;
  repeatRate: string;
  repeatChange: string;
  repeatUp: boolean;
};

type ApiTrendRow = { month: string; station: number };

type ApiStation = {
  filterKey: string;
  name: string;
  location: string;
  revenue: number;
  dailyCustomers: number;
  occupied: number;
  total: number;
  status: "Full" | "Partial" | "Low";
};

type OverviewData = {
  kpis: ApiKpis;
  trend: ApiTrendRow[];
  stations: ApiStation[];
};

// ── Page ─────────────────────────────────────────────────────────────────────

const FMT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtYM(ym: string): string {
  const [y, m] = ym.split("-");
  return `${FMT_MONTHS[parseInt(m) - 1]} ${y.slice(2)}`;
}

export default function LandlordOverviewPage() {
  const { stationId } = useStationFilter();
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const [apiData, setApiData] = useState<OverviewData | null>(null);

  useEffect(() => {
    setApiData(null);
    fetch(`/api/landlord/overview?stationId=${stationId}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: OverviewData | null) => { if (d) setApiData(d); })
      .catch(() => {});
  }, [stationId]);

  const label = STATION_LABEL[stationId];

  // ── KPI display (from live API only) ─────────────────────────────────────
  const kpis: KpiRow[] = apiData ? [
    {
      label: "MONTHLY REVENUE (THB)",
      value: `฿${Math.round(apiData.kpis.revenue).toLocaleString()}`,
      trend: apiData.kpis.revenueChange,
      trendTh: apiData.kpis.revenueChange,
      up: apiData.kpis.revenueUp,
    },
    {
      label: "DAILY CUSTOMERS",
      value: apiData.kpis.dailyCustomers.toLocaleString(),
      trend: apiData.kpis.customersChange,
      trendTh: apiData.kpis.customersChange,
      up: apiData.kpis.customersUp,
    },
    {
      label: "AVG BASKET SIZE (THB)",
      value: `฿${apiData.kpis.basketSize.toFixed(1)}`,
      trend: "latest month",
      trendTh: "เดือนล่าสุด",
      up: true,
    },
    {
      label: "REPEAT VISIT RATE (%)",
      value: apiData.kpis.repeatRate,
      trend: apiData.kpis.repeatChange,
      trendTh: apiData.kpis.repeatChange,
      up: apiData.kpis.repeatUp,
    },
  ] : [];

  const trend = apiData
    ? apiData.trend.map(t => ({ ...t, month: fmtYM(t.month) }))
    : [];

  const visibleStations = apiData
    ? (stationId === "all" ? apiData.stations : apiData.stations.filter(s => s.filterKey === stationId)).map(s => ({
        id: s.filterKey,
        name: s.name,
        location: s.location,
        revenue: `฿${Math.round(s.revenue).toLocaleString()}`,
        customers: s.dailyCustomers.toLocaleString(),
        occupied: s.occupied,
        total: s.total,
        status: s.status,
      }))
    : [];

  // AI context = the SELECTED station only, so the summary matches the KPIs on
  // screen (the filter is per-station; never aggregate all stations here).
  const aiSummary = apiData
    ? [
        `Station: ${label}`,
        `Monthly Revenue: ฿${Math.round(apiData.kpis.revenue).toLocaleString()} (${apiData.kpis.revenueChange})`,
        `Daily Customers: ${apiData.kpis.dailyCustomers.toLocaleString()} (${apiData.kpis.customersChange})`,
        `Avg Basket Size: ฿${apiData.kpis.basketSize.toFixed(1)} | Repeat Rate: ${apiData.kpis.repeatRate} (${apiData.kpis.repeatChange})`,
        visibleStations.map(s => `${s.name}: ${s.revenue}/mo, ${s.customers} daily customers, ${s.occupied}/${s.total} units occupied (${s.total - s.occupied} vacant)`).join("; "),
      ].join(" | ")
    : `Loading data for ${label}...`;

  const vals = trend.length ? trend.map((t) => t.station) : [0, 100];
  const yMin = Math.floor(Math.min(...vals) / 20) * 20 - 20;
  const yMax = Math.ceil(Math.max(...vals) / 20) * 20 + 20;

  return (
    <LandlordBackofficeLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">{T.title}</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {T.subtitle}{" "}
          <span className="font-bold text-primary">{T.benchmarkText}</span>{" "}
          {T.subtitleSuffix}
        </p>
      </div>

      {/* KPIs — 4×1 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
              {T.kpiLabels[m.label] ?? m.label}
            </div>
            <div className="text-3xl font-bold text-on-surface mb-1">{m.value}</div>
            <div className={`text-xs font-medium ${m.up ? "text-primary" : "text-red-500"}`}>
              {lang === "th" ? m.trendTh : m.trend}
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="mb-6">
        <AiSuggestionInline
          role="landlord"
          pageContext={`Executive Overview — ${label}`}
          dataContext={aiSummary}
          label={T.aiSummaryLabel}
        />
      </div>

      {/* AI — best-fit store types per station (Predictive → Symbolic → Generative) */}
      <div className="mb-6">
        <StationFitPanel stationId={stationId} lang={lang} />
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface">{T.monthlyRevenueTrend}</h3>
        <p className="text-xs text-on-surface-variant mb-4">{T.chartSubtitle}</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trend} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={(v: number) => `฿${v}K`}
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip
              formatter={(value: unknown) => [`฿${value}K`, "Revenue"]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Line type="monotone" dataKey="station" stroke="#6ab04c" strokeWidth={2.5}
              dot={{ r: 4, fill: "#6ab04c" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Station Performance */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-outline-variant/20">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">{T.stationPerformance}</div>
          <div className="grid text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
            <span>{T.stationCol}</span>
            <span className="text-right">{T.revenueCol}</span>
            <span className="text-right">{T.customersCol}</span>
            <span className="text-right">{T.occupancyCol}</span>
          </div>
        </div>
        {visibleStations.map((s) => (
          <div key={s.name}
            className="grid items-center px-6 py-5 border-b border-outline-variant/10 last:border-0 hover:bg-[#F5F2EB]/50 transition-colors"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}>
            <div>
              <div className="text-sm font-bold text-on-surface">{s.name}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{s.location}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-on-surface">{s.revenue}</div>
              <div className="text-[10px] text-on-surface-variant">{T.perMonth}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-on-surface">{s.customers}</div>
              <div className="text-[10px] text-on-surface-variant">{T.avgPerDay}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${OCCUPANCY_COLOR[s.status]}`}>{s.occupied} / {s.total} units</div>
              <div className="text-[10px] text-on-surface-variant">{T.occupied}</div>
            </div>
          </div>
        ))}
      </div>
    </LandlordBackofficeLayout>
  );
}
