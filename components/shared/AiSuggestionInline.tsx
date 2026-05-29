"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/authContext";
import { useStationFilter } from "@/lib/stationFilterContext";
import { useStoreFilter } from "@/lib/storeFilterContext";
import { useLanguage } from "@/lib/languageContext";
import FormattedAiText from "@/components/shared/FormattedAiText";

interface Props {
  role:        "retailer" | "landlord";
  pageContext: string;
  dataContext: string;  // actual page data fed to AI; used as fallback on error
  label?:      string;
  lang?:       "en" | "th";  // when set, summary is generated in this language
}

export default function AiSuggestionInline({ role, pageContext, dataContext, label, lang }: Props) {
  const { user }      = useAuth();
  const { stationId } = useStationFilter();
  const { storeId }   = useStoreFilter();
  const { lang: uiLang } = useLanguage();
  const [summary,  setSummary]  = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);

  // Friendly safety-net shown when the AI summary can't be generated — never
  // surface the raw pipe-delimited dataContext to the user.
  const fallback = uiLang === "th"
    ? "สรุปจะอัปเดตอีกครั้งในไม่ช้า"
    : "Summary will refresh shortly.";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSummary(null);

    // Don't ask the AI to summarise nothing — wait until the page data has
    // loaded. Firing with an empty dataContext makes the model say "no data"
    // and (because the cache key is data-independent) poisons the cached value.
    if (!dataContext || !dataContext.trim()) {
      return () => { cancelled = true; };
    }

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
            lang,
          }),
        });
        const data = await res.json() as { summary?: string; error?: string };
        if (!cancelled) setSummary(data.summary ?? fallback);
      } catch {
        if (!cancelled) setSummary(fallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    generate();
    return () => { cancelled = true; };
  // Re-generate whenever the store filter, station filter, language, or underlying data changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, stationId, dataContext, lang]);

  return (
    <div className="bg-[#D9EDD9] rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className="material-symbols-outlined text-[14px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_awesome
        </span>
        <span className="text-[9px] font-bold tracking-widest text-primary">{label ?? "AI SUGGESTION"}</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-1.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      ) : (
        <FormattedAiText text={summary ?? ""} className="text-xs text-on-surface-variant leading-relaxed" />
      )}
    </div>
  );
}
