"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { getAppByLandlordId, LANDLORD_TO_RETAILER } from "@/lib/applicationsData";

const CHAT_SEED = [
  { from: "landlord", text: "Hi, your application has been approved. Let's schedule a site walkthrough at your convenience." },
  { from: "tenant",   text: "Thank you so much! I'm very excited. What dates work best for you?" },
  { from: "landlord", text: "We can do late May or early June. Please go ahead and select a date and time from your booking dashboard — I'll receive a notification once you confirm." },
];

export default function LandlordBookingDiscussionPage() {
  const router = useRouter();
  const appId      = typeof router.query.appId === "string" ? router.query.appId : "LAND-APP-2025-001";
  const appInfo    = getAppByLandlordId(appId) ?? getAppByLandlordId("LAND-APP-2025-001")!;
  const retailerAppId = LANDLORD_TO_RETAILER[appId] ?? LANDLORD_TO_RETAILER["LAND-APP-2025-001"];

  const [chatInput, setChatInput] = useState("");
  const [messages,  setMessages]  = useState(CHAT_SEED);

  const [bookingConfirmed, setBookingConfirmed] = useState(() => {
    try { return !!localStorage.getItem(`ptg_booking_confirmed_${retailerAppId}`); } catch { return false; }
  });
  const [confirmedDate, setConfirmedDate] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem(`ptg_booking_confirmed_${retailerAppId}`);
      if (raw) return (JSON.parse(raw) as { date: string; time: string }).date;
    } catch {}
    return null;
  });
  const [confirmedTime, setConfirmedTime] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem(`ptg_booking_confirmed_${retailerAppId}`);
      if (raw) return (JSON.parse(raw) as { date: string; time: string }).time;
    } catch {}
    return null;
  });

  useEffect(() => {
    if (bookingConfirmed) return;
    function check() {
      try {
        const raw = localStorage.getItem(`ptg_booking_confirmed_${retailerAppId}`);
        if (raw) {
          const { date, time } = JSON.parse(raw) as { date: string; time: string };
          setConfirmedDate(date);
          setConfirmedTime(time);
          setBookingConfirmed(true);
        }
      } catch {}
    }
    const timer = setInterval(check, 2000);
    window.addEventListener("storage", check);
    return () => { clearInterval(timer); window.removeEventListener("storage", check); };
  }, [bookingConfirmed, retailerAppId]);

  function handleSend() {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { from: "landlord", text: chatInput.trim() }]);
    setChatInput("");
  }

  return (
    <LandlordBackofficeLayout>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-on-surface-variant">
        <Link href="/landlord_backoffice/landlordApplicationsPage" className="hover:text-primary cursor-pointer">Applications</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Booking Discussion</span>
      </div>

      {/* Hero */}
      <div className="bg-[#1C3A1C] rounded-2xl p-6 mb-6 text-white flex items-center gap-5">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: appInfo.panelColor }}>
          <span className="material-symbols-outlined text-white text-[28px]">storefront</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-1">Approved Applicant</div>
          <h1 className="text-xl font-bold text-white">{appInfo.storeName}</h1>
          <p className="text-sm text-white/70">{appInfo.applicantName} · {appInfo.category} · {appInfo.stationName}, Unit {appInfo.unitCode}</p>
        </div>
        <span className="flex-shrink-0 bg-lime-400/20 text-lime-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          {appId}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Left: Chat */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[500px]">
            <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
              <div>
                <div className="text-sm font-bold text-on-surface">Booking Discussion</div>
                <div className="text-xs text-on-surface-variant">with {appInfo.applicantName}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "landlord" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.from === "landlord"
                      ? "bg-[#1C3A1C] text-white rounded-tr-md"
                      : "bg-[#F5F2EB] text-on-surface rounded-tl-md"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-outline-variant/10 flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                placeholder="Type a message…"
                className="flex-1 bg-[#F5F2EB] rounded-full px-4 py-2 text-sm border-none outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-[#1C3A1C] text-white border-0 cursor-pointer flex items-center justify-center hover:brightness-105 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Booking Status */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="text-sm font-bold text-on-surface mb-4">Booking Status</div>
            {!bookingConfirmed ? (
              <div className="bg-[#F5F2EB] rounded-xl p-5 text-center">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[40px] mb-2 block">pending</span>
                <div className="text-sm font-semibold text-on-surface mb-2">Awaiting Tenant Confirmation</div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  The tenant is selecting a date and time from their booking dashboard. You will be notified once they confirm.
                </div>
              </div>
            ) : (
              <>
                <div className="bg-[#F5F2EB] rounded-xl p-4 mb-4">
                  <div className="text-xs text-on-surface-variant mb-0.5">Date</div>
                  <div className="text-sm font-bold text-on-surface">{confirmedDate} May 2026</div>
                  <div className="text-xs text-on-surface-variant mt-2 mb-0.5">Time</div>
                  <div className="text-sm font-bold text-on-surface">{confirmedTime}</div>
                  <div className="text-xs text-on-surface-variant mt-2 mb-0.5">Location</div>
                  <div className="text-sm font-bold text-on-surface">{appInfo.stationName}</div>
                </div>
                <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-4">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Walkthrough confirmed by tenant
                </div>
                <Link href={`/landlord_backoffice/landlordUpcomingBookingPage?appId=${appId}&date=${confirmedDate}&time=${confirmedTime}`}>
                  <button type="button" className="w-full bg-[#1C3A1C] text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
                    View Upcoming Booking
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

      </div>
    </LandlordBackofficeLayout>
  );
}
