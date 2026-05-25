import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useStationFilter, type StationId, STATION_LIST } from "@/lib/stationFilterContext";
import { useLanguage } from "@/lib/languageContext";

const STRINGS = {
  en: {
    titlePlain: "Tenant ",
    titleItalic: "Applications",
    reviewingPrefix: "Reviewing",
    reviewingSuffix: "active candidate",
    reviewingSuffixPlural: "active candidates",
    reviewingFor: "for",
    experience: "EXPERIENCE",
    aiMatchScore: "AI MATCH SCORE",
    estRevenue: "EST. REVENUE",
    thbPerMo: "THB/mo",
    aiRecommendation: "AI RECOMMENDATION",
    decline: "DECLINE",
    approveTenant: "APPROVE TENANT",
    noApplications: "No applications for this station.",
  },
  th: {
    titlePlain: "ใบสมัคร",
    titleItalic: "ผู้เช่า",
    reviewingPrefix: "กำลังพิจารณา",
    reviewingSuffix: "ใบสมัคร",
    reviewingSuffixPlural: "ใบสมัคร",
    reviewingFor: "สำหรับ",
    experience: "ประสบการณ์",
    aiMatchScore: "คะแนนความเหมาะสม AI",
    estRevenue: "รายได้โดยประมาณ",
    thbPerMo: "บาท/เดือน",
    aiRecommendation: "คำแนะนำ AI",
    decline: "ปฏิเสธ",
    approveTenant: "อนุมัติผู้เช่า",
    noApplications: "ไม่มีใบสมัครสำหรับสาขานี้",
  },
} as const;

const APPLICANTS = [
  {
    stationId: "sukhumvit" as StationId,
    name: "Wanida Suthep",
    storeName: "The Artisan Brew",
    category: "ARTISAN CAFE",
    experience: "12 Years",
    aiScore: "89%",
    aiScoreColor: "text-primary",
    aiText: "High potential for morning commuter synergy. Proximity to EV chargers aligns with customer dwell times of 20-30 minutes.",
    revenue: "14,200",
    panelColor: "#4a5568",
  },
  {
    stationId: "lat_phrao" as StationId,
    name: "Tanaka Foods Co.",
    storeName: "Tanaka Premium Market",
    category: "PREMIUM RETAIL",
    experience: "25 Years",
    aiScore: "94%",
    aiScoreColor: "text-secondary",
    aiText: "Enterprise-grade tenant with stable long-term outlook. Ideal for high-density residential surroundings.",
    revenue: "32,800",
    panelColor: "#744210",
  },
  {
    stationId: "rama9" as StationId,
    name: "PharmaCare Ltd.",
    storeName: "PharmaPlus Express",
    category: "PHARMACY",
    experience: "8 Years",
    aiScore: "76%",
    aiScoreColor: "text-on-surface-variant",
    aiText: "Service-oriented anchor. May require specialized ventilation and security infrastructure upgrades.",
    revenue: "21,500",
    panelColor: "#1a4a5e",
  },
];

const STATION_NAME: Record<StationId, string> = Object.fromEntries(
  STATION_LIST.map((s) => [s.id, s.name])
) as Record<StationId, string>;

export default function LandlordApplicationsPage() {
  const { stationId } = useStationFilter();
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const visible = stationId === "all" ? APPLICANTS : APPLICANTS.filter((a) => a.stationId === stationId);

  const stationLabel = stationId === "all" ? (lang === "th" ? "ทุกสาขา" : "all stations") : STATION_NAME[stationId];

  return (
    <LandlordBackofficeLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-baseline gap-0">
            {lang === "th" ? (
              <>
                <h1 className="text-3xl font-bold text-on-surface">ใบสมัคร&nbsp;</h1>
                <h1 className="text-3xl font-bold italic text-primary">ผู้เช่า</h1>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-on-surface">Tenant&nbsp;</h1>
                <h1 className="text-3xl font-bold italic text-primary">Applications</h1>
              </>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {lang === "th"
              ? `${T.reviewingPrefix} ${visible.length} ${T.reviewingSuffix} ${T.reviewingFor} ${stationLabel}`
              : `${T.reviewingPrefix} ${visible.length} ${visible.length !== 1 ? T.reviewingSuffixPlural : T.reviewingSuffix} ${T.reviewingFor} ${stationLabel}`
            }
          </p>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-on-surface-variant shadow-sm">
          {T.noApplications}
        </div>
      ) : (
        <div className="space-y-5">
          {visible.map((app) => (
            <div key={app.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-stretch">
                {/* Left portrait panel */}
                <div
                  className="w-52 flex-shrink-0 rounded-l-2xl relative overflow-hidden"
                  style={{ backgroundColor: app.panelColor }}
                >
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      {app.category}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-4 z-10 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="text-base font-bold text-white leading-tight">{app.storeName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[13px] text-white/70">person</span>
                      <span className="text-xs text-white/80">{app.name}</span>
                    </div>
                  </div>
                </div>

                {/* Right details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="text-lg font-bold text-on-surface">{app.storeName}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{app.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-on-surface-variant border border-outline-variant/30 bg-surface-container-low px-2.5 py-1 rounded-full">
                        {STATION_NAME[app.stationId]}
                      </span>
                      <span className="text-[10px] font-bold tracking-wide text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full">
                        {app.category}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.experience}</div>
                      <div className="text-base font-bold text-on-surface">{app.experience}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.aiMatchScore}</div>
                      <div className={`flex items-center gap-1 text-base font-bold ${app.aiScoreColor}`}>
                        {app.aiScore}
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.estRevenue}</div>
                      <div className="text-base font-bold text-on-surface">{app.revenue}</div>
                      <div className="text-[10px] text-on-surface-variant">{T.thbPerMo}</div>
                    </div>
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      <span className="text-[9px] font-bold tracking-widest text-primary">{T.aiRecommendation}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{app.aiText}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button type="button" className="text-sm font-bold tracking-wide text-on-surface-variant bg-transparent border-0 cursor-pointer hover:text-error transition-colors px-4">
                      {T.decline}
                    </button>
                    <button type="button" className="bg-primary text-white text-sm font-bold rounded-full px-6 py-2.5 border-0 cursor-pointer hover:brightness-105">
                      {T.approveTenant}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </LandlordBackofficeLayout>
  );
}
