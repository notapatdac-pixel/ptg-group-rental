import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type StationId = string;

export type StationItem = { id: string; name: string };

// Per-station only — no "All Stations". Static fallback (also used by
// landlordApplicationsPage for its STATION_NAME map); the live list comes from
// /api/landlord/stations.
export const STATION_LIST: StationItem[] = [
  { id: "lat_phrao", name: "PTG Lat Phrao 71"    },
  { id: "sukhumvit", name: "PTG Sukhumvit 62"    },
  { id: "rama9",     name: "PTG Rama 9"          },
  { id: "bang_na",   name: "PTG Bang Na Complex" },
  { id: "main",      name: "PTG Main Station"    },
];

const DEFAULT_STATION = STATION_LIST[0]?.id ?? "lat_phrao";

interface StationFilterCtx {
  stationId:    StationId;
  setStationId: (id: StationId) => void;
  stations:     StationItem[];
}

const StationFilterContext = createContext<StationFilterCtx>({
  stationId:    DEFAULT_STATION,
  setStationId: () => {},
  stations:     STATION_LIST,
});

export function StationFilterProvider({ children }: { children: ReactNode }) {
  const [stationId, setStationId] = useState<StationId>(DEFAULT_STATION);
  const [stations,  setStations]  = useState<StationItem[]>(STATION_LIST);

  useEffect(() => {
    fetch("/api/landlord/stations")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StationItem[] | null) => {
        if (data && data.length > 0) {
          setStations(data);
          setStationId((cur) => (data.some((s) => s.id === cur) ? cur : data[0].id));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <StationFilterContext.Provider value={{ stationId, setStationId, stations }}>
      {children}
    </StationFilterContext.Provider>
  );
}

export function useStationFilter() {
  return useContext(StationFilterContext);
}
