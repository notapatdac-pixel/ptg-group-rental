"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useStationFilter, type StationId, STATION_LIST } from "@/lib/stationFilterContext";
import { useLanguage } from "@/lib/languageContext";
import { addNotification } from "@/lib/notificationStore";
import type { SharedApp, AppBadge } from "@/lib/applicationsData";
import { getStoreImages } from "@/lib/storeImages";
import { supabase } from "@/lib/supabaseClient";

type TabId = "all" | "pending" | "approved" | "booking_confirmed";
type LandlordStatus = "pending" | "approved" | "declined";

const STRINGS = {
  en: {
    titlePlain: "Tenant ",
    titleItalic: "Applications",
    tabAll: "All",
    tabPending: "Pending Review",
    tabApproved: "Approved",
    tabConfirmed: "Booking Confirmed",
    aiSummary: "AI BUSINESS SUMMARY",
    category: "CATEGORY",
    stores: "LOCATIONS",
    experience: "EXPERIENCE",
    budget: "MAX BUDGET",
    aiScore: "AI SCORE",
    estRevenue: "EST. REVENUE",
    thbMo: "THB/mo",
    decline: "Decline",
    approveTenant: "Approve Tenant",
    approved: "Approved",
    openChat: "Open Chat",
    viewBooking: "View Booking",
    noApplications: "No applications in this status.",
    bookingConfirmedLabel: "Booking Confirmed",
  },
  th: {
    titlePlain: "ใบสมัคร",
    titleItalic: "ผู้เช่า",
    tabAll: "ทั้งหมด",
    tabPending: "รอการพิจารณา",
    tabApproved: "อนุมัติแล้ว",
    tabConfirmed: "ยืนยันการจอง",
    aiSummary: "สรุปธุรกิจโดย AI",
    category: "ประเภทธุรกิจ",
    stores: "จำนวนสาขา",
    experience: "ประสบการณ์",
    budget: "งบค่าเช่าสูงสุด",
    aiScore: "คะแนน AI",
    estRevenue: "รายได้โดยประมาณ",
    thbMo: "บาท/เดือน",
    decline: "ปฏิเสธ",
    approveTenant: "อนุมัติผู้เช่า",
    approved: "อนุมัติแล้ว",
    openChat: "เปิดแชท",
    viewBooking: "ดูการจอง",
    noApplications: "ไม่มีใบสมัครในสถานะนี้",
    bookingConfirmedLabel: "ยืนยันการจองแล้ว",
  },
} as const;

type TStrings = (typeof STRINGS)["en"] | (typeof STRINGS)["th"];

const STATION_NAME: Record<StationId, string> = Object.fromEntries(
  STATION_LIST.map((s) => [s.id, s.name])
) as Record<StationId, string>;

type DbApp = {
  retailer_display_id: string;
  landlord_display_id: string;
  status: string;
  ai_score: string;
  ai_text: string;
  ai_text_th: string;
  est_revenue_thb: string;
  panel_color: string;
  applied_date: string;
  specialist_name: string;
  specialist_initials: string;
  retailer_profiles?: {
    business_name: string;
    category: string;
    experience: string;
    num_stores: string;
    max_budget: string;
    concept: string;
    users?: { name: string } | null;
  } | null;
  station_units?: {
    unit_code: string;
    unit_label: string;
    price_thb: number;
    lease_type: string;
    stations?: { filter_key: string; name: string; location_text: string } | null;
  } | null;
};

const STATUS_TO_BADGE: Record<string, AppBadge> = {
  approved: "APPROVED",
  not_approved: "NOT APPROVED",
  pending_review: "PENDING REVIEW",
};

function dbToSharedApp(row: DbApp): SharedApp {
  const badge: AppBadge = STATUS_TO_BADGE[row.status] ?? "PENDING REVIEW";
  return {
    retailerAppId: row.retailer_display_id,
    landlordAppId: row.landlord_display_id,
    stationId: (row.station_units?.stations?.filter_key ?? "all") as StationId,
    stationName: row.station_units?.stations?.name ?? "",
    unitCode: row.station_units?.unit_code ?? "",
    unitLabel: row.station_units?.unit_label ?? "",
    location: row.station_units?.stations?.location_text ?? "",
    price: row.station_units?.price_thb ?? 0,
    leaseType: row.station_units?.lease_type ?? "",
    duration: "—",
    appliedDate: row.applied_date
      ? new Date(row.applied_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    retailerBadge: badge,
    storeName: row.retailer_profiles?.business_name ?? "",
    applicantName: row.retailer_profiles?.users?.name ?? row.retailer_profiles?.business_name ?? "",
    category: row.retailer_profiles?.category ?? "",
    experience: row.retailer_profiles?.experience ?? "",
    numStores: row.retailer_profiles?.num_stores ?? "",
    maxBudget: row.retailer_profiles?.max_budget ?? "",
    concept: row.retailer_profiles?.concept ?? "",
    panelColor: row.panel_color || "#4a5568",
    aiText: row.ai_text,
    aiTextTh: row.ai_text_th,
    aiScore: row.ai_score,
    estRevenue: row.est_revenue_thb,
    specialistName: row.specialist_name,
    specialistInitials: row.specialist_initials,
  };
}

function getInitialStatus(app: SharedApp): LandlordStatus {
  if (app.retailerBadge === "APPROVED")     return "approved";
  if (app.retailerBadge === "NOT APPROVED") return "declined";
  return "pending";
}

function loadBookingConfirmations(appList: SharedApp[]): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  if (typeof window === "undefined") return result;
  appList.forEach(app => {
    try {
      const raw = localStorage.getItem(`ptg_booking_confirmed_${app.retailerAppId}`);
      if (raw) result[app.landlordAppId] = true;
    } catch {}
  });
  return result;
}

// ── AppCard ───────────────────────────────────────────────────────────────────

function AppCard({
  app, T, lang, status, bookingConfirmed, onApprove, onDecline,
}: {
  app: SharedApp;
  T: TStrings;
  lang: "en" | "th";
  status: LandlordStatus;
  bookingConfirmed: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const router = useRouter();
  const storeImages = getStoreImages(app.storeName);
  const aiText = lang === "th" ? app.aiTextTh : app.aiText;

  function handleCardClick() {
    router.push(`/landlord_backoffice/tenantDetailPage?appId=${app.landlordAppId}`);
  }

  function handleApprove(e: React.MouseEvent) {
    e.stopPropagation();
    onApprove();
  }

  function handleDecline(e: React.MouseEvent) {
    e.stopPropagation();
    onDecline();
  }

  function handleOpenChat(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/landlord_backoffice/landlordBookingDiscussionPage?appId=${app.landlordAppId}`);
  }

  function handleViewBooking(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/landlord_backoffice/landlordUpcomingBookingPage?appId=${app.landlordAppId}`);
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex items-stretch">

        {/* Left portrait panel */}
        <div
          className="w-52 flex-shrink-0 rounded-l-2xl relative overflow-hidden"
          style={{ backgroundColor: app.panelColor }}
        >
          {storeImages.cover && (
            <img src={storeImages.cover} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {storeImages.logo && (
            <div className="absolute top-4 left-4 w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 z-10">
              <img src={storeImages.logo} alt="logo" className="w-full h-full object-cover" />
            </div>
          )}
          {!storeImages.logo && (
            <div className="absolute top-4 left-4 z-10">
              <span className="text-[10px] font-bold text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {app.category.toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-4 z-10">
            <div className="text-base font-bold text-white leading-tight">{app.storeName}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[13px] text-white/70">person</span>
              <span className="text-xs text-white/80">{app.applicantName}</span>
            </div>
          </div>
        </div>

        {/* Right details */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-lg font-bold text-on-surface">{app.storeName}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{app.applicantName}</div>
            </div>
            <span className="text-[10px] font-bold tracking-wide text-primary border border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full">
              {app.stationName}
            </span>
          </div>

          {/* Business profile fact row */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.category}</div>
              <div className="text-sm font-semibold text-on-surface">{app.category}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.stores}</div>
              <div className="text-sm font-semibold text-on-surface">{app.numStores}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.experience}</div>
              <div className="text-sm font-semibold text-on-surface">{app.experience}</div>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.budget}</div>
              <div className="text-sm font-semibold text-on-surface">
                {app.maxBudget}<span className="text-[10px] text-on-surface-variant"> /mo</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-widest text-on-surface-variant mb-0.5">{T.aiScore}</div>
              <div className="text-sm font-semibold text-primary">{app.aiScore}</div>
            </div>
          </div>

          {/* AI Business Summary */}
          <div className="bg-[#D9EDD9] rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-center gap-1 mb-2">
              <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-[9px] font-bold tracking-widest text-primary">{T.aiSummary}</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{aiText}</p>
          </div>

          {/* Action row */}
          <div className="flex items-center justify-end gap-3">
            {bookingConfirmed ? (
              <>
                <span className="flex items-center gap-1.5 text-primary text-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {T.bookingConfirmedLabel}
                </span>
                <button
                  type="button"
                  onClick={handleViewBooking}
                  className="flex items-center gap-1.5 bg-[#1C3A1C] text-white text-sm font-bold rounded-full px-5 py-2.5 border-0 cursor-pointer hover:brightness-105"
                >
                  <span className="material-symbols-outlined text-[15px]">event_available</span>
                  {T.viewBooking}
                </button>
              </>
            ) : status === "approved" ? (
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
                  onClick={handleDecline}
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandlordApplicationsPage() {
  const { stationId } = useStationFilter();
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const [activeTab, setActiveTab] = useState<TabId>("pending");
  const [statuses, setStatuses] = useState<Record<string, LandlordStatus>>({});
  const [bookingConfirmed, setBookingConfirmed] = useState<Record<string, boolean>>({});
  const [apps, setApps] = useState<SharedApp[]>([]);
  const appsRef = useRef<SharedApp[]>([]);

  function updateApps(newApps: SharedApp[]) {
    appsRef.current = newApps;
    setApps(newApps);
  }

  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const res = await fetch("/api/applications?role=landlord");
        if (res.ok) {
          const rows = await res.json() as DbApp[];
          const mapped = rows.map(dbToSharedApp);
          updateApps(mapped);
          const fromDb: Record<string, LandlordStatus> = {};
          rows.forEach(a => {
            if (a.status === "approved")          fromDb[a.landlord_display_id] = "approved";
            else if (a.status === "not_approved") fromDb[a.landlord_display_id] = "declined";
            else                                  fromDb[a.landlord_display_id] = "pending";
          });
          setStatuses(fromDb);
          setBookingConfirmed(loadBookingConfirmations(mapped));
        }
      } catch {}
    }
    loadFromSupabase();
  }, []);

  // Supabase Realtime — updates application status in real time
  useEffect(() => {
    const channel = supabase
      .channel("landlord-applications-status")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "applications" }, (payload) => {
        const updated = payload.new as { landlord_display_id: string; status: string };
        const statusMap: Record<string, LandlordStatus> = {
          approved: "approved", not_approved: "declined", pending_review: "pending",
        };
        setStatuses(prev => ({
          ...prev,
          [updated.landlord_display_id]: statusMap[updated.status] ?? "pending",
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const checkConfirmations = () => setBookingConfirmed(loadBookingConfirmations(appsRef.current));
    const timer = setInterval(checkConfirmations, 2000);
    window.addEventListener("storage", checkConfirmations);
    return () => { clearInterval(timer); window.removeEventListener("storage", checkConfirmations); };
  }, []);

  async function handleApprove(app: SharedApp) {
    // Update Supabase
    try {
      await fetch(`/api/applications/${app.landlordAppId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
    } catch {}
    // Keep localStorage for retailer-side polling fallback
    try {
      localStorage.setItem(`ptg_landlord_status_${app.landlordAppId}`, "approved");
      localStorage.setItem(`ptg_app_badge_${app.retailerAppId}`, "APPROVED");
    } catch {}
    setStatuses(prev => ({ ...prev, [app.landlordAppId]: "approved" }));
    addNotification({
      type: "status_update",
      userType: "retailer",
      title: "Application Approved",
      body: `Your application for ${app.stationName} has been approved. Schedule your site walkthrough now.`,
      href: "/retailer_backoffice/myApplicationsPage",
      timestamp: new Date().toISOString(),
    });
    addNotification({
      type: "status_update",
      userType: "landlord",
      title: "Tenant Approved",
      body: `${app.storeName} has been approved for ${app.stationName}. Proceed to schedule a walkthrough.`,
      href: `/landlord_backoffice/landlordBookingDiscussionPage?appId=${app.landlordAppId}`,
      timestamp: new Date().toISOString(),
    });
  }

  async function handleDecline(app: SharedApp) {
    try {
      await fetch(`/api/applications/${app.landlordAppId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "not_approved" }),
      });
    } catch {}
    try {
      localStorage.setItem(`ptg_landlord_status_${app.landlordAppId}`, "declined");
      localStorage.setItem(`ptg_app_badge_${app.retailerAppId}`, "NOT APPROVED");
    } catch {}
    setStatuses(prev => ({ ...prev, [app.landlordAppId]: "declined" }));
  }

  const allFiltered = stationId === "all"
    ? apps
    : apps.filter(a => a.stationId === stationId);

  const pendingApps    = allFiltered.filter(a => statuses[a.landlordAppId] === "pending"  && !bookingConfirmed[a.landlordAppId]);
  const approvedApps   = allFiltered.filter(a => statuses[a.landlordAppId] === "approved" && !bookingConfirmed[a.landlordAppId]);
  const confirmedApps  = allFiltered.filter(a => !!bookingConfirmed[a.landlordAppId]);

  const tabApps: Record<TabId, SharedApp[]> = {
    all:               allFiltered,
    pending:           pendingApps,
    approved:          approvedApps,
    booking_confirmed: confirmedApps,
  };
  const visibleApps = tabApps[activeTab];

  const TABS: { id: TabId; label: string; count: number }[] = [
    { id: "all",               label: T.tabAll,       count: allFiltered.length   },
    { id: "pending",           label: T.tabPending,   count: pendingApps.length   },
    { id: "approved",          label: T.tabApproved,  count: approvedApps.length  },
    { id: "booking_confirmed", label: T.tabConfirmed, count: confirmedApps.length },
  ];

  return (
    <LandlordBackofficeLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">
          {lang === "th" ? "ใบสมัครผู้เช่า" : "Tenant Applications"}
        </h1>
      </div>

      {/* Tab bar */}
      <div className="border-b border-outline-variant/10 mb-6">
        <div className="flex gap-7">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3.5 border-b-2 bg-transparent border-t-0 border-x-0 cursor-pointer transition-colors text-sm flex items-center gap-2 ${
                  active
                    ? "border-[#1C3A1C] text-on-surface font-semibold"
                    : "border-transparent text-on-surface-variant hover:text-on-surface font-medium"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    active ? "bg-[#1C3A1C] text-white" : "bg-outline-variant/15 text-on-surface-variant"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {visibleApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-sm text-on-surface-variant shadow-sm">
          {T.noApplications}
        </div>
      ) : (
        <div className="space-y-5">
          {visibleApps.map(app => (
            <AppCard
              key={app.landlordAppId}
              app={app}
              T={T}
              lang={lang}
              status={statuses[app.landlordAppId] ?? "pending"}
              bookingConfirmed={!!bookingConfirmed[app.landlordAppId]}
              onApprove={() => handleApprove(app)}
              onDecline={() => handleDecline(app)}
            />
          ))}
        </div>
      )}
    </LandlordBackofficeLayout>
  );
}
