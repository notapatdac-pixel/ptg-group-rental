import { createContext, useContext, useState, type ReactNode } from "react";

export const STATION_LIST = [
  { id: "all",       name: "All Stations"        },
  { id: "lat_phrao", name: "PTG Lat Phrao 71"    },
  { id: "sukhumvit", name: "PTG Sukhumvit 62"    },
  { id: "rama9",     name: "PTG Rama 9"          },
  { id: "bang_na",   name: "PTG Bang Na Complex" },
  { id: "main",      name: "PTG Main Station"    },
] as const;

export type StationId = (typeof STATION_LIST)[number]["id"];

interface StationFilterCtx {
  stationId: StationId;
  setStationId: (id: StationId) => void;
}

const StationFilterContext = createContext<StationFilterCtx>({
  stationId: "all",
  setStationId: () => {},
});

export function StationFilterProvider({ children }: { children: ReactNode }) {
  const [stationId, setStationId] = useState<StationId>("all");
  return (
    <StationFilterContext.Provider value={{ stationId, setStationId }}>
      {children}
    </StationFilterContext.Provider>
  );
}

export function useStationFilter() {
  return useContext(StationFilterContext);
}
