"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabaseClient";

// ── DB row shape ──────────────────────────────────────────────────────────────
type DbApp = {
  id: string;
  retailer_display_id: string;
  landlord_display_id: string;
  panel_color: string;
  retailer_profiles?: {
    business_name: string;
    category: string;
    users?: { name: string } | null;
  } | null;
  station_units?: {
    unit_code: string;
    unit_label: string;
    stations?: { name: string; location_text: string } | null;
  } | null;
};

interface ChatRow {
  id: string;
  sender_role: string;
  sender_name: string;
  content: string;
  created_at: string;
}

interface DisplayMessage {
  id?: string;
  from: "landlord" | "tenant";
  name: string;
  text: string;
  time: string;
}

function rowToDisplay(r: ChatRow): DisplayMessage {
  const d = new Date(r.created_at);
  const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  return {
    id:   r.id,
    from: r.sender_role === "landlord" || r.sender_role === "specialist" ? "landlord" : "tenant",
    name: r.sender_name || (r.sender_role === "landlord" ? "Landlord" : "Tenant"),
    text: r.content,
    time,
  };
}

export default function LandlordBookingDiscussionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const appId = typeof router.query.appId === "string" ? router.query.appId : "";

  const [appData, setAppData] = useState<DbApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load the application from DB
  useEffect(() => {
    if (!router.isReady) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/applications?role=landlord");
        if (res.ok && !cancelled) {
          const rows = (await res.json()) as DbApp[];
          const match = appId
            ? rows.find(r => r.landlord_display_id === appId)
            : rows[0];
          setAppData(match ?? null);
        }
      } catch {}
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [router.isReady, appId]);

  const retailerAppId = appData?.retailer_display_id ?? "";

  // Load + subscribe to chat
  useEffect(() => {
    if (!retailerAppId) return;
    let cancelled = false;

    async function loadChat() {
      try {
        const res = await fetch(`/api/chat/${retailerAppId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json() as { messages: ChatRow[] };
        if (!cancelled) setMessages(data.messages.map(rowToDisplay));
      } catch {}
    }
    loadChat();

    const channel = supabase
      .channel(`chat-landlord-${retailerAppId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        loadChat();
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [retailerAppId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Booking confirmation banner — read from localStorage (set by retailer's
  // scheduleBookingPage) for instant UI; the canonical row lives in DB.
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState<string | null>(null);
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!retailerAppId) return;
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
    check();
    const timer = setInterval(check, 2000);
    window.addEventListener("storage", check);
    return () => { clearInterval(timer); window.removeEventListener("storage", check); };
  }, [retailerAppId]);

  async function handleSend() {
    if (!chatInput.trim() || !retailerAppId) return;
    const text = chatInput.trim();
    setChatInput("");
    // Optimistic add
    const now = new Date();
    setMessages(prev => [...prev, {
      from: "landlord", name: user?.name ?? "Landlord",
      time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      text,
    }]);
    try {
      await fetch(`/api/chat/${retailerAppId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderRole: "landlord",
          senderName: user?.name ?? "Landlord",
          userId:     user?.id,
          content:    text,
        }),
      });
    } catch {/* optimistic remains */}
  }

  if (loading) {
    return (
      <LandlordBackofficeLayout>
        <div className="flex items-center justify-center py-24 text-sm text-on-surface-variant">
          Loading application…
        </div>
      </LandlordBackofficeLayout>
    );
  }

  if (!appData) {
    return (
      <LandlordBackofficeLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="material-symbols-outlined text-outline/30 text-[48px]">folder_open</span>
          <p className="text-sm font-semibold text-on-surface-variant">Application not found.</p>
          <Link href="/landlord_backoffice/landlordApplicationsPage" className="text-xs text-primary underline">
            Back to Applications
          </Link>
        </div>
      </LandlordBackofficeLayout>
    );
  }

  const storeName     = appData.retailer_profiles?.business_name ?? "";
  const applicantName = appData.retailer_profiles?.users?.name ?? "Tenant";
  const category      = appData.retailer_profiles?.category ?? "";
  const stationName   = appData.station_units?.stations?.name ?? "";
  const unitCode      = appData.station_units?.unit_code ?? "";
  const panelColor    = appData.panel_color || "#4a5568";

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
        <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: panelColor }}>
          <span className="material-symbols-outlined text-white text-[28px]">storefront</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-lime-400 mb-1">Approved Applicant</div>
          <h1 className="text-xl font-bold text-white">{storeName}</h1>
          <p className="text-sm text-white/70">{applicantName} · {category} · {stationName}, Unit {unitCode}</p>
        </div>
        <span className="flex-shrink-0 bg-lime-400/20 text-lime-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
          {appData.landlord_display_id}
        </span>
      </div>

      {bookingConfirmed && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-5 py-3 mb-5 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
          <div>
            <div className="text-sm font-bold text-on-surface">Walkthrough confirmed</div>
            <div className="text-xs text-on-surface-variant">{confirmedDate} at {confirmedTime}</div>
          </div>
        </div>
      )}

      {/* Chat */}
      <div>
        <div className="bg-white rounded-2xl shadow-sm flex flex-col h-[500px]">
          <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
            <div>
              <div className="text-sm font-bold text-on-surface">Booking Discussion</div>
              <div className="text-xs text-on-surface-variant">with {applicantName}</div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-xs text-on-surface-variant py-8">
                No messages yet — say hello!
              </div>
            )}
            {messages.map((m, i) => (
              <div key={m.id ?? i} className={`flex ${m.from === "landlord" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[72%] flex flex-col ${m.from === "landlord" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.from === "landlord"
                      ? "bg-[#1C3A1C] text-white rounded-tr-md"
                      : "bg-[#F5F2EB] text-on-surface rounded-tl-md"
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-on-surface-variant mt-1">{m.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
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
              disabled={!chatInput.trim()}
              className="w-9 h-9 rounded-full bg-[#1C3A1C] text-white border-0 cursor-pointer flex items-center justify-center hover:brightness-105 flex-shrink-0 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>

    </LandlordBackofficeLayout>
  );
}
