"use client";

import { useEffect, useState } from "react";

type Fit = { category: string; categoryTh: string; fitScore: number; reason: string; reasonTh: string };
type Station = { filterKey: string; displayId: string; name: string; trafficLevel: string; dailyCustomers: number | null; basketThb: number | null; recommended: Fit[]; explanation?: string };
type Resp = { selectedKey: string; selected: Station | null; all: Station[] };

const SCORE_CLS = (s: number) =>
  s >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
  : s >= 72 ? "bg-amber-50 text-amber-700 border-amber-200"
  : "bg-blue-50 text-blue-700 border-blue-200";

export default function StationFitPanel({ stationId, lang }: { stationId: string; lang: "en" | "th" }) {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/landlord/station-fit?stationId=${encodeURIComponent(stationId)}&lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Resp | null) => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) { setData(null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [stationId, lang]);

  const T = lang === "th"
    ? { title: "ประเภทร้านที่เหมาะกับสถานี (AI)", sub: "AI แนะนำประเภทร้านที่เหมาะกับแต่ละสถานีจากทราฟฟิกและยอดใช้จ่าย", best: "เหมาะสุด", loading: "กำลังวิเคราะห์ความเหมาะสม..." }
    : { title: "Best-Fit Store Types by Station (AI)", sub: "AI recommends which store types suit each station from its traffic and spend", best: "Top fit", loading: "Analyzing station fit..." };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
        <span className="text-xs text-on-surface-variant ml-2">{T.loading}</span>
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        <h3 className="font-semibold text-on-surface">{T.title}</h3>
      </div>
      <p className="text-xs text-on-surface-variant mb-4">{T.sub}</p>

      {data.selected ? (
        // Single station — ranked store types as full-width rows
        <div className="space-y-2.5">
          {data.selected.recommended.map((f, i) => (
            <div key={f.category} className={`flex items-center gap-4 rounded-xl border p-4 ${SCORE_CLS(f.fitScore)}`}>
              <div className="flex flex-col items-center justify-center w-14 flex-shrink-0">
                <span className="text-2xl font-bold leading-none">{f.fitScore}%</span>
                <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5 opacity-70">{lang === "th" ? "เหมาะ" : "fit"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {i === 0 && <span className="material-symbols-outlined text-[15px]">star</span>}
                  <span className="text-sm font-bold">{lang === "th" ? f.categoryTh : f.category}</span>
                  {i === 0 && <span className="text-[9px] font-bold uppercase tracking-widest border border-current rounded-full px-1.5 py-0.5 opacity-80">{T.best}</span>}
                </div>
                <div className="text-xs opacity-80 mt-1 leading-relaxed">{lang === "th" ? f.reasonTh : f.reason}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // All stations — each with its top-fit type
        <div className="grid grid-cols-2 gap-2">
          {data.all.map((s) => (
            <div key={s.displayId} className="flex items-center justify-between rounded-xl border border-outline-variant/15 px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-medium text-on-surface truncate">{s.name}</div>
                <div className="text-[10px] text-on-surface-variant">{s.trafficLevel} traffic · ฿{s.basketThb ?? "?"}</div>
              </div>
              <div className={`ml-2 flex-shrink-0 rounded-full border px-2.5 py-1 ${SCORE_CLS(s.recommended[0]?.fitScore ?? 0)}`}>
                <span className="text-[11px] font-bold">{lang === "th" ? s.recommended[0]?.categoryTh : s.recommended[0]?.category}</span>
                <span className="text-[10px] font-bold ml-1">{s.recommended[0]?.fitScore}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
