"use client";
import { useRouter } from "next/router";
import Link from "next/link";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { getAppByLandlordId } from "@/lib/applicationsData";

const DAY_MAP: Record<string, string> = {
  "26": "Tue", "27": "Wed", "28": "Thu", "29": "Fri", "30": "Sat", "31": "Sun",
};

export default function LandlordUpcomingBookingPage() {
  const router  = useRouter();
  const appId   = typeof router.query.appId === "string" ? router.query.appId : "LAND-APP-2025-001";
  const date    = typeof router.query.date   === "string" ? router.query.date  : "29";
  const time    = typeof router.query.time   === "string" ? router.query.time  : "14:00";
  const appInfo = getAppByLandlordId(appId) ?? getAppByLandlordId("LAND-APP-2025-001")!;

  const dayLabel  = `${DAY_MAP[date] ?? ""}, ${date} May 2026`;
  const endHour   = String(Number(time.split(":")[0]) + 1).padStart(2, "0");
  const timeRange = `${time} – ${endHour}:${time.split(":")[1]} ICT`;

  return (
    <LandlordBackofficeLayout>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-on-surface-variant">
        <Link href="/landlord_backoffice/landlordApplicationsPage" className="hover:text-primary cursor-pointer">Applications</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href={`/landlord_backoffice/landlordBookingDiscussionPage?appId=${appId}`} className="hover:text-primary cursor-pointer">Booking Discussion</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Upcoming Booking</span>
      </div>

      {/* Hero */}
      <div className="bg-[#1C3A1C] rounded-2xl p-8 mb-6 text-white flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-lime-400/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-lime-400 text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-1">Walkthrough Confirmed</div>
          <h1 className="text-2xl font-bold text-white mb-1">Upcoming Booking</h1>
          <p className="text-white/70 text-sm">Site visit scheduled with {appInfo.storeName} at {appInfo.stationName}.</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-white/50 mb-0.5">Reference</div>
          <div className="text-sm font-bold text-lime-300">{appId}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Left: booking details */}
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-outline-variant/10">
              <h3 className="font-semibold text-on-surface">Booking Details</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-5 gap-x-8">
              {[
                { label: "Tenant",           value: appInfo.storeName },
                { label: "Applicant",        value: appInfo.applicantName },
                { label: "Station",          value: appInfo.stationName },
                { label: "Unit",             value: appInfo.unitCode },
                { label: "Category",         value: appInfo.category },
                { label: "Walkthrough Date", value: dayLabel },
                { label: "Walkthrough Time", value: timeRange },
                { label: "Status",           value: "Confirmed" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">{label}</div>
                  <div className={`text-sm font-medium ${label === "Status" ? "text-primary" : "text-on-surface"}`}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: status card + done */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Walkthrough</div>
            <div className="bg-[#F5F2EB] rounded-xl p-4 mb-4">
              <div className="text-xs text-on-surface-variant mb-0.5">Date</div>
              <div className="text-sm font-bold text-on-surface">{dayLabel}</div>
              <div className="text-xs text-on-surface-variant mt-2 mb-0.5">Time</div>
              <div className="text-sm font-bold text-on-surface">{timeRange}</div>
              <div className="text-xs text-on-surface-variant mt-2 mb-0.5">Location</div>
              <div className="text-sm font-bold text-on-surface">{appInfo.stationName}</div>
            </div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Walkthrough confirmed
            </div>
          </div>

          <Link href="/landlord_backoffice/landlordApplicationsPage">
            <button type="button" className="w-full bg-[#1C3A1C] text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
              Done
            </button>
          </Link>
        </div>

      </div>
    </LandlordBackofficeLayout>
  );
}
