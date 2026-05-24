import Link from "next/link";
import { Station } from "@/lib/stations";

const BTN_LANDING_GHOST =
  "btn-lime-ghost inline-flex items-center justify-center bg-transparent text-slate-600 dark:text-slate-400 font-sans text-sm px-4 py-2.5 border-0 cursor-pointer rounded-md transition-colors";
const BTN_LANDING_PRIMARY =
  "inline-flex items-center justify-center primary-gradient text-white px-6 py-2.5 rounded-md text-sm font-bold shadow-sm border-0 cursor-pointer transition-all hover:shadow-lime-500/40 hover:ring-2 hover:ring-lime-300 hover:ring-offset-2 hover:ring-offset-white/80 active:scale-95";

export default function StationDetailHeader({ station }: { station: Station }) {
  return (
    <div>
      <nav className="flex items-center gap-2 mb-6">
        <Link
          href="/explorepage/explorePage"
          className="text-on-surface-variant text-sm hover:text-primary cursor-pointer"
        >
          Explore
        </Link>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface text-sm font-medium">{station.title}</span>
      </nav>
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        <div className="flex-1">
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-2 tracking-tight">
            {station.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="text-base">{station.region_line}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-surface-container-high px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">trending_up</span>
                Traffic: {station.traffic_badge_short}
              </span>
              <span className="bg-primary-container/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                PTG Verified
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0 flex-wrap">
          <button type="button" className={BTN_LANDING_GHOST}>
            Save
          </button>
          <button type="button" className={BTN_LANDING_PRIMARY}>
            Sign in to Apply
          </button>
        </div>
      </div>
    </div>
  );
}
