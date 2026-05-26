"use client";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const APP_DATA: Record<string, {
  stationName: string; unit: string; unitLabel: string; price: string;
  duration: string; location: string; specialist: string; specialistInitials: string;
}> = {
  "PTG-APP-2025-8821": {
    stationName: "PTG Rama IX",
    unit: "A-02", unitLabel: "Shopfront Unit",
    price: "฿22,000", duration: "12 Months",
    location: "Huai Khwang, Bangkok",
    specialist: "Kanya Srisuk", specialistInitials: "KS",
  },
};

const STEPS = [
  { label: "Application Submitted",  icon: "description",    done: true  },
  { label: "Application Approved",   icon: "verified",        done: true  },
  { label: "Walkthrough Scheduled",  icon: "calendar_month",  done: true  },
  { label: "Lease Signing",          icon: "edit_document",   done: false },
  { label: "Move In",                icon: "store",           done: false },
];

const NEXT_STEPS = [
  {
    icon: "calendar_month",
    title: "Attend your walkthrough",
    body: "Visit the station at the scheduled time. Your PTG specialist will guide you through the space and answer questions.",
    active: true,
  },
  {
    icon: "edit_document",
    title: "Review & sign lease",
    body: "After the walkthrough, you'll receive a digital lease agreement to review and sign.",
    active: false,
  },
  {
    icon: "payments",
    title: "Pay deposit & first month",
    body: "Once the lease is signed, the deposit and first month's rent are due before your move-in date.",
    active: false,
  },
  {
    icon: "store",
    title: "Move in & set up",
    body: "Collect your keys and get your store ready. Your PTG contact will be on hand for any support.",
    active: false,
  },
];

export default function BookingConfirmedPage() {
  const router  = useRouter();
  const appId   = typeof router.query.appId === "string" ? router.query.appId : "PTG-APP-2025-8821";
  const date    = typeof router.query.date  === "string" ? router.query.date  : "29";
  const time    = typeof router.query.time  === "string" ? router.query.time  : "14:00";
  const appInfo = APP_DATA[appId] ?? APP_DATA["PTG-APP-2025-8821"];

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

          {/* Next steps */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-on-surface mb-4">What Happens Next</h3>
            <div className="space-y-4">
              {NEXT_STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.active ? "bg-[#1C3A1C]" : "bg-outline-variant/10"}`}>
                    <span className={`material-symbols-outlined text-[17px] ${s.active ? "text-white" : "text-on-surface-variant"}`}>{s.icon}</span>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold mb-0.5 ${s.active ? "text-on-surface" : "text-on-surface-variant"}`}>{s.title}</div>
                    <div className="text-xs text-on-surface-variant leading-relaxed">{s.body}</div>
                  </div>
                </div>
              ))}
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

          {/* Location info */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Visit Location</div>
            <div className="bg-[#F5F2EB] rounded-xl h-28 flex items-center justify-center mb-3">
              <div className="text-center">
                <span className="material-symbols-outlined text-primary text-[28px] block mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <div className="text-xs font-bold text-on-surface">{appInfo.stationName}</div>
                <div className="text-[10px] text-on-surface-variant">{appInfo.location}</div>
              </div>
            </div>
            <button type="button" className="w-full flex items-center justify-center gap-2 bg-[#F5F2EB] text-on-surface font-semibold text-sm py-2.5 rounded-xl border-0 cursor-pointer hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Open in Maps
            </button>
          </div>

          {/* Reminder */}
          <div className="bg-primary/5 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-[16px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
              <p className="text-xs text-on-surface leading-relaxed">
                A reminder will be sent to your registered email <strong>24 hours before</strong> your walkthrough.
              </p>
            </div>
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
