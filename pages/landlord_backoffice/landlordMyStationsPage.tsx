import { useState, useEffect } from "react";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import Link from "next/link";
import latphrao71Img from "@/components/image/station-ptg-latphrao71.png";
import ramaIxImg from "@/components/image/station-ptg-ramaix.png";
import bangnaImg from "@/components/image/station-ptg-bangna.png";
import { useLanguage } from "@/lib/languageContext";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";

const STATION_IMAGES: Record<string, string> = {
  "PTG Lat Phrao 71":    latphrao71Img.src,
  "PTG Rama 9":          ramaIxImg.src,
  "PTG Bang Na Complex": bangnaImg.src,
};

const STRINGS = {
  en: {
    title: "Stations Performance",
    aiSuggestion: "AI SUGGESTION",
    occupancy: "OCCUPANCY",
    units: "units",
    editDetails: "Edit Details",
  },
  th: {
    title: "ประสิทธิภาพสาขา",
    aiSuggestion: "คำแนะนำ AI",
    occupancy: "การใช้งาน",
    units: "ยูนิต",
    editDetails: "แก้ไขรายละเอียด",
  },
} as const;

type ApiStation = {
  id: string;
  filterKey: string;
  name: string;
  location: string;
  occupied: number;
  total: number;
};

type StoreTypeFit = {
  category: string;
  categoryTh: string;
  fitScore: number;
  reason: string;
  reasonTh: string;
};

type FitStation = {
  name: string;
  recommended: StoreTypeFit[];
};

type StationEntry = {
  name: string;
  location: string;
  occupied: number;
  total: number;
  aiNote: string;
  aiNoteTh: string;
};

export default function LandlordMyStationsPage() {
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  const [stationEntries, setStationEntries] = useState<StationEntry[]>([]);

  useEffect(() => {
    async function loadStations() {
      try {
        // Occupancy from /api/stations; location-aware store-type fit (which
        // store suits this station and WHY — what's nearby) from station-fit.
        const [stationsRes, fitRes] = await Promise.all([
          fetch("/api/stations"),
          fetch("/api/landlord/station-fit?stationId=all"),
        ]);
        if (!stationsRes.ok) return;
        const data = await stationsRes.json() as ApiStation[];
        const fit = fitRes.ok ? (await fitRes.json() as { all?: FitStation[] }) : { all: [] };
        const fitByName: Record<string, StoreTypeFit[]> = {};
        for (const f of fit.all ?? []) fitByName[f.name] = f.recommended;

        setStationEntries(
          data.map(st => {
            const recs = (fitByName[st.name] ?? []).slice(0, 2);
            // Each reason already leads with the neighbourhood (e.g. "right by a
            // university…"), so the AI suggestion explains which store to find
            // for this station and WHY based on what's nearby.
            const fitEn = recs.length
              ? " Best-fit store types for this location: " +
                recs.map(r => `${r.category} (${r.fitScore}% fit) — ${r.reason}`).join(" ")
              : "";
            const fitTh = recs.length
              ? " ประเภทร้านที่เหมาะกับทำเลนี้: " +
                recs.map(r => `${r.categoryTh} (เหมาะ ${r.fitScore}%) — ${r.reasonTh}`).join(" ")
              : "";
            return {
              name: st.name,
              location: st.location,
              occupied: st.occupied,
              total: st.total,
              aiNote: `${st.name}: ${st.occupied}/${st.total} units occupied at ${st.location}.${fitEn}`,
              aiNoteTh: `${st.name}: ${st.occupied}/${st.total} ยูนิตถูกใช้งาน ที่ ${st.location}${fitTh}`,
            };
          })
        );
      } catch {}
    }
    loadStations();
  }, []);

  return (
    <LandlordBackofficeLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">{T.title}</h1>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {stationEntries.map((st) => (
          <div key={st.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="rounded-t-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={STATION_IMAGES[st.name] ?? latphrao71Img.src} alt={st.name} className="w-full h-48 object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-xl font-bold text-on-surface">{st.name}</div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
                    <span className="text-xs text-on-surface-variant">{st.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] font-bold tracking-widest text-on-surface-variant uppercase">{T.occupancy}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-on-surface">{st.occupied}</span>
                    <span className="text-sm text-on-surface-variant self-end pb-0.5">/ {st.total} {T.units}</span>
                  </div>
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="mb-4">
                <AiSuggestionInline
                  role="landlord"
                  pageContext={`My Stations — ${st.name}`}
                  dataContext={lang === "th" ? st.aiNoteTh : st.aiNote}
                  label={T.aiSuggestion}
                />
              </div>

              <Link
                href={`/landlord_backoffice/landlordEditStationPage?name=${encodeURIComponent(st.name)}`}
                className="no-underline block w-full text-center bg-surface-container-low border border-outline-variant/40 rounded-full px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                {T.editDetails}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </LandlordBackofficeLayout>
  );
}
