import Link from "next/link";
import { STATIONS } from "@/lib/stations";
import featuredBg from "@/components/image/featured-section-bg.png";

function OpportunityCard({ station }: { station: typeof STATIONS[0] }) {
  const spacesLower = station.available[1].toLowerCase();
  const n = parseInt(String(station.detail.daily_customers).replace(",", ""), 10);
  const footfall = isNaN(n) ? `${station.detail.daily_customers}+` : `${n.toLocaleString("en-US")}+`;

  return (
    <Link
      href={`/stationdetailpage/${station.id}`}
      className="no-underline block text-inherit"
    >
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-lime-500/20 transition-all hover:-translate-y-1 border border-outline-variant/10 hover:border-lime-400/50">
        <div className="relative aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={station.image}
            alt={station.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded tracking-wider">
              PTG Verified
            </span>
            <span className="px-2 py-1 bg-on-secondary-container text-white text-[10px] font-bold uppercase rounded tracking-wider">
              {station.match_badge}
            </span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-headline text-xl text-on-surface">{station.title}</h4>
            <span className="text-primary font-headline text-lg">{spacesLower}</span>
          </div>
          <div className="text-on-surface-variant text-sm flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {station.location}
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-on-surface-variant font-bold">Max Area</span>
              <span className="text-sm font-bold text-on-surface">{station.max_area[1]}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-on-surface-variant font-bold">Daily Footfall</span>
              <span className="text-sm font-bold text-on-surface">{footfall}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedOpportunities() {
  const featured = STATIONS.slice(0, 3);
  return (
    <section
      className="featured-opportunities-section relative overflow-hidden py-40 px-8"
      style={{ backgroundImage: `url(${featuredBg.src})` }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-end mb-16 flex-wrap gap-6">
          <div>
            <h2 className="text-5xl text-on-surface mb-4">Featured Opportunities</h2>
            <p className="text-on-surface-variant text-lg">
              High-potential locations available for lease this week.
            </p>
          </div>
          <Link
            href="/explorepage/explorePage"
            className="btn-lime-text-link inline-flex items-center justify-center bg-transparent text-primary font-bold hover:gap-3 transition-all border-0 cursor-pointer rounded-md no-underline"
          >
            <span className="flex items-center gap-2">
              View All Locations
              <span className="material-symbols-outlined">chevron_right</span>
            </span>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {featured.map((s) => (
            <OpportunityCard key={s.id} station={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
