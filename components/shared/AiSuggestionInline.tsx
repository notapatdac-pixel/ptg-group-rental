"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useStationFilter } from "@/lib/stationFilterContext";
import { useStoreFilter } from "@/lib/storeFilterContext";

interface Props {
  role:        "retailer" | "landlord";
  pageContext: string;
  dataContext: string;  // actual page data fed to AI; used as fallback on error
  label?:      string;
}

export default function AiSuggestionInline({ role, pageContext, dataContext, label }: Props) {
  const { user }      = useAuth();
  const { stationId } = useStationFilter();
  const { storeId }   = useStoreFilter();
  const [summary,  setSummary]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSummary(null);

    async function generate() {
      try {
        const res = await fetch("/api/ai/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationFilterKey: stationId,
            storeFilterKey:   storeId,
            pageData:         dataContext,
            userId:           user?.id ?? null,
            role,
            pageContext,
          }),
        });
        const data = await res.json() as { summary?: string; error?: string };
        if (!cancelled) setSummary(data.summary ?? dataContext);
      } catch {
        if (!cancelled) setSummary(dataContext);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    generate();
    return () => { cancelled = true; };
  // Re-generate whenever the store filter, station filter, or underlying data changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, stationId, dataContext]);

  return (
    <div className="bg-[#1C3A1C] rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="material-symbols-outlined text-[14px] text-lime-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <span className="text-[9px] font-bold tracking-widest text-lime-300">{label ?? "AI SUGGESTION"}</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-1.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      ) : (
        <p className="text-xs text-white/80 leading-relaxed">{summary}</p>
      )}
    </div>
  );
}
