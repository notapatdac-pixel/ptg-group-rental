import { useState, useEffect } from "react";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

// ── Types ─────────────────────────────────────────────────────────────────────

type AppBadge = "PENDING REVIEW" | "APPROVED" | "NOT APPROVED";

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

// ── Static applications ───────────────────────────────────────────────────────

const STATIC_APPS: AppItem[] = [
  {
    id: "PTG-APP-2025-8821",
    stationName: "PTG Rama IX",
    unitCode: "A-02", unitLabel: "Shopfront Unit",
    location: "Huai Khwang, Bangkok",
    price: 22000, leaseType: "Shopfront · 35 sqm",
    duration: "12 Months", applied: "12 Jan 2026",
    progress: 2, badge: "APPROVED",
  },
  {
    id: "PTG-APP-2025-6174",
    stationName: "PTG Sukhumvit 62",
    unitCode: "B-02", unitLabel: "Premium Shopfront",
    location: "Khlong Toei, Bangkok",
    price: 28000, leaseType: "Premium Shopfront · 38 sqm",
    duration: "12 Months", applied: "04 Mar 2026",
    progress: 1, badge: "PENDING REVIEW",
  },
  {
    id: "PTG-APP-2025-3302",
    stationName: "PTG Lat Phrao 71",
    unitCode: "F-02", unitLabel: "Pop-up Bay",
    location: "Lat Phrao, Bangkok",
    price: 12000, leaseType: "Pop-up Bay · 20 sqm",
    duration: "3 Months", applied: "18 Nov 2025",
    progress: 1, badge: "NOT APPROVED",
  },
];

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

function StepDot({ badge, stepIndex, progress }: { badge: AppBadge; stepIndex: number; progress: number }) {
  if (badge === "NOT APPROVED") {
    const active = stepIndex === 0;
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? "bg-red-500 text-white" : "bg-outline-variant/20 text-on-surface-variant"}`}>
        {active ? <span className="material-symbols-outlined text-[12px]">close</span> : stepIndex + 1}
      </div>
    );
  }
  const filled = stepIndex < progress;
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${filled ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface-variant"}`}>
      {filled ? <span className="material-symbols-outlined text-[12px]">check</span> : stepIndex + 1}
    </div>
  );
}

// ── AppCard ───────────────────────────────────────────────────────────────────

function AppCard({ app }: { app: AppItem }) {
  const cfg = STATUS_CONFIG[app.badge];
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
                <StepDot badge={app.badge} stepIndex={i} progress={app.progress} />
                <span className="text-[9px] text-on-surface-variant whitespace-nowrap">{step}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 ${
                  app.badge !== "NOT APPROVED" && i < app.progress - 1
                    ? "bg-primary"
                    : "bg-outline-variant/20"
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
            <Link href={`/retailer_backoffice/scheduleBookingPage?appId=${app.id}`}>
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
              Your application is under review. The landlord team typically responds within <strong>3–5 business days</strong>.
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
  const [allApps, setAllApps]     = useState<AppItem[]>(STATIC_APPS);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ptg_applications") ?? "[]") as NewApp[];
      const converted: AppItem[] = stored.map(a => ({
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
        badge:       "PENDING REVIEW",
      }));
      // prepend new apps, deduplicate by id
      const merged = [...converted, ...STATIC_APPS].reduce<AppItem[]>((acc, cur) => {
        if (!acc.find(a => a.id === cur.id)) acc.push(cur);
        return acc;
      }, []);
      setAllApps(merged);
    } catch {}
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

      {/* ── Summary chips ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {[
          { label: "Total",       count: counts.all,      bg: "bg-white border border-outline-variant/20",           text: "text-on-surface" },
          { label: "Approved",    count: counts.approved,  bg: "bg-[#1C3A1C]/8",                                    text: "text-[#1C3A1C] font-semibold" },
          { label: "Pending",     count: counts.pending,   bg: "bg-blue-50",                                         text: "text-blue-700 font-semibold" },
          { label: "Not Approved",count: counts.rejected,  bg: "bg-red-50",                                          text: "text-red-600 font-semibold" },
        ].map(chip => (
          <div key={chip.label} className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs ${chip.bg}`}>
            <span className={chip.text}>{chip.count}</span>
            <span className="text-on-surface-variant">{chip.label}</span>
          </div>
        ))}
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
