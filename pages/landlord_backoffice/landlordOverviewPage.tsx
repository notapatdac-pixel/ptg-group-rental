import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const KPI_METRICS = [
  { label: "MONTHLY REVENUE (THB)", station: "฿205K", peer: "฿205K", note: "On par with peer avg" },
  { label: "DAILY CUSTOMERS",       station: "673",    peer: "671",    note: "On par with peer avg" },
  { label: "AVG BASKET SIZE (THB)", station: "฿10.2",  peer: "฿10.2",  note: "On par with peer avg" },
  { label: "REPEAT VISIT RATE (%)", station: "40.1%",  peer: "39.9%",  note: "On par with peer avg" },
];

const STATIONS = [
  { name: "PTG Lat Phrao 71",    location: "Lat Phrao, Bangkok",   revenue: "฿498K", customers: "12,715", occupied: 6, total: 8,  status: "Partial" },
  { name: "PTG Sukhumvit 62",    location: "Khlong Toei, Bangkok", revenue: "฿318K", customers: "10,398", occupied: 8, total: 8,  status: "Full"    },
  { name: "PTG Rama 9",          location: "Huai Khwang, Bangkok", revenue: "฿287K", customers: "8,326",  occupied: 4, total: 6,  status: "Partial" },
  { name: "PTG Bang Na Complex", location: "Bang Na, Bangkok",     revenue: "฿244K", customers: "6,512",  occupied: 2, total: 6,  status: "Low"     },
  { name: "PTG Main Station",    location: "Din Daeng, Bangkok",   revenue: "฿337K", customers: "9,100",  occupied: 4, total: 6,  status: "Partial" },
];

const OCCUPANCY_STYLE: Record<string, string> = {
  Full:    "bg-[#1C3A1C] text-lime-300",
  Partial: "bg-amber-100 text-amber-700",
  Low:     "bg-red-100 text-red-600",
};

const REVENUE_TREND = [
  { month: "Jun 24", station: 214, peer: 213 },
  { month: "Jul 24", station: 209, peer: 207 },
  { month: "Aug 24", station: 200, peer: 201 },
  { month: "Sep 24", station: 201, peer: 202 },
  { month: "Oct 24", station: 197, peer: 199 },
  { month: "Nov 24", station: 211, peer: 211 },
];

export default function LandlordOverviewPage() {
  return (
    <LandlordBackofficeLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">Executive Overview</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Welcome back, your retail ecosystem is performing{" "}
            <span className="font-bold text-primary">12% above benchmark</span> this month.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white cursor-pointer">
            Last 30 Days
          </button>
          <button type="button" className="border border-outline-variant text-on-surface text-xs font-medium px-4 py-2 rounded-full bg-white cursor-pointer flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">download</span>Export
          </button>
        </div>
      </div>

      {/* KPIs — 2×2 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {KPI_METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">{m.label}</div>
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-3xl font-bold text-on-surface">{m.station}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">This station</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-on-surface-variant">{m.peer}</div>
                <div className="text-[11px] text-on-surface-variant">Peer avg</div>
              </div>
            </div>
            <div className="h-1.5 bg-outline-variant/20 rounded-full mb-2">
              <div className="h-1.5 bg-primary rounded-full w-full" />
            </div>
            <div className="text-[11px] text-on-surface-variant">{m.note}</div>
          </div>
        ))}
      </div>

      {/* Line chart — station vs peer avg */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface">Monthly revenue — station vs peer average</h3>
        <p className="text-xs text-on-surface-variant mb-4">6-month trend · THB</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={REVENUE_TREND} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[196, 214]}
              ticks={[196, 198, 200, 202, 204, 206, 208, 210, 212, 214]}
              tickFormatter={(v: number) => `฿${v}K`}
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `฿${value}K`,
                name === "station" ? "PTG Lat Phrao 71" : "Platinum Hub peer avg",
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            />
            <Legend
              formatter={(value: string) =>
                value === "station" ? "PTG Lat Phrao 71" : "Platinum Hub peer avg"
              }
              wrapperStyle={{ fontSize: 12, color: "#6b7280" }}
            />
            <Line
              type="monotone"
              dataKey="peer"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 4, fill: "white", stroke: "#9ca3af", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="station"
              stroke="#6ab04c"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#6ab04c" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Station Performance */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-3 border-b border-outline-variant/20">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Station Performance</div>
          <div
            className="grid text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
          >
            <span>Station</span>
            <span className="text-right">Revenue / Mo</span>
            <span className="text-right">Customers</span>
            <span className="text-right">Occupancy</span>
          </div>
        </div>
        {STATIONS.map((s) => (
          <div
            key={s.name}
            className="grid items-center px-6 py-5 border-b border-outline-variant/10 last:border-0 hover:bg-[#F5F2EB]/50 transition-colors"
            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
          >
            <div>
              <div className="text-sm font-bold text-on-surface">{s.name}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{s.location}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-on-surface">{s.revenue}</div>
              <div className="text-[10px] text-on-surface-variant">/ month</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-on-surface">{s.customers}</div>
              <div className="text-[10px] text-on-surface-variant">avg / day</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-on-surface mb-1.5">
                {s.occupied} / {s.total} units
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${OCCUPANCY_STYLE[s.status]}`}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </LandlordBackofficeLayout>
  );
}
