import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useStationFilter, type StationId } from "@/lib/stationFilterContext";
import { useLanguage } from "@/lib/languageContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";

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
  rama9:     "PTG Rama 9",
  bang_na:   "PTG Bang Na Complex",
  main:      "PTG Main Station",
};

// ── Per-station KPI data ─────────────────────────────────────────────────────

type KpiRow = { label: string; value: string; trend: string; trendTh: string; up: boolean };

const STATION_KPIS: Record<StationId, KpiRow[]> = {
  all: [
    { label: "MONTHLY REVENUE (THB)", value: "฿337K",  trend: "+4.6% vs last month",  trendTh: "+4.6% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "DAILY CUSTOMERS",       value: "9,410",   trend: "+2.1% vs last month",  trendTh: "+2.1% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "AVG BASKET SIZE (THB)", value: "฿35.8",   trend: "+1.8% vs last month",  trendTh: "+1.8% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "REPEAT VISIT RATE (%)", value: "39.2%",   trend: "+0.7pp vs last month", trendTh: "+0.7pp เทียบกับเดือนที่แล้ว", up: true  },
  ],
  lat_phrao: [
    { label: "MONTHLY REVENUE (THB)", value: "฿498K",  trend: "+5.1% vs last month",  trendTh: "+5.1% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "DAILY CUSTOMERS",       value: "12,715",  trend: "+3.2% vs last month",  trendTh: "+3.2% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "AVG BASKET SIZE (THB)", value: "฿39.2",   trend: "+2.3% vs last month",  trendTh: "+2.3% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "REPEAT VISIT RATE (%)", value: "42.3%",   trend: "+1.2pp vs last month", trendTh: "+1.2pp เทียบกับเดือนที่แล้ว", up: true  },
  ],
  sukhumvit: [
    { label: "MONTHLY REVENUE (THB)", value: "฿318K",  trend: "+2.0% vs last month",  trendTh: "+2.0% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "DAILY CUSTOMERS",       value: "10,398",  trend: "+1.4% vs last month",  trendTh: "+1.4% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "AVG BASKET SIZE (THB)", value: "฿30.6",   trend: "-0.8% vs last month",  trendTh: "-0.8% เทียบกับเดือนที่แล้ว",  up: false },
    { label: "REPEAT VISIT RATE (%)", value: "38.7%",   trend: "+0.4pp vs last month", trendTh: "+0.4pp เทียบกับเดือนที่แล้ว", up: true  },
  ],
  rama9: [
    { label: "MONTHLY REVENUE (THB)", value: "฿287K",  trend: "-1.2% vs last month",  trendTh: "-1.2% เทียบกับเดือนที่แล้ว",  up: false },
    { label: "DAILY CUSTOMERS",       value: "8,326",   trend: "-0.9% vs last month",  trendTh: "-0.9% เทียบกับเดือนที่แล้ว",  up: false },
    { label: "AVG BASKET SIZE (THB)", value: "฿34.5",   trend: "+0.3% vs last month",  trendTh: "+0.3% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "REPEAT VISIT RATE (%)", value: "36.2%",   trend: "-0.5pp vs last month", trendTh: "-0.5pp เทียบกับเดือนที่แล้ว", up: false },
  ],
  bang_na: [
    { label: "MONTHLY REVENUE (THB)", value: "฿244K",  trend: "+1.6% vs last month",  trendTh: "+1.6% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "DAILY CUSTOMERS",       value: "6,512",   trend: "+0.5% vs last month",  trendTh: "+0.5% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "AVG BASKET SIZE (THB)", value: "฿37.5",   trend: "+2.1% vs last month",  trendTh: "+2.1% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "REPEAT VISIT RATE (%)", value: "33.8%",   trend: "-0.4pp vs last month", trendTh: "-0.4pp เทียบกับเดือนที่แล้ว", up: false },
  ],
  main: [
    { label: "MONTHLY REVENUE (THB)", value: "฿337K",  trend: "+0.9% vs last month",  trendTh: "+0.9% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "DAILY CUSTOMERS",       value: "9,100",   trend: "+1.3% vs last month",  trendTh: "+1.3% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "AVG BASKET SIZE (THB)", value: "฿37.0",   trend: "+1.2% vs last month",  trendTh: "+1.2% เทียบกับเดือนที่แล้ว",  up: true  },
    { label: "REPEAT VISIT RATE (%)", value: "40.1%",   trend: "+0.3pp vs last month", trendTh: "+0.3pp เทียบกับเดือนที่แล้ว", up: true  },
  ],
};

// ── Per-station revenue trend (THB K) ────────────────────────────────────────

type TrendRow = { month: string; station: number };

const STATION_TRENDS: Record<StationId, TrendRow[]> = {
  all: [
    { month: "Jun 24", station: 322 },
    { month: "Jul 24", station: 318 },
    { month: "Aug 24", station: 329 },
    { month: "Sep 24", station: 335 },
    { month: "Oct 24", station: 330 },
    { month: "Nov 24", station: 337 },
  ],
  lat_phrao: [
    { month: "Jun 24", station: 471 },
    { month: "Jul 24", station: 460 },
    { month: "Aug 24", station: 478 },
    { month: "Sep 24", station: 485 },
    { month: "Oct 24", station: 488 },
    { month: "Nov 24", station: 498 },
  ],
  sukhumvit: [
    { month: "Jun 24", station: 302 },
    { month: "Jul 24", station: 308 },
    { month: "Aug 24", station: 310 },
    { month: "Sep 24", station: 312 },
    { month: "Oct 24", station: 314 },
    { month: "Nov 24", station: 318 },
  ],
  rama9: [
    { month: "Jun 24", station: 295 },
    { month: "Jul 24", station: 290 },
    { month: "Aug 24", station: 285 },
    { month: "Sep 24", station: 283 },
    { month: "Oct 24", station: 286 },
    { month: "Nov 24", station: 287 },
  ],
  bang_na: [
    { month: "Jun 24", station: 238 },
    { month: "Jul 24", station: 241 },
    { month: "Aug 24", station: 243 },
    { month: "Sep 24", station: 242 },
    { month: "Oct 24", station: 240 },
    { month: "Nov 24", station: 244 },
  ],
  main: [
    { month: "Jun 24", station: 318 },
    { month: "Jul 24", station: 322 },
    { month: "Aug 24", station: 328 },
    { month: "Sep 24", station: 331 },
    { month: "Oct 24", station: 334 },
    { month: "Nov 24", station: 337 },
  ],
};

// ── Per-station AI summaries ─────────────────────────────────────────────────

const STATION_AI_SUMMARY: Record<StationId, string> = {
  all:
    "Your portfolio averaged ฿337K revenue per station last month — up 4.6% — with 9,410 daily customers and a 39.2% repeat visit rate. PTG Lat Phrao 71 continues to lead across all metrics. PTG Bang Na Complex has the lowest occupancy (2 of 6 units) and is the main drag on portfolio growth — prioritising tenant fill there would add an estimated ฿30–40K per month to total revenue.",
  lat_phrao:
    "PTG Lat Phrao 71 is your strongest performer with ฿498K revenue last month (+5.1%) and 12,715 daily customers. A repeat visit rate of 42.3% signals a strong tenant mix and healthy dwell time. Two vacant units represent your biggest near-term upside — filling them at current rack rates would add roughly ฿60–80K per month. Consider targeting an F&B or convenience tenant to complement the existing mix.",
  sukhumvit:
    "PTG Sukhumvit 62 is fully occupied and growing steadily at +2.0% month-on-month. Average basket size dipped slightly (-0.8%), which may reflect tenant promotional activity — worth a check-in with your top revenue tenants. With 8 of 8 units filled, your main lever here is rent review at renewal rather than occupancy improvement.",
  rama9:
    "PTG Rama 9 is slightly below its recent run rate (-1.2% revenue, -0.9% customers). With only 4 of 6 units occupied, two vacant slots are suppressing income. A repeat visit rate of 36.2% — the lowest in your portfolio — suggests the current mix isn't generating strong return visits. Adding a food or beverage anchor tenant would likely lift both footfall and dwell time.",
  bang_na:
    "PTG Bang Na Complex has the most growth potential — only 2 of 6 units are occupied, leaving the station running at a third of its capacity. Revenue grew +1.6% last month but the base remains low at ฿244K. Basket size of ฿37.5 is healthy, indicating strong spend per visit. Filling 2–3 more units with high-footfall tenants is the single biggest revenue opportunity in your portfolio right now.",
  main:
    "PTG Main Station is performing consistently at ฿337K revenue (+0.9%) with 9,100 daily customers. A repeat visit rate of 40.1% is the second-highest in your portfolio. With 4 of 6 units occupied, there is room to grow — adding one more F&B or convenience tenant would likely push monthly revenue past ฿400K based on comparable stations.",
};

const STATION_AI_SUMMARY_TH: Record<StationId, string> = {
  all:
    "พอร์ตโฟลิโอของคุณมีรายได้เฉลี่ย ฿337K ต่อสาขาเดือนที่แล้ว — เพิ่มขึ้น 4.6% — โดยมีลูกค้า 9,410 รายต่อวันและอัตราการกลับมาซื้อซ้ำ 39.2% PTG Lat Phrao 71 ยังคงนำอันดับในทุกตัวชี้วัด PTG Bang Na Complex มีอัตราการใช้งานต่ำสุด (2 จาก 6 ยูนิต) และเป็นปัจจัยหลักที่ฉุดรั้งการเติบโต — การเติมผู้เช่าให้เต็มจะเพิ่มรายได้รวมประมาณ ฿30–40K ต่อเดือน",
  lat_phrao:
    "PTG Lat Phrao 71 เป็นสาขาที่มีผลงานดีที่สุดด้วยรายได้ ฿498K เดือนที่แล้ว (+5.1%) และลูกค้า 12,715 รายต่อวัน อัตราการกลับมาซื้อซ้ำ 42.3% บ่งชี้ถึงการผสมผสานผู้เช่าที่ดีและเวลาพักอยู่ที่มีคุณภาพ ยูนิตว่างสองแห่งเป็นโอกาสสร้างรายได้ที่ใกล้ที่สุด — การเติมเต็มด้วยอัตราปัจจุบันจะเพิ่มรายได้ประมาณ ฿60–80K ต่อเดือน ควรพิจารณาผู้เช่าประเภท F&B หรือร้านสะดวกซื้อเพื่อเสริมการผสมผสานที่มีอยู่",
  sukhumvit:
    "PTG Sukhumvit 62 เช่าเต็มทุกยูนิตและเติบโตอย่างต่อเนื่องที่ +2.0% ต่อเดือน มูลค่าตะกร้าเฉลี่ยลดลงเล็กน้อย (-0.8%) ซึ่งอาจสะท้อนกิจกรรมโปรโมชันของผู้เช่า — ควรติดตามกับผู้เช่าที่สร้างรายได้สูงสุด เนื่องจากยูนิตเต็ม 8 จาก 8 แล้ว กลไกหลักในการเพิ่มรายได้คือการพิจารณาค่าเช่าตอนต่อสัญญา",
  rama9:
    "PTG Rama 9 อยู่ต่ำกว่าอัตราเดิมเล็กน้อย (-1.2% รายได้, -0.9% ลูกค้า) โดยมีเพียง 4 จาก 6 ยูนิตที่ใช้งาน ยูนิตว่างสองแห่งกำลังกดดันรายได้ อัตราการกลับมาซื้อซ้ำ 36.2% — ต่ำสุดในพอร์ตโฟลิโอ — บ่งชี้ว่าการผสมผสานปัจจุบันยังไม่สร้างการกลับมาที่แข็งแกร่ง การเพิ่มผู้เช่าประเภทอาหารหรือเครื่องดื่มจะช่วยเพิ่มทั้งการเดินเท้าและเวลาพักอยู่",
  bang_na:
    "PTG Bang Na Complex มีศักยภาพการเติบโตสูงสุด — มีเพียง 2 จาก 6 ยูนิตที่ใช้งาน ทำให้สาขาดำเนินการที่หนึ่งในสามของกำลังผลิต รายได้เพิ่มขึ้น +1.6% เดือนที่แล้วแต่ฐานยังต่ำที่ ฿244K มูลค่าตะกร้า ฿37.5 ดีบ่งชี้ถึงการใช้จ่ายต่อครั้งที่แข็งแกร่ง การเติมยูนิต 2–3 แห่งด้วยผู้เช่าที่มีการเดินเท้าสูงเป็นโอกาสรายได้ที่ใหญ่ที่สุดในพอร์ตโฟลิโอขณะนี้",
  main:
    "PTG Main Station มีผลงานสม่ำเสมอที่รายได้ ฿337K (+0.9%) และลูกค้า 9,100 รายต่อวัน อัตราการกลับมาซื้อซ้ำ 40.1% สูงเป็นอันดับสองในพอร์ตโฟลิโอ ด้วย 4 จาก 6 ยูนิตที่ใช้งาน ยังมีพื้นที่ให้เติบโต — การเพิ่มผู้เช่า F&B หรือร้านสะดวกซื้ออีกหนึ่งรายน่าจะผลักดันรายได้รายเดือนเกิน ฿400K อ้างอิงจากสาขาที่ใกล้เคียงกัน",
};

// ── Station performance rows ─────────────────────────────────────────────────

const STATIONS = [
  { id: "lat_phrao", name: "PTG Lat Phrao 71",    location: "Lat Phrao, Bangkok",   revenue: "฿498K", customers: "12,715", occupied: 6, total: 8, status: "Partial" },
  { id: "sukhumvit", name: "PTG Sukhumvit 62",    location: "Khlong Toei, Bangkok", revenue: "฿318K", customers: "10,398", occupied: 8, total: 8, status: "Full"    },
  { id: "rama9",     name: "PTG Rama 9",          location: "Huai Khwang, Bangkok", revenue: "฿287K", customers: "8,326",  occupied: 4, total: 6, status: "Partial" },
  { id: "bang_na",   name: "PTG Bang Na Complex", location: "Bang Na, Bangkok",     revenue: "฿244K", customers: "6,512",  occupied: 2, total: 6, status: "Low"     },
  { id: "main",      name: "PTG Main Station",    location: "Din Daeng, Bangkok",   revenue: "฿337K", customers: "9,100",  occupied: 4, total: 6, status: "Partial" },
];

const OCCUPANCY_COLOR: Record<string, string> = {
  Full:    "text-primary",
  Partial: "text-amber-600",
  Low:     "text-red-500",
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandlordOverviewPage() {
  const { stationId } = useStationFilter();
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const kpis       = STATION_KPIS[stationId];
  const trend      = STATION_TRENDS[stationId];
  const label      = STATION_LABEL[stationId];
  const aiSummary  = lang === "th" ? STATION_AI_SUMMARY_TH[stationId] : STATION_AI_SUMMARY[stationId];
  const visibleStations = stationId === "all" ? STATIONS : STATIONS.filter((s) => s.id === stationId);

  const vals = trend.map((t) => t.station);
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
          staticText={aiSummary}
          label={T.aiSummaryLabel}
        />
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`฿${value}K`, label]}
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
