"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useStationFilter, type StationId, STATION_LIST } from "@/lib/stationFilterContext";
import { useLanguage } from "@/lib/languageContext";
import { addNotification } from "@/lib/notificationStore";
import { SHARED_APPS } from "@/lib/applicationsData";

const STRINGS = {
  en: {
    titlePlain: "Tenant ",
    titleItalic: "Applications",
    reviewingPrefix: "Reviewing",
    reviewingSuffix: "active candidate",
    reviewingSuffixPlural: "active candidates",
    reviewingFor: "for",
    experience: "EXPERIENCE",
    estRevenue: "EST. REVENUE",
    thbPerMo: "THB/mo",
    aiSuggestion: "AI SUGGESTION",
    category: "CATEGORY",
    stores: "STORES OPERATED",
    maxBudget: "MAX RENT BUDGET",
    concept: "STORE CONCEPT",
    decline: "DECLINE",
    approveTenant: "APPROVE TENANT",
    approved: "Approved",
    openChat: "Open Chat",
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
    estRevenue: "รายได้โดยประมาณ",
    thbPerMo: "บาท/เดือน",
    aiSuggestion: "คำแนะนำ AI",
    category: "ประเภทธุรกิจ",
    stores: "จำนวนสาขา",
    maxBudget: "งบค่าเช่าสูงสุด",
    concept: "แนวคิดร้าน",
    decline: "ปฏิเสธ",
    approveTenant: "อนุมัติผู้เช่า",
    approved: "อนุมัติแล้ว",
    openChat: "เปิดแชท",
    noApplications: "ไม่มีใบสมัครสำหรับสาขานี้",
  },
} as const;

const APPLICANTS = SHARED_APPS.map(app => ({
  appId:      app.landlordAppId,
  stationId:  app.stationId,
  name:       app.applicantName,
  storeName:  app.storeName,
  category:   app.category,
  experience: app.experience,
  numStores:  app.numStores,
  maxBudget:  app.maxBudget,
  concept:    app.concept,
  aiText:     app.aiText,
  panelColor: app.panelColor,
}));

type Applicant = typeof APPLICANTS[0];
type TStrings = (typeof STRINGS)["en"] | (typeof STRINGS)["th"];

const STATION_NAME: Record<StationId, string> = Object.fromEntries(
  STATION_LIST.map((s) => [s.id, s.name])
) as Record<StationId, string>;

function AppCard({ app, T, lang }: { app: Applicant; T: TStrings; lang: "en" | "th" }) {
  const router = useRouter();
  const stationName = STATION_NAME[app.stationId];

  const [approved, setApproved] = useState(() => {
    try { return !!localStorage.getItem(`ptg_landlord_app_status_${app.appId}`); } catch { return false; }
  });

  function handleApprove() {
    try { localStorage.setItem(`ptg_landlord_app_status_${app.appId}`, "approved"); } catch {}
    setApproved(true);
    addNotification({
      type: "status_update",
      userType: "retailer",
      title: "Application Approved",
      body: `Your application for ${stationName} has been approved. Schedule your site walkthrough now.`,
      href: "/retailer_backoffice/myApplicationsPage",
      timestamp: new Date().toISOString(),
    });
    addNotification({
      type: "status_update",
      userType: "landlord",
      title: "Tenant Approved",
      body: `${app.storeName} has been approved for ${stationName}. Proceed to schedule a walkthrough.`,
      href: `/landlord_backoffice/landlordBookingDiscussionPage?appId=${app.appId}`,
      timestamp: new Date().toISOString(),
    });
  }

  function handleOpenChat() {
    router.push(`/landlord_backoffice/landlordBookingDiscussionPage?appId=${app.appId}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-stretch">
        {/* Left portrait panel */}
        <div
          className="w-52 flex-shrink-0 rounded-l-2xl relative overflow-hidden"
          style={{ backgroundColor: app.panelColor }}
        >
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {app.category.toUpperCase()}
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
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-lg font-bold text-on-surface">{app.storeName}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{app.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-on-surface-variant border border-outline-variant/30 bg-surface-container-low px-2.5 py-1 rounded-full">
                {stationName}
              </span>
              <span className="text-[10px] font-bold tracking-wide text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full">
                {app.category.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Business profile grid */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.category}</div>
              <div className="text-sm font-semibold text-on-surface">{app.category}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.experience}</div>
              <div className="text-sm font-semibold text-on-surface">{app.experience}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.stores}</div>
              <div className="text-sm font-semibold text-on-surface">{app.numStores}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.maxBudget}</div>
              <div className="text-sm font-semibold text-on-surface">
                {app.maxBudget}<span className="text-[10px] text-on-surface-variant"> /mo</span>
              </div>
            </div>
          </div>

          {/* Store concept */}
          <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 mb-3">
            <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-1">{T.concept}</div>
            <p className="text-xs text-on-surface leading-relaxed italic">&ldquo;{app.concept}&rdquo;</p>
          </div>

          {/* AI Suggestion */}
          <div className="bg-[#1C3A1C] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-[14px] text-lime-300" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-[9px] font-bold tracking-widest text-lime-300">{T.aiSuggestion}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{app.aiText}</p>
          </div>

          <div className="flex items-center justify-end gap-3">
            {approved ? (
              <>
                <span className="flex items-center gap-1.5 text-primary text-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {T.approved}
                </span>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="flex items-center gap-1.5 bg-[#1C3A1C] text-white text-sm font-bold rounded-full px-5 py-2.5 border-0 cursor-pointer hover:brightness-105"
                >
                  <span className="material-symbols-outlined text-[15px]">chat</span>
                  {T.openChat}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="text-sm font-bold tracking-wide text-on-surface-variant bg-transparent border-0 cursor-pointer hover:text-error transition-colors px-4"
                >
                  {T.decline}
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="bg-primary text-white text-sm font-bold rounded-full px-6 py-2.5 border-0 cursor-pointer hover:brightness-105"
                >
                  {T.approveTenant}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
            <AppCard key={app.appId} app={app} T={T} lang={lang} />
          ))}
        </div>
      )}
    </LandlordBackofficeLayout>
  );
}
