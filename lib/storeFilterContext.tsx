import { createContext, useContext, useState, type ReactNode } from "react";

export const STORE_LIST = [
  { id: "all",    name: "All Stores",             station: "" },
  { id: "coffee", name: "Coffee Corner",           station: "Rama IX" },
  { id: "quick",  name: "Quick Mart",              station: "Ari Station" },
  { id: "lumina", name: "Lumina Artisan Roastery", station: "STN-005" },
] as const;

export type StoreId = (typeof STORE_LIST)[number]["id"];

interface StoreFilterCtx {
  storeId: StoreId;
  setStoreId: (id: StoreId) => void;
}

const StoreFilterContext = createContext<StoreFilterCtx>({
  storeId: "all",
  setStoreId: () => {},
});

export function StoreFilterProvider({ children }: { children: ReactNode }) {
  const [storeId, setStoreId] = useState<StoreId>("all");
  return (
    <StoreFilterContext.Provider value={{ storeId, setStoreId }}>
      {children}
    </StoreFilterContext.Provider>
  );
}

export function useStoreFilter() {
  return useContext(StoreFilterContext);
}
