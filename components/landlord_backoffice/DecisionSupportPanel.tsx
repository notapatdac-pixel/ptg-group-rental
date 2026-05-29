"use client";

import { useEffect, useState } from "react";

// Renders the three-paradigm leasing decision for one application:
//   PREDICTIVE (match score) → SYMBOLIC (rule checks + recommendation) → GENERATIVE (explanation)
// Kept visually as three distinct blocks so the separation is legible in a demo.

type Check = { rule: string; status: "pass" | "warn" | "fail"; message: string; messageTh: string };
type EvalResponse = {
  predictive: { matchScore: number | null; available: boolean };
  symbolic: { decision: "approve_recommended" | "review_required" | "decline_recommended"; checks: Check[]; rentBand: { floor: number; ceiling: number } | null };
  generative: { explanation: string };
  error?: string;
};

const DECISION_UI = {
  approve_recommended: { en: "Approve — recommended", th: "แนะนำให้อนุมัติ", cls: "bg-green-100 text-green-700 border-green-200", icon: "check_circle" },
  review_required:     { en: "Review required",       th: "ควรพิจารณาเพิ่มเติม", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: "troubleshoot" },
  decline_recommended: { en: "Decline — recommended", th: "แนะนำให้ปฏิเสธ", cls: "bg-red-100 text-red-700 border-red-200", icon: "cancel" },
} as const;

const STATUS_DOT = { pass: "bg-green-500", warn: "bg-amber-500", fail: "bg-red-500" } as const;

export default function DecisionSupportPanel({ appId, lang }: { appId: string; lang: "en" | "th" }) {
  const [data, setData] = useState<EvalResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/landlord/evaluate-application?id=${encodeURIComponent(appId)}&lang=${lang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: EvalResponse | null) => { if (!cancelled) { setData(d && !d.error ? d : null); setLoading(false); } })
      .catch(() => { if (!cancelled) { setData(null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [appId, lang]);

  const T = lang === "th"
    ? { title: "ระบบช่วยตัดสินใจ (AI 3 ชั้น)", predictive: "1 · AI ทำนาย — คะแนนจับคู่", symbolic: "2 · AI กฎเกณฑ์ — ตรวจเงื่อนไข", generative: "3 · AI สรุป — คำอธิบาย", score: "คะแนนจับคู่", noScore: "ไม่มีคะแนน (ส่งพิจารณาเอง)", advisory: "เป็นเพียงคำแนะนำ — เจ้าของพื้นที่ตัดสินใจขั้นสุดท้าย", loading: "กำลังประเมิน..." }
    : { title: "AI Decision Support (3 layers)", predictive: "1 · Predictive AI — match score", symbolic: "2 · Symbolic AI — rule checks", generative: "3 · Generative AI — explanation", score: "Match score", noScore: "No score (routed to manual review)", advisory: "Advisory only — the landlord makes the final call", loading: "Evaluating..." };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-1.5 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
          <span className="text-xs text-on-surface-variant ml-2">{T.loading}</span>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const dec = DECISION_UI[data.symbolic.decision];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
          <h3 className="font-semibold text-on-surface">{T.title}</h3>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${dec.cls}`}>
          <span className="material-symbols-outlined text-[15px]">{dec.icon}</span>
          {lang === "th" ? dec.th : dec.en}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* 1 — Predictive */}
        <div className="rounded-xl border border-outline-variant/15 p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1.5">{T.predictive}</div>
          {data.predictive.available ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-on-surface">{data.predictive.matchScore}</span>
              <span className="text-xs text-on-surface-variant">/ 100 · {T.score}</span>
            </div>
          ) : (
            <div className="text-xs text-amber-600">{T.noScore}</div>
          )}
        </div>

        {/* 2 — Symbolic */}
        <div className="rounded-xl border border-outline-variant/15 p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">{T.symbolic}</div>
          <ul className="space-y-1.5">
            {data.symbolic.checks.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${STATUS_DOT[c.status]}`} />
                <span className="text-on-surface-variant"><span className="font-semibold text-on-surface">{c.rule}:</span> {lang === "th" ? c.messageTh : c.message}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3 — Generative */}
        <div className="rounded-xl border border-outline-variant/15 p-3 bg-[#D9EDD9]/40">
          <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">{T.generative}</div>
          <p className="text-xs text-on-surface-variant leading-relaxed">{data.generative.explanation}</p>
        </div>
      </div>

      <p className="text-[10px] text-on-surface-variant/70 mt-3 italic">{T.advisory}</p>
    </div>
  );
}
