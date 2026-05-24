import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { STATIONS_DATA, type StationUnit } from "@/components/landlord_backoffice/stationsData";
import latphrao71Img from "@/components/image/station-ptg-latphrao71.png";
import ramaIxImg from "@/components/image/station-ptg-ramaix.png";
import Link from "next/link";
import { useRouter } from "next/router";

const STATION_IMAGES: Record<string, string> = {
  "PTG Lat Phrao 71":  latphrao71Img.src,
  "PTG Sukhumvit 62":  ramaIxImg.src,
};

const STATUS_STYLE: Record<string, string> = {
  occupied: "bg-primary/10 text-primary",
  vacant:   "bg-amber-100 text-amber-700",
};

function UnitRow({ unit }: { unit: StationUnit }) {
  return (
    <div className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-on-surface flex-shrink-0">
        {unit.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-on-surface">{unit.type} · {unit.sqm} sqm</div>
        <div className="text-xs text-on-surface-variant truncate">{unit.tenant ?? "Vacant"}</div>
      </div>
      <div className="text-sm font-medium text-on-surface text-right flex-shrink-0">
        {unit.rent.toLocaleString()} <span className="text-[10px] text-on-surface-variant">THB/mo</span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[unit.status]}`}>
        {unit.status}
      </span>
      <button type="button" className="text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer flex-shrink-0 p-0">
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
    </div>
  );
}

export default function LandlordEditStationPage() {
  const { query } = useRouter();
  const stationName = typeof query.name === "string" ? query.name : "PTG Lat Phrao 71";
  const station = STATIONS_DATA[stationName] ?? STATIONS_DATA["PTG Lat Phrao 71"];

  const occupancyPct = Math.round((station.occupied / station.total) * 100);
  const stationImage = STATION_IMAGES[station.name] ?? latphrao71Img.src;

  return (
    <LandlordBackofficeLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/landlord_backoffice/landlordMyStationsPage"
            className="no-underline flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface mb-2 w-fit"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            My Stations
          </Link>
          <h1 className="text-3xl font-bold text-on-surface">{station.name}</h1>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
            <span className="text-sm text-on-surface-variant">{station.location}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="border border-outline-variant text-on-surface text-sm font-medium px-5 py-2 rounded-full bg-white cursor-pointer hover:bg-[#F5F2EB] transition-colors">
            Discard
          </button>
          <button type="button" className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="col-span-2 space-y-6">

          {/* Station banner */}
          <div className="rounded-2xl overflow-hidden h-48 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stationImage} alt={station.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1 rounded-full">
                {station.type}
              </span>
            </div>
          </div>

          {/* Station Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-5">Station Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                  Station Name
                </label>
                <input
                  defaultValue={station.fullName}
                  className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Province
                  </label>
                  <div className="relative">
                    <select defaultValue={station.province} className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer">
                      <option>Bangkok</option>
                      <option>Chiang Mai</option>
                      <option>Phuket</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Station Type
                  </label>
                  <div className="relative">
                    <select defaultValue={station.type} className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer">
                      <option>Premium Transit Hub</option>
                      <option>Community Station</option>
                      <option>Highway Stop</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Total Retail Area (sqm)
                  </label>
                  <input type="number" defaultValue={station.area} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Operating Hours
                  </label>
                  <input defaultValue={station.hours} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Unit Inventory */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-on-surface">Unit Inventory</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{station.occupied} occupied · {station.total - station.occupied} vacant</p>
              </div>
              <button type="button" className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer flex items-center gap-1 hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>Add Unit
              </button>
            </div>
            <div className="space-y-2.5">
              {station.units.map((unit) => (
                <UnitRow key={unit.id} unit={unit} />
              ))}
            </div>
          </div>

          {/* Station Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Station Photos</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-video rounded-xl overflow-hidden relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stationImage} alt="Station" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-2xl">edit</span>
                </div>
              </div>
              {[1, 2].map((i) => (
                <div key={i} className="aspect-video bg-[#F5F2EB] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined text-outline text-2xl">add_photo_alternate</span>
                  <span className="text-xs text-on-surface-variant">Add Photo</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Station Stats</h3>
            <div className="space-y-4">
              {/* Occupancy visual */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-on-surface-variant">Occupancy</span>
                  <span className="font-bold text-on-surface">{station.occupied} / {station.total} units</span>
                </div>
                <div className="h-2 bg-outline-variant/20 rounded-full">
                  <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="text-[10px] text-on-surface-variant mt-1">{occupancyPct}% occupied</div>
              </div>
              {/* Metrics */}
              {[
                { label: "Monthly Revenue",  value: `฿${station.revenue}` },
                { label: "Daily Footfall",   value: station.footfall },
                { label: "Retail Area",      value: `${station.area.toLocaleString()} sqm` },
                { label: "Operating Hours",  value: station.hours },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-t border-outline-variant/10 pt-3">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-semibold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestion */}
          <div className="bg-[#1C3A1C] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="material-symbols-outlined text-[14px] text-lime-300" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <div className="text-[10px] font-bold uppercase tracking-widest text-lime-300">AI Suggestion</div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{station.aiNote}</p>
          </div>

        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
