"use client";

import { Station } from "@/lib/stations";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";

export type TrafficPoint = { month: string; customers: number };

export default function TrafficTrendChart({
  station, data, year,
}: {
  station: Station;
  data?: TrafficPoint[];
  year?: string;
}) {
  const points = data ?? [];
  const hasData = points.length > 0;
  const peakIdx = hasData
    ? points.reduce((best, p, i, arr) => (p.customers > arr[best].customers ? i : best), 0)
    : -1;
  const rangeLabel = hasData
    ? `${points[0].month} – ${points[points.length - 1].month} ${year ?? new Date().getFullYear()}`
    : `${year ?? new Date().getFullYear()}`;

  return (
    <div className="lg:col-span-2 h-full min-h-0 flex flex-col bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-headline text-2xl text-on-surface">Traffic Trend</h4>
        <span className="text-xs font-bold text-on-surface-variant">{rangeLabel}</span>
      </div>
      <p className="text-xs text-on-surface-variant mb-6">Average daily customers per month</p>

      {hasData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e0d8" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fontWeight: 700, fill: "#8a8577" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#8a8577" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}k`}
              />
              <Tooltip
                cursor={{ fill: "rgba(70,104,0,0.06)" }}
                formatter={(v) => [Number(v).toLocaleString(), "Daily customers"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e3e0d8", fontSize: 12 }}
              />
              <Bar dataKey="customers" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {points.map((_, i) => (
                  <Cell key={i} fill={i === peakIdx ? "#1C3A1C" : "#B8D98A"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-sm text-on-surface-variant">
          Loading traffic data…
        </div>
      )}
    </div>
  );
}
