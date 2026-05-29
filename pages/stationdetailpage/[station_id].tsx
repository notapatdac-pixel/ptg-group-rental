import { useState, useEffect } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import AiAdvisorChat from "@/components/common/AiAdvisorChat";
import StationDetailHeader from "@/components/stationdetailpage/StationDetailHeader";
import StationDetailKpiSection from "@/components/stationdetailpage/StationDetailKpiSection";
import TrafficTrendChart from "@/components/stationdetailpage/TrafficTrendChart";
import StationDetailSpacesSection from "@/components/stationdetailpage/StationDetailSpacesSection";
import LocationSpecTable from "@/components/stationdetailpage/LocationSpecTable";
import { STATIONS_BY_ID, type Station } from "@/lib/stations";

type LiveUnit = {
  id: string;
  unitCode: string;
  unitLabel: string;
  areaSqm: number;
  priceThb: number;
  leaseType: string;
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: Object.keys(STATIONS_BY_ID).map((id) => ({
    params: { station_id: id },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ station: Station }> = ({ params }) => {
  const id = params?.station_id as string;
  const station = STATIONS_BY_ID[id];
  if (!station) return { notFound: true };
  return { props: { station } };
};

export default function StationDetailPage({ station }: { station: Station }) {
  const [liveUnits, setLiveUnits] = useState<LiveUnit[] | null>(null);
  const [unitLoading, setUnitLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/retailer/station?stationId=${station.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setLiveUnits(data?.availableUnits ?? []);
        setUnitLoading(false);
      })
      .catch(() => setUnitLoading(false));
  }, [station.id]);

  function handleApply(unit: LiveUnit) {
    localStorage.setItem(
      "ptg_apply_session",
      JSON.stringify({
        stationId:   station.id,
        stationName: station.title,
        stationLoc:  station.location,
        unitId:      unit.id,
        unitCode:    unit.unitCode,
        unitLabel:   unit.unitLabel,
        areaSqm:     unit.areaSqm,
        priceThb:    unit.priceThb,
        leaseType:   unit.leaseType,
      })
    );
    window.location.href = `/retailer_backoffice/slotSelectionPage?stationId=${station.id}`;
  }

  const isFullyOccupied = station.id === "STN-002";

  return (
    <div className="bg-surface text-on-surface antialiased">
      <NavBar />
      <main className="flex-1 bg-surface text-on-surface font-body min-h-screen relative">
        <div className="relative flex-1 min-h-screen w-full">
          <div className="absolute inset-0 z-0 bg-surface" />
          <div
            className="absolute inset-0 z-[1] bg-cover bg-center bg-no-repeat opacity-[0.11] pointer-events-none"
            style={{ backgroundImage: `url('${station.image}')` }}
          />
          <div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 py-8 pt-28 pb-28">
            <StationDetailHeader station={station} />
            <div className="space-y-12">
              <StationDetailKpiSection station={station} />
              <TrafficTrendChart station={station} />
              <StationDetailSpacesSection station={station} />

              {/* ── Apply for a Unit ── */}
              <div className="rounded-xl overflow-hidden border border-[#1C3A1C]/20 shadow-sm">
                {/* Section header */}
                <div className="bg-[#1C3A1C] px-6 py-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#B8F04A] text-[22px]">store</span>
                  <h4 className="font-headline text-xl text-white">Available Units — Apply Now</h4>
                </div>

                {/* Section body */}
                <div className="bg-[#F5F2EB] px-6 py-6">
                  {unitLoading ? (
                    /* Loading skeleton */
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-16 bg-white rounded-lg animate-pulse opacity-60"
                        />
                      ))}
                    </div>
                  ) : !liveUnits || liveUnits.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                      <span className="material-symbols-outlined text-[#1C3A1C]/40 text-[40px]">
                        {isFullyOccupied ? "hourglass_empty" : "inventory_2"}
                      </span>
                      <p className="text-on-surface-variant text-sm font-medium">
                        {isFullyOccupied
                          ? "All units are currently occupied at this station."
                          : "No units currently available."}
                      </p>
                      {isFullyOccupied && (
                        <button
                          onClick={() => {
                            localStorage.setItem(
                              "ptg_apply_session",
                              JSON.stringify({
                                stationId:   station.id,
                                stationName: station.title,
                                stationLoc:  station.location,
                                waitlist:    true,
                              })
                            );
                            window.location.href = `/retailer_backoffice/slotSelectionPage?stationId=${station.id}`;
                          }}
                          className="mt-1 inline-flex items-center gap-2 bg-[#1C3A1C] text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-[#2a5228] active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">notifications</span>
                          Join Waitlist
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Unit rows */
                    <div className="space-y-3">
                      {liveUnits.map((unit) => (
                        <div
                          key={unit.id}
                          className="bg-white rounded-lg px-5 py-4 flex items-center justify-between gap-4 shadow-sm border border-transparent hover:border-[#1C3A1C]/15 transition-all"
                        >
                          {/* Unit info */}
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="material-symbols-outlined text-[#1C3A1C]/60 text-[20px] shrink-0">
                              storefront
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-on-surface leading-tight">
                                {unit.unitCode}
                              </p>
                              <p className="text-xs text-on-surface-variant truncate">
                                {unit.unitLabel}
                              </p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="hidden sm:flex items-center gap-6 shrink-0">
                            <div className="text-center">
                              <p className="text-xs text-on-surface-variant">Area</p>
                              <p className="text-sm font-semibold text-on-surface">
                                {unit.areaSqm} sqm
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-on-surface-variant">Rent</p>
                              <p className="text-sm font-semibold text-primary">
                                ฿{unit.priceThb.toLocaleString()}/mo
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-on-surface-variant">Lease</p>
                              <p className="text-sm font-semibold text-on-surface capitalize">
                                {unit.leaseType}
                              </p>
                            </div>
                          </div>

                          {/* Mobile price (shown when stats are hidden) */}
                          <div className="sm:hidden text-right shrink-0">
                            <p className="text-sm font-semibold text-primary">
                              ฿{unit.priceThb.toLocaleString()}/mo
                            </p>
                            <p className="text-xs text-on-surface-variant">{unit.areaSqm} sqm</p>
                          </div>

                          {/* Apply button */}
                          <button
                            onClick={() => handleApply(unit)}
                            className="inline-flex items-center gap-1.5 primary-gradient text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm border-0 cursor-pointer transition-all hover:shadow-lime-500/40 hover:ring-2 hover:ring-lime-300 hover:ring-offset-2 hover:ring-offset-white/80 active:scale-95 shrink-0"
                          >
                            Apply
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* ── /Apply for a Unit ── */}

              <LocationSpecTable station={station} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AiAdvisorChat />
    </div>
  );
}
