import { useState, useEffect } from "react";
import NavBar from "@/components/common/NavBar";
import ExploreStationList from "@/components/explorepage/ExploreStationList";
import ExploreLeafletMap, { MarkerItem } from "@/components/explorepage/ExploreLeafletMap";
import AiAdvisorChat from "@/components/common/AiAdvisorChat";
import { STATIONS_BY_ID, markersForLeaflet } from "@/lib/stations";

type ApiStation = {
  id: string;
  name: string;
  location: string;
  trafficLevel: string;
  lat: number;
  lng: number;
  occupied: number;
  total: number;
};

export default function ExplorePage() {
  const [liveMarkers, setLiveMarkers] = useState<MarkerItem[]>(() => markersForLeaflet());

  useEffect(() => {
    fetch("/api/stations")
      .then((res) => res.json())
      .then((stations: ApiStation[]) => {
        const mapped: MarkerItem[] = stations.map((station) => {
          const staticStation = STATIONS_BY_ID[station.id];
          return {
            id: station.id,
            title: station.name,
            province: station.location,
            traffic_level: station.trafficLevel,
            spaces_count: station.total - station.occupied,
            lat: station.lat,
            lng: station.lng,
            location: station.location,
            traffic_badge:
              station.trafficLevel === "high" ? "High Traffic" : "Medium Traffic",
            match_badge: staticStation?.match_badge ?? "99% Match",
            image: staticStation?.image ?? "",
          };
        });
        if (mapped.length > 0) {
          setLiveMarkers(mapped);
        }
      })
      .catch(() => {
        // keep static fallback already in state
      });
  }, []);

  return (
    <div className="bg-surface text-on-surface antialiased">
      <NavBar showSearch />
      <div className="flex h-screen pt-20">
        <div className="relative flex-1">
          <ExploreLeafletMap markers={liveMarkers} />
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              id="ptg-explore-zoom-in-btn"
              type="button"
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">add</span>
            </button>
            <button
              id="ptg-explore-zoom-out-btn"
              type="button"
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">remove</span>
            </button>
            <button
              id="ptg-explore-loc-btn"
              type="button"
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">my_location</span>
            </button>
          </div>
        </div>
        <ExploreStationList />
      </div>
      <AiAdvisorChat />
    </div>
  );
}
