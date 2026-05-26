"use client";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { getAppByRetailerId } from "@/lib/applicationsData";

const STEPS = [
  { label: "Application Submitted",  icon: "description",    done: true },
  { label: "Application Approved",   icon: "verified",        done: true },
  { label: "Walkthrough Scheduled",  icon: "calendar_month",  done: true },
];

export default function BookingConfirmedPage() {
  const router  = useRouter();
  const appId     = typeof router.query.appId === "string" ? router.query.appId : "PTG-APP-2025-8821";
  const date      = typeof router.query.date  === "string" ? router.query.date  : "29";
  const time      = typeof router.query.time  === "string" ? router.query.time  : "14:00";
  const sharedApp = getAppByRetailerId(appId) ?? getAppByRetailerId("PTG-APP-2025-8821")!;
  const appInfo   = {
    stationName:        sharedApp.stationName,
    unit:               sharedApp.unitCode,
    unitLabel:          sharedApp.unitLabel,
    price:              `฿${sharedApp.price.toLocaleString()}`,
    duration:           sharedApp.duration,
    location:           sharedApp.location,
    specialist:         sharedApp.specialistName,
    specialistInitials: sharedApp.specialistInitials,
  };

  const DAY_MAP: Record<string, string> = {
    "26": "Mon", "27": "Tue", "28": "Wed", "29": "Thu", "30": "Fri", "31": "Sat",
  };
  const dayLabel = `${DAY_MAP[date] ?? ""}, ${date} May 2026`;

  return (
    <RetailerBackofficeLayout>

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-6 text-sm text-on-surface-variant">
        <Link href="/retailer_backoffice/myApplicationsPage" className="hover:text-primary cursor-pointer">My Applications</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href={`/retailer_backoffice/scheduleBookingPage?appId=${appId}`} className="hover:text-primary cursor-pointer">Schedule Booking</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Booking Confirmed</span>
      </div>

      {/* ── Hero success ── */}
      <div className="bg-[#1C3A1C] rounded-2xl p-8 mb-6 text-white flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-lime-400/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-lime-400 text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-1">Walkthrough Confirmed</div>
          <h1 className="text-2xl font-bold text-white mb-1">Booking Confirmed</h1>
          <p className="text-white/70 text-sm">Your site visit is scheduled. Get ready for your walkthrough at {appInfo.stationName}.</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-white/50 mb-0.5">Reference</div>
          <div className="text-sm font-bold text-lime-300">{appId}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* ── Left (col 1+2): Details + Progress ── */}
        <div className="col-span-2 space-y-5">

          {/* Booking details card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-outline-variant/10">
              <h3 className="font-semibold text-on-surface">Booking Details</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-5 gap-x-8">
              {[
                { label: "Station",        value: appInfo.stationName },
                { label: "Unit",           value: `${appInfo.unit} — ${appInfo.unitLabel}` },
                { label: "Location",       value: appInfo.location },
                { label: "Monthly Rent",   value: appInfo.price },
                { label: "Lease Duration", value: appInfo.duration },
                { label: "Walkthrough Date", value: dayLabel },
                { label: "Walkthrough Time", value: `${time} – ${String(Number(time.split(":")[0]) + 1).padStart(2, "0")}:${time.split(":")[1]} ICT` },
                { label: "Your Specialist", value: appInfo.specialist },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-0.5">{label}</div>
                  <div className="text-sm font-medium text-on-surface">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress timeline */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-on-surface mb-5">Booking Progress</h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-outline-variant/20" />
              <div className="space-y-0">
                {STEPS.map((step, i) => (
                  <div key={step.label} className="relative flex items-start gap-4 pb-5 last:pb-0">
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-[#1C3A1C]" : "bg-white border-2 border-outline-variant/20"}`}>
                      <span className={`material-symbols-outlined text-[15px] ${step.done ? "text-white" : "text-on-surface-variant"}`} style={{ fontVariationSettings: step.done ? "'FILL' 1" : "'FILL' 0" }}>
                        {step.done ? "check" : step.icon}
                      </span>
                    </div>
                    <div className={`pt-1 ${!step.done ? "opacity-50" : ""}`}>
                      <div className={`text-sm font-semibold ${step.done ? "text-on-surface" : "text-on-surface-variant"}`}>{step.label}</div>
                      {i === 2 && step.done && (
                        <div className="text-xs text-primary font-medium mt-0.5">{dayLabel} · {time}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ── Right (col 3): Contact + actions ── */}
        <div className="space-y-4">

          {/* Specialist card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Your Leasing Specialist</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-lime-400 rounded-full flex items-center justify-center text-[#1C3A1C] font-bold flex-shrink-0">
                {appInfo.specialistInitials}
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">{appInfo.specialist}</div>
                <div className="text-xs text-on-surface-variant flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  PTG Leasing · Online
                </div>
              </div>
            </div>
            <Link href={`/retailer_backoffice/scheduleBookingPage?appId=${appId}`}>
              <button type="button" className="w-full flex items-center justify-center gap-2 bg-[#F5F2EB] text-on-surface font-semibold text-sm py-2.5 rounded-xl border-0 cursor-pointer hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined text-[16px]">chat</span>
                Open Chat
              </button>
            </Link>
          </div>

          {/* CTA */}
          <Link href="/retailer_backoffice/myApplicationsPage">
            <button type="button" className="w-full bg-[#1C3A1C] text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
              Back to My Applications
            </button>
          </Link>

        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
