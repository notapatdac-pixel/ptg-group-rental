import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import Link from "next/link";
import latphrao71Img from "@/components/image/station-ptg-latphrao71.png";
import ramaIxImg from "@/components/image/station-ptg-ramaix.png";
import { useLanguage } from "@/lib/languageContext";

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

const STATIONS = [
  {
    name: "PTG Lat Phrao 71",
    location: "Lat Phrao Road, Bangkok",
    image: latphrao71Img.src,
    occupied: 4,
    total: 5,
    aiSuggestion: "Primary catchment is office workers and families in the Lat Phrao corridor. Best fit: quick-service restaurants, grab-and-go coffee, or mid-sized convenience retail with strong morning and evening trade.",
    aiSuggestionTh: "กลุ่มลูกค้าหลักในพื้นที่ Lat Phrao คือคนทำงานออฟฟิศและครอบครัว ประเภทร้านที่เหมาะสม ได้แก่ ร้านอาหารบริการเร็ว กาแฟสะดวกซื้อ หรือร้านสะดวกซื้อขนาดกลางที่ขายดีช่วงเช้าและเย็น",
  },
  {
    name: "PTG Sukhumvit 62",
    location: "Sukhumvit Road, Bangkok",
    image: ramaIxImg.src,
    occupied: 8,
    total: 8,
    aiSuggestion: "High-footfall BTS-adjacent location with a strong expat community. Ideal for international dining, premium bakeries, or wellness-focused tenants such as pharmacies or wellness cafés targeting higher spending power.",
    aiSuggestionTh: "ทำเลติด BTS มีผู้อาศัยชาวต่างชาติหนาแน่น เหมาะสำหรับร้านอาหารนานาชาติ เบเกอรี่พรีเมียม หรือร้านสุขภาพ เช่น ร้านยาหรือคาเฟ่เพื่อสุขภาพ ที่รองรับกำลังซื้อสูง",
  },
];

export default function LandlordMyStationsPage() {
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  return (
    <LandlordBackofficeLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">{T.title}</h1>
      </div>

      {/* Station cards */}
      <div className="grid grid-cols-2 gap-6">
        {STATIONS.map((st) => (
          <div key={st.name} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="rounded-t-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={st.image} alt={st.name} className="w-full h-48 object-cover" />
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
              <div className="bg-[#F5F2EB] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="text-[9px] font-bold tracking-widest text-primary">{T.aiSuggestion}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {lang === "th" ? st.aiSuggestionTh : st.aiSuggestion}
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
