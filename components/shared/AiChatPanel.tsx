"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/authContext";

interface Message {
  role:    "user" | "assistant";
  content: string;
}

interface Props {
  role:           "retailer" | "landlord";
  pageContext?:   string;
  placeholder?:  string;
  suggestions?:  string[];
}

export default function AiChatPanel({ role, pageContext, placeholder, suggestions }: Props) {
  const { user } = useAuth();
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          role,
          pageContext,
          conversationId,
          userId: user?.id ?? null,
        }),
      });
      const data = await res.json() as { reply: string; conversationId: string | null; error?: string };
      if (data.error) throw new Error(data.error);
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      {/* Message thread */}
      {messages.length > 0 && (
        <div className="max-h-64 overflow-y-auto flex flex-col gap-2 pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3.5 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-white"
                    : "bg-[#F5F2EB] text-on-surface"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#F5F2EB] text-on-surface-variant px-3.5 py-2 rounded-xl text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                Thinking…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={placeholder ?? "Ask a question…"}
          className="flex-1 bg-[#F5F2EB] rounded-full px-4 py-2.5 text-sm border-none outline-none"
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-9 h-9 bg-primary rounded-full flex items-center justify-center border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-white text-sm">send</span>
        </button>
      </div>

      {/* Suggestion chips — only when no messages yet */}
      {messages.length === 0 && suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="text-xs bg-surface-container-low text-on-surface-variant px-3 py-1.5 rounded-full border-none cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
