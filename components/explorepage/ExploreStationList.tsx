import Link from "next/link";
import { STATIONS } from "@/lib/stations";

function StationCard({ station }: { station: typeof STATIONS[0] }) {
  return (
    <Link
      href={`/stationdetailpage/${station.id}`}
      className="no-underline block text-inherit"
    >
      <div
        id={`ptg-station-card-${station.id}`}
        data-station-id={station.id}
        data-province={station.province}
        data-traffic={station.traffic_level}
        data-spaces={String(station.spaces_count)}
        className="group bg-white rounded-xl border border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      >
        <div className="relative h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={station.image}
            alt={station.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
              <span className="material-symbols-outlined text-[12px] fill-icon">verified</span>
              PTG Verified
            </span>
            <span className="bg-primary text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
              {station.match_badge}
            </span>
          </div>
          <button
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center hover:bg-white hover:text-error transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">favorite</span>
          </button>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-on-surface">{station.title}</h3>
              <p className="text-xs text-outline font-medium">{station.location}</p>
            </div>
            <span
              className={`${station.traffic_badge_class} px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter`}
            >
              {station.traffic_badge}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">aspect_ratio</span>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-widest">{station.max_area[0]}</p>
                <p className="text-sm font-bold text-on-surface">{station.max_area[1]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">storefront</span>
              <div>
                <p className="text-[10px] text-outline uppercase font-bold tracking-widest">{station.available[0]}</p>
                <p className="text-sm font-bold text-on-surface">{station.available[1]}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <span className="flex-1 text-center bg-gradient-to-tr from-primary to-primary-container text-white text-xs font-bold py-3 rounded-lg hover:brightness-110 transition-all active:scale-95 inline-block w-full">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ExploreStationList() {
  return (
    <section>
      <div className="w-[480px] h-full bg-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-surface-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-on-surface tracking-tight">
                Browse Locations
              </h1>
              <p className="text-sm text-outline mt-1">
                Showing 1,247 locations across Thailand
              </p>
            </div>
            <button
              type="button"
              className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant">tune</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                id="ptg-explore-filter-province"
                className="appearance-none bg-surface-container-low border-none rounded-full px-4 py-2 text-xs font-medium pr-8 focus:ring-1 focus:ring-primary/30 cursor-pointer"
              >
                <option value="all">All Provinces</option>
                <option value="Bangkok">Bangkok</option>
                <option value="Nonthaburi">Nonthaburi</option>
                <option value="Pathum Thani">Pathum Thani</option>
                <option value="Samut Prakan">Samut Prakan</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-outline cursor-pointer">
                expand_more
              </span>
            </div>
            <div className="relative">
              <select
                id="ptg-explore-filter-traffic"
                className="appearance-none bg-surface-container-low border-none rounded-full px-4 py-2 text-xs font-medium pr-8 focus:ring-1 focus:ring-primary/30 cursor-pointer"
              >
                <option value="all">All Traffic</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-outline cursor-pointer">
                expand_more
              </span>
            </div>
            <div className="relative">
              <select
                id="ptg-explore-filter-spaces"
                className="appearance-none bg-surface-container-low border-none rounded-full px-4 py-2 text-xs font-medium pr-8 focus:ring-1 focus:ring-primary/30 cursor-pointer"
              >
                <option value="all">All Spaces</option>
                <option value="2">2+ Spaces</option>
                <option value="5">5+ Spaces</option>
                <option value="10">10+ Spaces</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none text-outline cursor-pointer">
                expand_more
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {STATIONS.map((s) => (
            <StationCard key={s.id} station={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
