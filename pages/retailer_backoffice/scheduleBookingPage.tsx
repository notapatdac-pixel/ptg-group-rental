"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { addNotification } from "@/lib/notificationStore";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabaseClient";

// ── T5: Dynamic business days ─────────────────────────────────────────────────

function getNextBusinessDays(count: number) {
  const days: { day: string; date: string; month: string; fullDate: Date }[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  while (days.length < count) {
    if (cursor.getDay() !== 0) {
      days.push({
        day: dayNames[cursor.getDay()],
        date: String(cursor.getDate()),
        month: cursor.toLocaleString("en-GB", { month: "short" }),
        fullDate: new Date(cursor),
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

const DOCS = [
  { id: "d1", label: "Company Registration / Business License",   done: true  },
  { id: "d2", label: "Applicant ID (National ID or Passport)",   done: true  },
  { id: "d3", label: "Store Concept Presentation (PDF or PPT)",  done: false },
  { id: "d4", label: "Financial Statement or Bank Statement",    done: false },
  { id: "d5", label: "Signed Letter of Intent (LOI)",            done: false },
];

interface Message {
  id?:   string;
  from:  "specialist" | "user";       // "user" = the retailer, "specialist" = landlord/PTG
  name:  string;
  time:  string;
  text:  string;
}

// Convert a chat_messages row to our local Message view model
function dbRowToMessage(row: {
  id:             string;
  sender_role:    string;
  sender_name:    string;
  content:        string;
  created_at:     string;
}, currentRole: "retailer" | "landlord"): Message {
  const isMine = row.sender_role === currentRole;
  const d = new Date(row.created_at);
  return {
    id:   row.id,
    from: isMine ? "user" : "specialist",
    name: isMine ? "You" : (row.sender_name || (row.sender_role === "landlord" ? "Landlord" : "PTG Specialist")),
    time: `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
    text: row.content,
  };
}

// ── T2: DB application shape ──────────────────────────────────────────────────

type DbApp = {
  id: string;
  retailer_display_id: string;
  landlord_display_id: string;
  status: string;
  specialist_name: string;
  specialist_initials: string;
  retailer_profiles?: {
    business_name: string;
  } | null;
  station_units?: {
    unit_code: string;
    unit_label: string;
    price_thb: number;
    stations?: { name: string; location_text: string } | null;
  } | null;
};

export default function ScheduleBookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const appId  = typeof router.query.appId === "string" ? router.query.appId : "";

  // T2: fetch from DB instead of hardcoded fallback
  const [appData, setAppData] = useState<DbApp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/applications?role=retailer");
        if (res.ok) {
          const rows = (await res.json()) as DbApp[];
          const match = appId ? rows.find(r => r.retailer_display_id === appId) : rows[0];
          setAppData(match ?? null);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [router.isReady, appId]);

  // T5: compute business days at render time so the calendar refreshes daily
  // (toDateString in deps means re-runs whenever the day changes between renders)
  const DAYS = useMemo(() => getNextBusinessDays(6), [new Date().toDateString()]);
  const [selectedDate, setSelectedDate] = useState(DAYS[0].date);
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [confirmed, setConfirmed]       = useState(false);
  const [messages, setMessages]         = useState<Message[]>([]);
  const [draft, setDraft]               = useState("");
  const [docs, setDocs]                 = useState(DOCS);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Chat: load existing messages from DB + subscribe to new ones ─────
  const retailerAppId = appData?.retailer_display_id ?? "";
  useEffect(() => {
    if (!retailerAppId) return;
    let cancelled = false;

    async function loadChat() {
      try {
        const res = await fetch(`/api/chat/${retailerAppId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json() as { messages: Array<{ id: string; sender_role: string; sender_name: string; content: string; created_at: string }> };
        const mapped = data.messages.map(m => dbRowToMessage(m, "retailer"));
        if (!cancelled) setMessages(mapped);
      } catch {}
    }
    loadChat();

    const channel = supabase
      .channel(`chat-retailer-${retailerAppId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        // Refetch — payload doesn't carry the join to know if it belongs to
        // this application without an extra lookup, and the API already
        // filters by application_id, so just re-pull.
        loadChat();
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [retailerAppId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Derive appInfo from DB data
  const stationName     = appData?.station_units?.stations?.name ?? "";
  const unit            = appData?.station_units?.unit_code ?? "";
  const unitLabel       = appData?.station_units?.unit_label ?? "";
  const price           = appData?.station_units?.price_thb
    ? `฿${appData.station_units.price_thb.toLocaleString()}`
    : "";
  const location        = appData?.station_units?.stations?.location_text ?? "";
  const specialistName  = appData?.specialist_name ?? "Kanya Srisuk";
  const specialistInitials = appData?.specialist_initials ?? "KS";
  const storeName       = appData?.retailer_profiles?.business_name ?? "";

  async function sendMessage() {
    if (!draft.trim() || !retailerAppId) return;
    const text = draft.trim();
    setDraft("");
    // Optimistic add — realtime will dedupe by re-loading on INSERT, which
    // returns the canonical row. We push the optimistic one without an id
    // so it gets replaced on reload.
    const now = new Date();
    setMessages(prev => [...prev, {
      from: "user", name: "You",
      time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      text,
    }]);
    try {
      await fetch(`/api/chat/${retailerAppId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderRole: "retailer",
          senderName: user?.name ?? storeName ?? "You",
          userId:     user?.id,
          content:    text,
        }),
      });
    } catch {/* optimistic message remains */}
  }

  // T5: build full date label from DAYS entry
  const selectedDayEntry = DAYS.find(d => d.date === selectedDate) ?? DAYS[0];
  const fullDateLabel    = `${selectedDayEntry.date} ${selectedDayEntry.month} ${selectedDayEntry.fullDate.getFullYear()}`;
  const shortDateLabel   = `${selectedDayEntry.day}, ${selectedDayEntry.date} ${selectedDayEntry.month}`;

  // T5: derive month header from selected day
  const monthHeader = selectedDayEntry.fullDate.toLocaleString("en-GB", { month: "long", year: "numeric" });

  async function handleConfirm() {
    const currentAppId = appData?.retailer_display_id ?? appId;
    const isoDate      = selectedDayEntry.fullDate.toISOString().split("T")[0];

    // Persist to the bookings table + landlord notification (server-side)
    try {
      await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId:     currentAppId,
          visitDate: isoDate,
          visitTime: selectedTime,
        }),
      });
    } catch {/* fall through to local-only behaviour */}

    // Local cache so other pages (landlordApplicationsPage, landlordBookingDiscussionPage)
    // detect the confirmation without re-querying.
    try {
      localStorage.setItem(
        `ptg_booking_confirmed_${currentAppId}`,
        JSON.stringify({ date: selectedDate, time: selectedTime })
      );
    } catch {}

    // Retailer's own notification (client-side; uses retailer's user_id)
    addNotification({
      type: "booking", userType: "retailer",
      title: "Walkthrough Scheduled",
      body: `Your site visit at ${stationName} is confirmed for ${fullDateLabel} at ${selectedTime}.`,
      href: `/retailer_backoffice/bookingConfirmedPage?appId=${currentAppId}&date=${selectedDate}&time=${selectedTime}`,
      timestamp: new Date().toISOString(),
    });

    setConfirmed(true);
    router.push(`/retailer_backoffice/bookingConfirmedPage?appId=${currentAppId}&date=${selectedDate}&time=${selectedTime}`);
  }

  function toggleDoc(id: string) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, done: !d.done } : d));
  }

  const doneDocs = docs.filter(d => d.done).length;

  // Loading / error states
  if (loading) {
    return (
      <RetailerBackofficeLayout>
        <div className="flex items-center justify-center py-24 text-on-surface-variant text-sm">
          Loading application…
        </div>
      </RetailerBackofficeLayout>
    );
  }

  if (!appData) {
    return (
      <RetailerBackofficeLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="material-symbols-outlined text-outline/30 text-[48px]">folder_open</span>
          <p className="text-sm font-semibold text-on-surface-variant">Application not found.</p>
          <Link href="/retailer_backoffice/myApplicationsPage" className="text-xs text-primary underline">
            Back to My Applications
          </Link>
        </div>
      </RetailerBackofficeLayout>
    );
  }

  return (
    <RetailerBackofficeLayout>

      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 mb-5 text-sm text-on-surface-variant">
        <Link href="/retailer_backoffice/myApplicationsPage" className="hover:text-primary cursor-pointer">My Applications</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">Schedule Booking</span>
      </div>

      {/* ── App summary strip ── */}
      <div className="bg-white rounded-2xl shadow-sm px-6 py-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">store</span>
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface">{stationName} · {unit} — {unitLabel}</div>
            <div className="text-xs text-on-surface-variant">{location} · {price}/mo</div>
          </div>
        </div>
        <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary">APPROVED</span>
      </div>

      {/* ── 3-col layout ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Col 1: Calendar + Confirm */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-0.5">Book Site Walkthrough</h3>
            <p className="text-xs text-on-surface-variant mb-4">Select a date and time for your visit to {stationName}.</p>

            {/* Month — T5: dynamic */}
            <div className="flex items-center justify-between mb-3">
              <button type="button" className="text-on-surface-variant bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <span className="text-sm font-semibold text-on-surface">{monthHeader}</span>
              <button type="button" className="text-on-surface-variant bg-transparent border-0 cursor-pointer">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            {/* Days — T5: dynamic */}
            <div className="grid grid-cols-6 gap-1 mb-4">
              {DAYS.map(d => (
                <button
                  key={d.date + d.month}
                  type="button"
                  onClick={() => setSelectedDate(d.date)}
                  className={`rounded-xl py-2 flex flex-col items-center gap-0.5 border-0 cursor-pointer transition-colors ${
                    d.date === selectedDate ? "bg-[#1C3A1C] text-white" : "bg-[#F5F2EB] text-on-surface hover:bg-primary/10"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase">{d.day}</span>
                  <span className="text-sm font-bold">{d.date}</span>
                </button>
              ))}
            </div>

            {/* Times */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Available Times</div>
            <div className="grid grid-cols-3 gap-1.5 mb-5">
              {TIMES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 rounded-lg text-xs font-medium border-0 cursor-pointer transition-colors ${
                    t === selectedTime ? "bg-[#1C3A1C] text-white" : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Selection summary — T5: dynamic date */}
            <div className="bg-primary/5 rounded-xl p-3 mb-4 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
              <div>
                <div className="text-xs font-bold text-on-surface">
                  {shortDateLabel} · {selectedTime}
                </div>
                <div className="text-[10px] text-on-surface-variant">{stationName} · 1-hr walkthrough</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={confirmed}
              className="w-full bg-[#1C3A1C] text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {confirmed ? "Booking Confirmed" : "Confirm Walkthrough"}
            </button>
          </div>

          {/* Document checklist */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-on-surface">Documents Required</h3>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${doneDocs === docs.length ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>
                {doneDocs}/{docs.length} ready
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3">Prepare these before your site walkthrough.</p>
            <div className="space-y-2">
              {docs.map(d => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDoc(d.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left cursor-pointer transition-colors border-0 ${
                    d.done ? "bg-primary/5" : "bg-[#F5F2EB] hover:bg-primary/5"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${d.done ? "bg-primary" : "bg-outline-variant/30"}`}>
                    {d.done && <span className="material-symbols-outlined text-white text-[12px]">check</span>}
                  </div>
                  <span className={`text-xs ${d.done ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>{d.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2+3: Chat */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden" style={{ minHeight: "620px" }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10">
            <div className="w-9 h-9 bg-lime-400 rounded-full flex items-center justify-center text-[#1C3A1C] font-bold text-sm flex-shrink-0">{specialistInitials}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-on-surface">{specialistName} · PTG Leasing Specialist</div>
              <div className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Online · responds within minutes
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="w-8 h-8 rounded-xl bg-[#F5F2EB] flex items-center justify-center hover:bg-primary/10 transition-colors border-0 cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">phone</span>
              </button>
              <button type="button" className="w-8 h-8 rounded-xl bg-[#F5F2EB] flex items-center justify-center hover:bg-primary/10 transition-colors border-0 cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">video_call</span>
              </button>
            </div>
          </div>

          {/* Info strip */}
          <div className="px-5 py-2.5 bg-primary/[0.04] border-b border-outline-variant/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <span className="text-[10px] text-on-surface-variant">Messages are private between you and the PTG leasing team · Ref: {appData.retailer_display_id}</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F5F2EB]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.from === "specialist" ? "bg-lime-400 text-[#1C3A1C]" : "bg-[#1C3A1C] text-white"}`}>
                  {msg.from === "specialist" ? specialistInitials : "Me"}
                </div>
                <div className={`max-w-[72%] flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.from === "user" ? "bg-[#1C3A1C] text-white rounded-tr-sm" : "bg-white text-on-surface rounded-tl-sm shadow-sm"}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-outline-variant/10 flex gap-3 items-center bg-white">
            <button type="button" className="text-on-surface-variant hover:text-on-surface bg-transparent border-0 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">attach_file</span>
            </button>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Type a message…"
              className="flex-1 bg-[#F5F2EB] rounded-full px-4 py-2.5 text-sm border-none outline-none"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!draft.trim()}
              className="w-9 h-9 bg-[#1C3A1C] rounded-full flex items-center justify-center border-0 cursor-pointer disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-white text-[18px]">send</span>
            </button>
          </div>
        </div>

      </div>
    </RetailerBackofficeLayout>
  );
}
