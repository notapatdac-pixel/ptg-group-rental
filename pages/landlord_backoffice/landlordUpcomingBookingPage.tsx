"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";

// Live application row (from /api/applications), including the confirmed booking
// surfaced by the API. Replaces the old hardcoded `applicationsData` mock so the
// page shows the REAL tenant/store name and the actual walkthrough date/time.
type Row = {
  landlord_display_id: string;
  panel_color?: string;
  booking?: { visitDate: string; visitTime: string } | null;
  retailer_profiles?: { business_name?: string; category?: string; users?: { name?: string } | null } | null;
  station_units?: { unit_code?: string; stations?: { name?: string } | null } | null;
};

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function fmtTimeRange(t?: string): string {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const endH = String(Number(h) + 1).padStart(2, "0");
  return `${t} – ${endH}:${m ?? "00"} ICT`;
}

export default function LandlordUpcomingBookingPage() {
  const router = useRouter();
  const appId  = typeof router.query.appId === "string" ? router.query.appId : "";

  const [row, setRow]         = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/applications?role=landlord");
        if (res.ok && !cancelled) {
          const rows = (await res.json()) as Row[];
          setRow(rows.find(r => r.landlord_display_id === appId) ?? null);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [router.isReady, appId]);

  if (loading) {
    return (
      <LandlordBackofficeLayout>
        <div className="flex items-center justify-center py-24 text-sm text-on-surface-variant">Loading booking…</div>
      </LandlordBackofficeLayout>
    );
  }

  if (!row) {
    return (
      <LandlordBackofficeLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="material-symbols-outlined text-outline/30 text-[48px]">event_busy</span>
          <p className="text-sm font-semibold text-on-surface-variant">Booking not found.</p>
          <Link href="/landlord_backoffice/landlordApplicationsPage" className="text-xs text-primary underline">Back to Applications</Link>
        </div>
      </LandlordBackofficeLayout>
    );
  }

  const storeName     = row.retailer_profiles?.business_name ?? "Tenant";
  const applicantName = row.retailer_profiles?.users?.name ?? "—";
  const category      = row.retailer_profiles?.category ?? "—";
  const stationName   = row.station_units?.stations?.name ?? "—";
  const unitCode      = row.station_units?.unit_code ?? "—";

  // Prefer the DB booking date/time; fall back to query params if present.
  const visitDate = row.booking?.visitDate ?? (typeof router.query.date === "string" ? router.query.date : "");
  const visitTime = row.booking?.visitTime ?? (typeof router.query.time === "string" ? router.query.time : "");
  const dayLabel  = fmtDate(visitDate);
  const timeRange = fmtTimeRange(visitTime);

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
          <p className="text-white/70 text-sm">Site visit scheduled with {storeName} at {stationName}.</p>
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
                { label: "Tenant",           value: storeName },
                { label: "Applicant",        value: applicantName },
                { label: "Station",          value: stationName },
                { label: "Unit",             value: unitCode },
                { label: "Category",         value: category },
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
              <div className="text-sm font-bold text-on-surface">{stationName}</div>
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
