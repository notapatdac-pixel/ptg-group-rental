"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import DecisionSupportPanel from "@/components/landlord_backoffice/DecisionSupportPanel";
import { getStoreImages } from "@/lib/storeImages";
import { useLanguage } from "@/lib/languageContext";

const STRINGS = {
  en: {
    breadcrumbApps: "Applications",
    breadcrumbProfile: "Tenant Profile",
    businessInfo: "Business Information",
    applicationDetails: "Application Details",
    aiSummary: "AI BUSINESS SUMMARY",
    name: "Business / Brand Name",
    applicant: "Contact Person",
    category: "Category",
    concept: "Store Concept",
    experience: "Years of Experience",
    numStores: "Stores Operated",
    maxBudget: "Max Rent Budget",
    productPhotos: "Product Photos",
    stationName: "Station",
    unitCode: "Unit",
    leaseType: "Lease Type",
    duration: "Duration",
    price: "Monthly Rent",
    appliedDate: "Applied Date",
    aiScore: "AI Match Score",
    estRevenue: "Est. Monthly Revenue",
    openChat: "Open Chat",
    viewBooking: "View Booking",
    notApproved: "Not Approved",
    approved: "Approved",
    pendingReview: "Pending Review",
    loading: "Loading application from DB...",
    notFound: "Application not found.",
    thbMo: "฿/mo",
  },
  th: {
    breadcrumbApps: "ใบสมัคร",
    breadcrumbProfile: "โปรไฟล์ผู้เช่า",
    businessInfo: "ข้อมูลธุรกิจ",
    applicationDetails: "รายละเอียดใบสมัคร",
    aiSummary: "สรุปธุรกิจโดย AI",
    name: "ชื่อธุรกิจ / แบรนด์",
    applicant: "ผู้ติดต่อ",
    category: "ประเภทธุรกิจ",
    concept: "แนวคิดร้าน",
    experience: "ประสบการณ์",
    numStores: "จำนวนสาขา",
    maxBudget: "งบค่าเช่าสูงสุด",
    productPhotos: "ภาพสินค้า",
    stationName: "สถานี",
    unitCode: "ยูนิต",
    leaseType: "ประเภทสัญญา",
    duration: "ระยะเวลา",
    price: "ค่าเช่ารายเดือน",
    appliedDate: "วันที่สมัคร",
    aiScore: "คะแนน AI",
    estRevenue: "รายได้โดยประมาณ",
    openChat: "เปิดแชท",
    viewBooking: "ดูการจอง",
    notApproved: "ไม่ผ่านการอนุมัติ",
    approved: "อนุมัติแล้ว",
    pendingReview: "รอการพิจารณา",
    loading: "กำลังโหลดใบสมัครจากฐานข้อมูล...",
    notFound: "ไม่พบใบสมัคร",
    thbMo: "฿/เดือน",
  },
} as const;

type LandlordStatus = "pending" | "approved" | "declined";

type ApiAppRow = {
  id: string;
  retailer_display_id: string;
  landlord_display_id: string;
  status: "pending_review" | "approved" | "not_approved";
  ai_score: string;
  ai_text: string;
  ai_text_th: string;
  est_revenue_thb: string;
  panel_color: string;
  applied_date: string;
  specialist_name: string;
  specialist_initials: string;
  retailer_profiles: {
    business_name: string;
    category: string;
    experience: string;
    num_stores: string;
    max_budget: string;
    concept: string;
    user_id: string;
    users?: { name: string } | null;
  } | null;
  station_units: {
    unit_code: string;
    unit_label: string;
    area_sqm: number;
    price_thb: number;
    lease_type: string;
    stations: {
      filter_key: string;
      name: string;
      location_text: string;
    } | null;
  } | null;
};

type ViewApp = {
  retailerAppId: string;
  landlordAppId: string;
  storeName: string;
  applicantName: string;
  category: string;
  experience: string;
  numStores: string;
  maxBudget: string;
  concept: string;
  stationName: string;
  unitCode: string;
  unitLabel: string;
  leaseType: string;
  price: number;
  appliedDate: string;
  aiText: string;
  aiTextTh: string;
  aiScore: string;
  estRevenue: string;
  panelColor: string;
  status: ApiAppRow["status"];
};

function toView(row: ApiAppRow): ViewApp {
  return {
    retailerAppId:  row.retailer_display_id,
    landlordAppId:  row.landlord_display_id,
    storeName:      row.retailer_profiles?.business_name ?? "—",
    applicantName:  row.retailer_profiles?.users?.name ?? "—",
    category:       row.retailer_profiles?.category ?? "",
    experience:     row.retailer_profiles?.experience ?? "—",
    numStores:      row.retailer_profiles?.num_stores ?? "—",
    maxBudget:      row.retailer_profiles?.max_budget ?? "—",
    concept:        row.retailer_profiles?.concept ?? "",
    stationName:    row.station_units?.stations?.name ?? "—",
    unitCode:       row.station_units?.unit_code ?? "—",
    unitLabel:      row.station_units?.unit_label ?? "",
    leaseType:      row.station_units?.lease_type ?? "—",
    price:          row.station_units?.price_thb ?? 0,
    appliedDate:    row.applied_date,
    aiText:         row.ai_text,
    aiTextTh:       row.ai_text_th,
    aiScore:        row.ai_score,
    estRevenue:     row.est_revenue_thb,
    panelColor:     row.panel_color || "#4a5568",
    status:         row.status,
  };
}

export default function TenantDetailPage() {
  const router  = useRouter();
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const appId = typeof router.query.appId === "string" ? router.query.appId : "";

  const [app,     setApp]     = useState<ViewApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState<LandlordStatus>("pending");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Fetch the real application row from DB
  useEffect(() => {
    let cancelled = false;
    if (!appId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/applications?role=landlord")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: ApiAppRow[]) => {
        if (cancelled) return;
        const found = rows.find((r) => r.landlord_display_id === appId);
        setApp(found ? toView(found) : null);
      })
      .catch(() => { if (!cancelled) setApp(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [appId]);

  useEffect(() => {
    if (!appId || !app) return;
    try {
      const raw = localStorage.getItem(`ptg_landlord_status_${appId}`);
      if (raw === "approved" || raw === "declined" || raw === "pending") setStatus(raw);
      else if (app.status === "approved")     setStatus("approved");
      else if (app.status === "not_approved") setStatus("declined");
    } catch {}
    try {
      if (localStorage.getItem(`ptg_booking_confirmed_${app.retailerAppId}`)) {
        setBookingConfirmed(true);
      }
    } catch {}
  }, [appId, app]);

  if (loading) {
    return (
      <LandlordBackofficeLayout>
        <div className="py-16 text-center text-sm text-on-surface-variant">{T.loading}</div>
      </LandlordBackofficeLayout>
    );
  }

  if (!app) {
    return (
      <LandlordBackofficeLayout>
        <div className="py-16 text-center text-sm text-on-surface-variant">{T.notFound}</div>
      </LandlordBackofficeLayout>
    );
  }

  const storeImages = getStoreImages(app.storeName);
  const aiText = lang === "th" ? app.aiTextTh : app.aiText;

  const statusLabel =
    bookingConfirmed ? T.approved :
    status === "approved" ? T.approved :
    status === "declined" ? T.notApproved :
    T.pendingReview;

  const statusCls =
    status === "approved" || bookingConfirmed ? "text-primary" :
    status === "declined" ? "text-red-600" :
    "text-blue-600";

  return (
    <LandlordBackofficeLayout>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-on-surface-variant">
        <Link href="/landlord_backoffice/landlordApplicationsPage" className="hover:text-primary cursor-pointer">
          {T.breadcrumbApps}
        </Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">{T.breadcrumbProfile}</span>
      </div>

      {/* Hero banner */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-6" style={{ backgroundColor: app.panelColor }}>
        {storeImages.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={storeImages.cover} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        {storeImages.logo && (
          <div className="absolute bottom-6 left-6 w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={storeImages.logo} alt="logo" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute bottom-6 left-6 flex items-end gap-4">
          {storeImages.logo && <div className="w-16 flex-shrink-0" />}
          <div>
            <span className="text-[10px] font-bold text-white/70 bg-black/40 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
              {app.category}
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">{app.storeName}</h1>
            <p className="text-sm text-white/70">{app.applicantName}</p>
          </div>
        </div>
        <div className="absolute top-5 right-5">
          <span className="text-xs font-mono text-white/50">{appId}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Left 2 cols — Business info */}
        <div className="col-span-2 space-y-5">

          {/* AI Decision Support — only meaningful while a decision is pending
              (an approved/declined tenant already has its unit leased). */}
          {appId && status === "pending" && !bookingConfirmed && (
            <DecisionSupportPanel appId={appId} lang={lang} />
          )}

          {/* Business information */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-on-surface mb-4">{T.businessInfo}</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: T.name,        value: app.storeName },
                { label: T.applicant,   value: app.applicantName },
                { label: T.category,    value: app.category },
                { label: T.numStores,   value: app.numStores },
                { label: T.experience,  value: app.experience },
                { label: T.maxBudget,   value: app.maxBudget + " /mo" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">{label}</div>
                  <div className="text-sm font-medium text-on-surface">{value}</div>
                </div>
              ))}
            </div>
            {app.concept && (
              <div className="mt-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{T.concept}</div>
                <p className="text-sm text-on-surface leading-relaxed italic">&ldquo;{app.concept}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Product photos */}
          {(storeImages.products?.filter(Boolean).length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-on-surface mb-4">{T.productPhotos}</h3>
              <div className="grid grid-cols-3 gap-3">
                {storeImages.products!.filter(Boolean).map((src, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`product ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right col — Application details + AI + action */}
        <div className="space-y-4">

          {/* Application details */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-on-surface mb-4">{T.applicationDetails}</h3>
            <div className="space-y-3">
              {[
                { label: T.stationName,  value: app.stationName },
                { label: T.unitCode,     value: `${app.unitCode}${app.unitLabel ? ` — ${app.unitLabel}` : ""}` },
                { label: T.leaseType,    value: app.leaseType },
                { label: T.price,        value: `฿${app.price.toLocaleString()} /mo` },
                { label: T.appliedDate,  value: app.appliedDate },
                { label: T.aiScore,      value: app.aiScore },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
                  <span className={`text-sm font-semibold ${label === T.aiScore ? "text-primary" : "text-on-surface"}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</span>
                <span className={`text-sm font-bold ${statusCls}`}>{statusLabel}</span>
              </div>
            </div>
          </div>

          {/* AI Business Summary — real Gemini text from applications.ai_text/_th */}
          <div className="bg-[#D9EDD9] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <span className="text-[9px] font-bold tracking-widest text-primary">{T.aiSummary}</span>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{aiText}</p>
          </div>

          {/* Action button */}
          {(status === "approved" || bookingConfirmed) && (
            bookingConfirmed ? (
              <Link href={`/landlord_backoffice/landlordUpcomingBookingPage?appId=${appId}`}>
                <button type="button" className="w-full flex items-center justify-center gap-2 bg-[#1C3A1C] text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
                  <span className="material-symbols-outlined text-[16px]">event_available</span>
                  {T.viewBooking}
                </button>
              </Link>
            ) : (
              <Link href={`/landlord_backoffice/landlordBookingDiscussionPage?appId=${appId}`}>
                <button type="button" className="w-full flex items-center justify-center gap-2 bg-[#1C3A1C] text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  {T.openChat}
                </button>
              </Link>
            )
          )}
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
