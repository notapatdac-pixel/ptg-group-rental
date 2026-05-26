import { useState, useEffect } from "react";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import type { AppBadge } from "@/lib/applicationsData";
import { supabase } from "@/lib/supabaseClient";

type AppItem = {
  id: string;
  stationName: string;
  unitCode: string;
  unitLabel: string;
  location: string;
  price: number;
  leaseType: string;
  duration: string;
  applied: string;
  progress: number;
  badge: AppBadge;
};

// ── DB → AppItem mapping ──────────────────────────────────────────────────────

type DbApp = {
  retailer_display_id: string;
  status: string;
  applied_date: string;
  station_units?: {
    unit_code: string;
    unit_label: string;
    price_thb: number;
    lease_type: string;
    stations?: { name: string; location_text: string } | null;
  } | null;
};

function dbToAppItem(row: DbApp): AppItem {
  const badge: AppBadge =
    row.status === "approved" ? "APPROVED" :
    row.status === "not_approved" ? "NOT APPROVED" : "PENDING REVIEW";
  return {
    id: row.retailer_display_id,
    stationName: row.station_units?.stations?.name ?? "",
    unitCode: row.station_units?.unit_code ?? "",
    unitLabel: row.station_units?.unit_label ?? "",
    location: row.station_units?.stations?.location_text ?? "",
    price: row.station_units?.price_thb ?? 0,
    leaseType: row.station_units?.lease_type ?? "",
    duration: "—",
    applied: row.applied_date
      ? new Date(row.applied_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "—",
    progress: 0,
    badge,
  };
}

// ── Progress labels ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Submitted", "Approved", "Booking"];

// ── Tab config ────────────────────────────────────────────────────────────────

type TabId = "all" | "pending" | "approved" | "rejected";

const TABS: { id: TabId; label: string; badge: AppBadge | null }[] = [
  { id: "all",      label: "All",            badge: null             },
  { id: "pending",  label: "Pending Review", badge: "PENDING REVIEW" },
  { id: "approved", label: "Approved",       badge: "APPROVED"       },
  { id: "rejected", label: "Not Approved",   badge: "NOT APPROVED"   },
];

// ── Per-status visual config ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppBadge, {
  headerBg: string;
  titleCls: string;
  subCls: string;
  badgeCls: string;
  accentLine: string;
}> = {
  "APPROVED": {
    headerBg:   "bg-[#1C3A1C]",
    titleCls:   "text-white",
    subCls:     "text-white/60",
    badgeCls:   "bg-lime-400/20 text-lime-300",
    accentLine: "bg-lime-400",
  },
  "PENDING REVIEW": {
    headerBg:   "bg-[#1E3A5F]",
    titleCls:   "text-white",
    subCls:     "text-white/60",
    badgeCls:   "bg-blue-400/20 text-blue-200",
    accentLine: "bg-blue-400",
  },
  "NOT APPROVED": {
    headerBg:   "bg-[#5C1A1A]",
    titleCls:   "text-white",
    subCls:     "text-white/60",
    badgeCls:   "bg-red-400/20 text-red-200",
    accentLine: "bg-red-400",
  },
};

// ── Progress step helper ──────────────────────────────────────────────────────
// effectiveProgress:
//   NOT APPROVED → only step 0 shown (red X), rest grey
//   PENDING REVIEW → step 0 filled green, steps 1+ empty
//   APPROVED → steps 0+1 filled green, step 2 empty
//   bookingStarted (APPROVED + clicked) → all 3 steps filled

function getEffectiveProgress(badge: AppBadge, bookingStarted: boolean): number {
  if (badge === "NOT APPROVED")  return 0;
  if (badge === "PENDING REVIEW") return 1;
  if (badge === "APPROVED")      return bookingStarted ? 3 : 2;
  return 1;
}

function StepDot({ badge, stepIndex, effectiveProgress }: { badge: AppBadge; stepIndex: number; effectiveProgress: number }) {
  if (badge === "NOT APPROVED") {
    const active = stepIndex === 0;
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-red-500 text-white" : "bg-outline-variant/20 text-on-surface-variant"}`}>
        {active ? <span className="material-symbols-outlined text-[12px]">close</span> : stepIndex + 1}
      </div>
    );
  }
  const filled = stepIndex < effectiveProgress;
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${filled ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface-variant"}`}>
      {filled ? <span className="material-symbols-outlined text-[12px]">check</span> : stepIndex + 1}
    </div>
  );
}

// ── AppCard ───────────────────────────────────────────────────────────────────

function AppCard({ app }: { app: AppItem }) {
  const cfg = STATUS_CONFIG[app.badge];

  const [bookingStarted, setBookingStarted] = useState(() => {
    try { return !!localStorage.getItem(`ptg_booking_started_${app.id}`); } catch { return false; }
  });

  const effectiveProgress = getEffectiveProgress(app.badge, bookingStarted);

  function handleContinueToBooking() {
    try { localStorage.setItem(`ptg_booking_started_${app.id}`, "1"); } catch {}
    setBookingStarted(true);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* Coloured header */}
      <div className={`h-28 ${cfg.headerBg} flex items-end p-5 relative`}>
        {/* Accent strip */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${cfg.accentLine}`} />
        {/* Badge */}
        <span className={`absolute top-4 left-5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${cfg.badgeCls}`}>
          {app.badge}
        </span>
        {/* Ref */}
        <span className="absolute top-4 right-5 text-[10px] text-white/40 font-mono">{app.id}</span>
        <div>
          <h3 className={`text-xl font-bold ${cfg.titleCls}`}>{app.stationName}</h3>
          <p className={`text-sm ${cfg.subCls}`}>{app.location} · Applied: {app.applied}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 text-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Space</span>
            <div className="font-medium text-on-surface">{app.unitCode} — {app.unitLabel}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lease Type</span>
            <div className="font-medium text-on-surface">{app.leaseType}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Duration</span>
            <div className="font-medium text-on-surface">{app.duration}</div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Monthly Rent</span>
            <div className="font-medium text-on-surface">฿{app.price.toLocaleString()}</div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-4">
          {STEP_LABELS.map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <StepDot badge={app.badge} stepIndex={i} effectiveProgress={effectiveProgress} />
                <span className="text-[9px] text-on-surface-variant whitespace-nowrap">{step}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 ${
                  i < effectiveProgress ? "bg-primary" : "bg-outline-variant/20"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* APPROVED action */}
        {app.badge === "APPROVED" && (
          <div className="bg-primary/5 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              <p className="text-xs text-on-surface">
                <strong>Approved.</strong> Proceed to schedule your site visit and sign the lease.
              </p>
            </div>
            <Link href={`/retailer_backoffice/scheduleBookingPage?appId=${app.id}`} onClick={handleContinueToBooking}>
              <button
                type="button"
                className="flex-shrink-0 flex items-center gap-1.5 bg-[#1C3A1C] text-white font-bold px-4 py-2 rounded-full text-xs cursor-pointer border-0 hover:brightness-105 transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                Continue to Booking
              </button>
            </Link>
          </div>
        )}

        {/* PENDING action */}
        {app.badge === "PENDING REVIEW" && (
          <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            <p className="text-xs text-on-surface-variant">
              Your application is currently under review by the landlord.
            </p>
          </div>
        )}

        {/* NOT APPROVED action */}
        {app.badge === "NOT APPROVED" && (
          <div className="bg-red-50 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-red-500 text-[16px] mt-0.5">info</span>
            <p className="text-xs text-on-surface-variant">
              This application was not approved. This unit may have been taken by another applicant or did not meet landlord criteria at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type NewApp = {
  refNum: string;
  stationName: string;
  unitCode: string;
  unitLabel: string;
  price: number;
  submittedAt: string;
  status: string;
};

export default function MyApplicationsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [allApps, setAllApps]     = useState<AppItem[]>([]);

  useEffect(() => {
    async function loadApps() {
      let fromDb: AppItem[] = [];
      try {
        const res = await fetch("/api/applications");
        if (res.ok) {
          const rows = await res.json() as DbApp[];
          fromDb = rows.map(dbToAppItem);
        }
      } catch {}

      // Merge with any locally-submitted (not yet in DB) apps
      let localApps: AppItem[] = [];
      try {
        const stored = JSON.parse(localStorage.getItem("ptg_applications") ?? "[]") as NewApp[];
        localApps = stored.map(a => ({
          id:          a.refNum,
          stationName: a.stationName,
          unitCode:    a.unitCode,
          unitLabel:   a.unitLabel,
          location:    "",
          price:       a.price,
          leaseType:   a.unitLabel,
          duration:    "—",
          applied:     new Date(a.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          progress:    1,
          badge:       "PENDING REVIEW" as AppBadge,
        }));
      } catch {}

      const merged = [...localApps, ...fromDb].reduce<AppItem[]>((acc, cur) => {
        if (!acc.find(a => a.id === cur.id)) acc.push(cur);
        return acc;
      }, []);

      const withOverrides = merged.map(app => {
        try {
          const override = localStorage.getItem(`ptg_app_badge_${app.id}`);
          if (override) return { ...app, badge: override as AppBadge };
        } catch {}
        return app;
      });
      setAllApps(withOverrides);
    }
    loadApps();
  }, []);

  // localStorage polling (fallback for when Supabase is not connected)
  useEffect(() => {
    const checkOverrides = () => {
      setAllApps(prev => prev.map(app => {
        try {
          const override = localStorage.getItem(`ptg_app_badge_${app.id}`);
          if (override && override !== app.badge) return { ...app, badge: override as AppBadge };
        } catch {}
        return app;
      }));
    };
    const timer = setInterval(checkOverrides, 2000);
    window.addEventListener("storage", checkOverrides);
    return () => { clearInterval(timer); window.removeEventListener("storage", checkOverrides); };
  }, []);

  // Supabase Realtime — updates badge immediately when landlord approves/declines
  useEffect(() => {
    const dbToBadge: Record<string, AppBadge> = {
      approved:      "APPROVED",
      pending_review: "PENDING REVIEW",
      not_approved:  "NOT APPROVED",
    };
    const channel = supabase
      .channel("retailer-applications-status")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "applications" }, (payload) => {
        const updated = payload.new as { retailer_display_id: string; status: string };
        const badge = dbToBadge[updated.status];
        if (!badge) return;
        setAllApps(prev => prev.map(app =>
          app.id === updated.retailer_display_id ? { ...app, badge } : app
        ));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = activeTab === "all"
    ? allApps
    : allApps.filter(a =>
        activeTab === "pending"  ? a.badge === "PENDING REVIEW" :
        activeTab === "approved" ? a.badge === "APPROVED" :
        a.badge === "NOT APPROVED"
      );

  const counts: Record<TabId, number> = {
    all:      allApps.length,
    pending:  allApps.filter(a => a.badge === "PENDING REVIEW").length,
    approved: allApps.filter(a => a.badge === "APPROVED").length,
    rejected: allApps.filter(a => a.badge === "NOT APPROVED").length,
  };

  return (
    <RetailerBackofficeLayout>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">My Applications</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Track and manage your retail space applications across PTG locations.
        </p>
      </div>

      {/* ── Tab bar ── */}
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
                {counts[tab.id] > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    active ? "bg-[#1C3A1C] text-white" : "bg-outline-variant/15 text-on-surface-variant"
                  }`}>
                    {counts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-outline/30 text-[48px] block mb-3">folder_open</span>
          <p className="text-sm font-semibold text-on-surface-variant mb-1">No applications here yet</p>
          <p className="text-xs text-on-surface-variant/60">Applications in this status will appear here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(app => <AppCard key={app.id} app={app} />)}
        </div>
      )}

    </RetailerBackofficeLayout>
  );
}
