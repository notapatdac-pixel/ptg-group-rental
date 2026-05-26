import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { STATIONS_DATA } from "@/components/landlord_backoffice/stationsData";
import Link from "next/link";
import latphrao71Img from "@/components/image/station-ptg-latphrao71.png";
import ramaIxImg from "@/components/image/station-ptg-ramaix.png";
import { useLanguage } from "@/lib/languageContext";

const STATION_IMAGES: Record<string, string> = {
  "PTG Lat Phrao 71": latphrao71Img.src,
  "PTG Sukhumvit 62": ramaIxImg.src,
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

export default function LandlordMyStationsPage() {
  const { lang } = useLanguage();
  const T = STRINGS[lang];
  const stationEntries = Object.values(STATIONS_DATA);

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
              <div className="bg-[#1C3A1C] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[14px] text-lime-300" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="text-[9px] font-bold tracking-widest text-lime-300">{T.aiSuggestion}</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  {lang === "th" ? st.aiNoteTh : st.aiNote}
                </p>
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
