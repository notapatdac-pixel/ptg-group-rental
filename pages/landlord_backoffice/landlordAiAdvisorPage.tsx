import { useEffect, useState } from "react";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useLanguage } from "@/lib/languageContext";

type Recommendation = { icon: string; title: string; body: string; link: string };
type AdvisorData = {
  portfolioScore: number;
  revenueGrowthMoM: string;
  portfolioQuote: string;
  recommendations: Recommendation[];
  outlook: string;
  healthScores: {
    occupancyRate: number;
    avgTenantAiScore: number;
    paymentTimeliness: number;
    leaseRenewalRate: number;
  };
  generatedAt: string;
};

const STRINGS = {
  en: {
    title: "AI Landlord Advisor",
    livePortfolio: "LIVE PORTFOLIO INTELLIGENCE",
    portfolioScore: "PORTFOLIO SCORE",
    revenueGrowth: "RENTAL INCOME",
    strategicRecs: "Strategic Recommendations",
    askYourAdvisor: "Ask your AI Property Advisor",
    askYourAdvisorSub: "Use the chat button in the bottom-right corner to ask anything about your portfolio, stations, or tenant pipeline.",
    marketOutlook: "Quarterly Market Outlook",
    viewForecast: "View Full Forecast →",
    portfolioHealth: "Portfolio Health",
    healthLabels: {
      occupancyRate: "Occupancy Rate",
      avgTenantAiScore: "Avg Tenant AI Score",
      paymentTimeliness: "Payment Timeliness",
      leaseRenewalRate: "Lease Renewal Rate",
    } as Record<string, string>,
    loadingTitle: "Loading portfolio intelligence...",
    loadingBody: "Pulling stations, leases, and metrics from the database — the AI is preparing fresh recommendations.",
    errorTitle: "Could not generate advisor output",
    errorBody: "There was a problem reaching the AI service. Please refresh the page or try again later.",
    refresh: "Refresh",
  },
  th: {
    title: "ที่ปรึกษา AI สำหรับเจ้าของที่ดิน",
    livePortfolio: "ข้อมูลเชิงลึกแบบเรียลไทม์",
    portfolioScore: "คะแนนพอร์ตโฟลิโอ",
    revenueGrowth: "รายได้ค่าเช่า",
    strategicRecs: "คำแนะนำเชิงกลยุทธ์",
    askYourAdvisor: "ถามที่ปรึกษา AI ของคุณ",
    askYourAdvisorSub: "ใช้ปุ่มแชทที่มุมขวาล่างเพื่อถามคำถามเกี่ยวกับพอร์ตโฟลิโอ สถานี หรือผู้สมัครเช่าได้ทุกเรื่อง",
    marketOutlook: "แนวโน้มตลาดรายไตรมาส",
    viewForecast: "ดูพยากรณ์ทั้งหมด →",
    portfolioHealth: "สุขภาพพอร์ตโฟลิโอ",
    healthLabels: {
      occupancyRate: "อัตราการเช่า",
      avgTenantAiScore: "AI Score เฉลี่ยของผู้เช่า",
      paymentTimeliness: "การชำระเงินตรงเวลา",
      leaseRenewalRate: "อัตราการต่อสัญญา",
    } as Record<string, string>,
    loadingTitle: "กำลังโหลดข้อมูลเชิงลึก...",
    loadingBody: "กำลังดึงสถานี สัญญาเช่า และตัวชี้วัดจากฐานข้อมูล — AI กำลังเตรียมคำแนะนำใหม่",
    errorTitle: "สร้างคำแนะนำไม่สำเร็จ",
    errorBody: "พบปัญหาในการเชื่อมต่อ AI โปรดรีเฟรชหน้าหรือลองใหม่ภายหลัง",
    refresh: "รีเฟรช",
  },
} as const;

function HealthBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "bg-primary" : score >= 60 ? "bg-lime-400" : "bg-amber-500";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-bold text-on-surface">{score}%</span>
      </div>
      <div className="h-2 bg-outline-variant/20 rounded-full">
        <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function LandlordAiAdvisorPage() {
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const [data,    setData]    = useState<AdvisorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [reload,  setReload]  = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);

    fetch("/api/landlord/advisor")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: AdvisorData | null) => {
        if (cancelled) return;
        if (!d || !d.recommendations) {
          setError(true);
        } else {
          setData(d);
        }
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [reload]);

  return (
    <LandlordBackofficeLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-on-surface">{T.title}</h1>
        <button
          type="button"
          onClick={() => setReload((n) => n + 1)}
          disabled={loading}
          className="text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-full hover:bg-primary/15 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          {T.refresh}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="col-span-2 space-y-6">
          {/* Live Portfolio Intelligence */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface border border-on-surface/20 rounded-full px-3 py-1 mb-4 inline-block">
              {T.livePortfolio}
            </span>
            {loading ? (
              <div className="mt-4 space-y-2">
                <div className="h-6 w-3/4 bg-outline-variant/20 rounded animate-pulse" />
                <div className="h-6 w-1/2 bg-outline-variant/20 rounded animate-pulse" />
              </div>
            ) : error ? (
              <p className="text-2xl font-bold italic text-on-surface mt-4 mb-4 leading-snug text-amber-700">
                &ldquo;{T.errorTitle}&rdquo;
              </p>
            ) : (
              <p className="text-2xl font-bold italic text-on-surface mt-4 mb-4 leading-snug">
                &ldquo;{data?.portfolioQuote}&rdquo;
              </p>
            )}
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span>{T.portfolioScore}</span>
                <span className="text-base font-extrabold ml-1">
                  {loading ? "—" : data?.portfolioScore ?? "—"}
                </span>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>{T.revenueGrowth} {loading ? "—" : data?.revenueGrowthMoM ?? "—"} MoM</span>
              </div>
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">{T.strategicRecs}</h3>
            {loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-[#D9EDD9] rounded-xl p-4 h-40 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-on-surface-variant">{T.errorBody}</p>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {data?.recommendations.map((r, i) => (
                  <div key={`${r.title}-${i}`} className="bg-[#D9EDD9] rounded-xl p-4 flex flex-col shadow-sm">
                    <span className="material-symbols-outlined text-primary text-xl mb-2">{r.icon}</span>
                    <h4 className="text-sm font-semibold text-on-surface mb-2">{r.title}</h4>
                    <p className="text-xs text-on-surface-variant flex-1 leading-relaxed">{r.body}</p>
                    <span className="text-xs text-primary font-semibold mt-3 text-left">{r.link}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chatbot hint */}
          <div className="bg-[#D9EDD9] rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            </div>
            <div>
              <div className="text-sm font-bold text-on-surface mb-0.5">{T.askYourAdvisor}</div>
              <div className="text-xs text-on-surface-variant">{T.askYourAdvisorSub}</div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Quarterly Market Outlook */}
          <div className="bg-[#1C3A1C] rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-3">{T.marketOutlook}</h3>
            {loading ? (
              <div className="space-y-2 mb-6">
                <div className="h-4 w-full bg-white/15 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-white/15 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-white/15 rounded animate-pulse" />
              </div>
            ) : (
              <p className="text-sm text-white/80 mb-6 leading-relaxed">{data?.outlook ?? T.errorBody}</p>
            )}
            <button type="button" className="w-full bg-lime-400 text-[#1C3A1C] text-xs font-bold py-2.5 rounded-full cursor-pointer border-0 hover:brightness-105">
              {T.viewForecast}
            </button>
          </div>

          {/* Portfolio Health (deterministic from DB — always available) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">{T.portfolioHealth}</h3>
            <div className="space-y-3">
              {data && !loading ? (
                <>
                  <HealthBar label={T.healthLabels.occupancyRate}     score={data.healthScores.occupancyRate} />
                  <HealthBar label={T.healthLabels.avgTenantAiScore}  score={data.healthScores.avgTenantAiScore} />
                  <HealthBar label={T.healthLabels.paymentTimeliness} score={data.healthScores.paymentTimeliness} />
                  <HealthBar label={T.healthLabels.leaseRenewalRate}  score={data.healthScores.leaseRenewalRate} />
                </>
              ) : (
                <>
                  {["occupancyRate", "avgTenantAiScore", "paymentTimeliness", "leaseRenewalRate"].map((k) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-on-surface-variant">{T.healthLabels[k]}</span>
                        <span className="font-bold text-on-surface">—</span>
                      </div>
                      <div className="h-2 bg-outline-variant/20 rounded-full animate-pulse" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
