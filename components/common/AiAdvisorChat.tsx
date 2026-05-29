"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { useStoreFilter } from "@/lib/storeFilterContext";
import { useStationFilter } from "@/lib/stationFilterContext";
import FormattedAiText from "@/components/shared/FormattedAiText";

type Message = { role: "user" | "assistant"; text: string };

const PAGE_MAP: Record<string, string> = {
  "/explorepage/explorePage":                      "Explore Locations — which station suits me",
  "/stationdetailpage/[station_id]":               "Station Detail — is this station right for me",
  "/retailer_backoffice/retailerDashboardPage":    "Retailer Dashboard",
  "/retailer_backoffice/performancePage":          "Performance Analytics",
  "/retailer_backoffice/mlPredictionsPage":        "ML Predictions",
  "/retailer_backoffice/myApplicationsPage":       "My Applications",
  "/retailer_backoffice/exploreLocationPage":      "Explore Locations",
  "/retailer_backoffice/slotSelectionPage":        "Slot Selection",
  "/retailer_backoffice/confirmApplyPage":         "Confirm Application",
  "/retailer_backoffice/bookingConfirmPage":       "Application Submitted",
  "/retailer_backoffice/retailerProfileSetupPage": "Business Profile Setup",
  "/retailer_backoffice/scheduleChatPage":         "Schedule a Chat",
  "/landlord_backoffice/landlordOverviewPage":     "Executive Overview",
  "/landlord_backoffice/landlordApplicationsPage": "Tenant Applications",
  "/landlord_backoffice/landlordTenantsPage":      "Tenant Management",
  "/landlord_backoffice/landlordRevenuePage":      "Revenue Portfolio",
  "/landlord_backoffice/landlordMyStationsPage":   "My Stations",
};

const WELCOME: Record<"retailer" | "landlord", string> = {
  retailer:
    "Hi! I'm your retail advisor. I have access to your live revenue, lease, and customer data. Ask me anything about your shop performance, trends, or what to do next.",
  landlord:
    "Hi! I'm your property advisor. I have access to your live portfolio data — tenants, leases, station metrics. Ask me anything about your stations, revenue, or tenant health.",
};

const PERSONA: Record<"retailer" | "landlord", string> = {
  retailer: "Retail Intelligence",
  landlord: "Property Intelligence",
};

export default function AiAdvisorChat() {
  const { user } = useAuth();
  const { storeId } = useStoreFilter();
  const { stationId } = useStationFilter();
  const { pathname } = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const welcomeSent = useRef(false);

  const userType = (user?.type === "landlord" ? "landlord" : "retailer") as "retailer" | "landlord";
  const pageContext = PAGE_MAP[pathname] ?? "Dashboard";
  // Currently-active branch filter: storeId ("STN-xxx") for retailer,
  // stationId (filter_key, e.g. "lat_phrao") for landlord.
  const activeStoreId = userType === "landlord" ? stationId : storeId;

  useEffect(() => {
    if (open && !welcomeSent.current) {
      welcomeSent.current = true;
      setMessages([{ role: "assistant", text: WELCOME[userType] }]);
    }
  }, [open, userType]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:        text,
          role:           userType,
          pageContext,
          activeStoreId,
          conversationId: conversationId ?? undefined,
          userId:         user?.id ?? null,
        }),
      });
      const data = await res.json() as { reply: string; conversationId?: string; error?: string };
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.error ? "Sorry, I'm unavailable right now. Please try again." : data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I'm unavailable right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[900] w-12 h-12 rounded-full primary-gradient shadow-lg flex items-center justify-center cursor-pointer border-0 hover:opacity-90 transition-all hover:shadow-lime-500/30 hover:ring-2 hover:ring-lime-300 hover:ring-offset-2"
        title="AI Advisor"
      >
        <span
          className="material-symbols-outlined text-white text-[22px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {open ? "close" : "chat"}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-[88px] right-6 z-[900] w-[360px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/10"
          style={{ maxHeight: 520 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#1C3A1C]">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-white text-[17px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI Advisor</div>
              <div className="text-[10px] text-white/60">{PERSONA[userType]}</div>
            </div>
            <span className="ml-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-[10px] text-white/50">Live</span>
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF8]" style={{ minHeight: 0, maxHeight: 370 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#1C3A1C] flex items-center justify-center flex-shrink-0 mb-0.5">
                    <span
                      className="material-symbols-outlined text-white text-[12px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      smart_toy
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1C3A1C] text-white rounded-br-none whitespace-pre-line"
                      : "bg-white text-on-surface rounded-bl-none shadow-sm border border-outline-variant/10"
                  }`}
                >
                  {m.role === "assistant" ? <FormattedAiText text={m.text} /> : m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#1C3A1C] flex items-center justify-center flex-shrink-0 mb-0.5">
                  <span className="material-symbols-outlined text-white text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-none px-3.5 py-2.5 shadow-sm border border-outline-variant/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-outline-variant/10 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && send()}
              placeholder="Ask anything..."
              className="flex-1 bg-[#F5F2EB] rounded-full px-4 py-2 text-xs outline-none border-none placeholder:text-on-surface-variant/50"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-full bg-[#1C3A1C] flex items-center justify-center border-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-80"
            >
              <span className="material-symbols-outlined text-white text-[15px]">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
