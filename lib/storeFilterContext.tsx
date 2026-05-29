import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { RETAILER_STORES } from "@/lib/retailerStores";

export type StoreId = string;

export type StoreItem = { id: string; name: string };

// Per-store only — no "All Branches". Static fallback sourced from the store
// config (the /api/retailer/branches response mirrors this).
export const STORE_LIST: StoreItem[] = RETAILER_STORES.map((s) => ({
  id:   s.storeId,
  name: `${s.brand} · ${s.shortName}`,
}));

const DEFAULT_STORE = STORE_LIST[0]?.id ?? "STN-001";

interface StoreFilterCtx {
  storeId:    StoreId;
  setStoreId: (id: StoreId) => void;
  stores:     StoreItem[];
}

const StoreFilterContext = createContext<StoreFilterCtx>({
  storeId:    DEFAULT_STORE,
  setStoreId: () => {},
  stores:     STORE_LIST,
});

export function StoreFilterProvider({ children }: { children: ReactNode }) {
  const [storeId, setStoreId] = useState<StoreId>(DEFAULT_STORE);
  const [stores,  setStores]  = useState<StoreItem[]>(STORE_LIST);

  useEffect(() => {
    fetch("/api/retailer/branches")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StoreItem[] | null) => {
        if (data && data.length > 0) {
          setStores(data);
          // keep current selection if still valid, else default to first store
          setStoreId((cur) => (data.some((s) => s.id === cur) ? cur : data[0].id));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <StoreFilterContext.Provider value={{ storeId, setStoreId, stores }}>
      {children}
    </StoreFilterContext.Provider>
  );
}

export function useStoreFilter() {
  return useContext(StoreFilterContext);
}
