import { Station } from "@/lib/stations";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

export default function TrafficTrendChart({ station }: { station: Station }) {
  const d = station.detail;
  const heights = d.chart_heights_pct;
  const peakLabel = d.chart_peak_label;
  const peakIdx = heights.indexOf(Math.max(...heights));

  return (
    <div className="lg:col-span-2 h-full min-h-0 flex flex-col bg-surface-container-lowest p-8 rounded-xl editorial-shadow">
      <div className="flex justify-between items-center mb-8">
        <h4 className="font-headline text-2xl text-on-surface">Traffic Trend</h4>
        <span className="text-xs font-bold text-on-surface-variant">Jan - Jun 2024</span>
      </div>
      <div className="h-64 flex items-end justify-between gap-4 px-2">
        {heights.map((h, i) => (
          <div key={i} className="w-full flex flex-col justify-end h-full min-h-0">
            {i === peakIdx ? (
              <div
                className="w-full bg-primary rounded-t-sm relative cursor-pointer"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap">
                  {peakLabel}
                </div>
              </div>
            ) : (
              <div
                className="w-full bg-surface-container rounded-t-sm hover:bg-primary/20 transition-all cursor-pointer"
                style={{ height: `${h}%` }}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 px-2">
        {MONTHS.map((m) => (
          <span key={m} className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
