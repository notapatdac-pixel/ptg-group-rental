import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import type { StationDetail } from "@/pages/api/retailer/station";

type UnitItem = StationDetail["availableUnits"][0];

const AMENITIES = ["3-Phase Power", "HVAC Ready", "Loading Bay", "Fiber"];

export default function SlotSelectionPage() {
  const router = useRouter();
  const { stationId } = router.query as { stationId?: string };

  const [detail, setDetail]         = useState<StationDetail | null>(null);
  const [selectedUnit, setSelected] = useState<UnitItem | null>(null);
  const [loading, setLoading]       = useState(true);

  // Try to restore previously selected unit from session
  useEffect(() => {
    const raw = localStorage.getItem("ptg_apply_session");
    if (raw) {
      try {
        const s = JSON.parse(raw) as { unitId: string };
        if (s.unitId) {
          setSelected({ id: s.unitId } as UnitItem);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!stationId) return;
    setLoading(true);
    fetch(`/api/retailer/station?stationId=${stationId}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: StationDetail | null) => {
        setDetail(d);
        // Resolve selected unit from full data
        if (d) {
          const raw = localStorage.getItem("ptg_apply_session");
          if (raw) {
            try {
              const s = JSON.parse(raw) as { unitId: string };
              const match = d.availableUnits.find(u => u.id === s.unitId);
              if (match) setSelected(match);
              else if (d.availableUnits.length > 0) setSelected(d.availableUnits[0]);
            } catch {
              if (d.availableUnits.length > 0) setSelected(d.availableUnits[0]);
            }
          } else if (d.availableUnits.length > 0) {
            setSelected(d.availableUnits[0]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [stationId]);

  function confirmSelection() {
    if (!detail || !selectedUnit) return;
    localStorage.setItem("ptg_apply_session", JSON.stringify({
      stationId:   detail.displayId,
      stationName: detail.name,
      stationLoc:  detail.location,
      unitId:      selectedUnit.id,
      unitCode:    selectedUnit.unitCode,
      unitLabel:   selectedUnit.unitLabel,
      areaSqm:     selectedUnit.areaSqm,
      priceThb:    selectedUnit.priceThb,
      leaseType:   selectedUnit.leaseType,
    }));
    router.push("/retailer_backoffice/confirmApplyPage");
  }

  // All units for the floor plan (available + others from total)
  const allUnits: Array<{ unit: UnitItem | null; status: "available" | "selected" | "occupied" }> =
    detail
      ? detail.availableUnits.map(u => ({
          unit:   u,
          status: selectedUnit?.id === u.id ? "selected" : "available",
        }))
      : [];

  const STYLE: Record<string, string> = {
    available: "bg-[#F5F2EB] border-outline-variant/30 text-on-surface hover:border-primary hover:bg-primary/5 cursor-pointer",
    selected:  "bg-primary border-primary text-white cursor-pointer",
    occupied:  "bg-outline-variant/10 border-outline-variant/20 text-on-surface-variant cursor-not-allowed",
  };

  const deposit = selectedUnit ? selectedUnit.priceThb * 3 : 0;
  const service = selectedUnit ? Math.round(selectedUnit.priceThb * 0.17) : 0;

  return (
    <RetailerBackofficeLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={stationId ? `/retailer_backoffice/exploreLocationPage?stationId=${stationId}` : "/retailer_backoffice/exploreLocationPage"}
            className="text-on-surface-variant text-sm hover:text-on-surface"
          >
            ← Back to Location
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-on-surface">Select a Unit</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {detail ? `${detail.name} · Choose your preferred retail unit` : "Loading…"}
        </p>
      </div>

      {loading && <div className="text-sm text-on-surface-variant">Loading units…</div>}

      {!loading && detail && (
        <div className="grid grid-cols-3 gap-6">
          {/* Floor plan grid */}
          <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-on-surface">Available Units — {detail.name.replace(/^PTG\s+/, "")}</h3>
              <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" />Selected</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#F5F2EB] inline-block border border-outline-variant/30" />Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-outline-variant/20 inline-block" />Occupied</span>
              </div>
            </div>

            {allUnits.length === 0 ? (
              <div className="py-10 text-center text-sm text-on-surface-variant">No available units at this station.</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {allUnits.map(({ unit, status }) => (
                  <button
                    key={unit!.id}
                    type="button"
                    onClick={() => status !== "occupied" && setSelected(unit!)}
                    disabled={status === "occupied"}
                    className={`rounded-xl border-2 p-5 text-left transition-all ${STYLE[status]}`}
                  >
                    <div className="text-lg font-bold mb-1">{unit!.unitCode}</div>
                    <div className="text-sm font-medium">{unit!.unitLabel}</div>
                    <div className="text-xs opacity-70 mt-1">{unit!.areaSqm} sqm · ฿{unit!.priceThb.toLocaleString()}/mo</div>
                    <div className="text-[10px] font-bold mt-2 uppercase tracking-widest">
                      {status === "selected" ? "Selected ✓" : "Available"}
                    </div>
                  </button>
                ))}
                {/* Pad with occupied placeholders if needed */}
                {Array.from({ length: Math.max(0, detail.occupiedUnits) }).map((_, i) => (
                  <div key={`occ-${i}`} className={`rounded-xl border-2 p-5 ${STYLE.occupied}`}>
                    <div className="text-lg font-bold mb-1 opacity-40">—</div>
                    <div className="text-sm font-medium">Occupied Unit</div>
                    <div className="text-[10px] font-bold mt-2 uppercase tracking-widest">Occupied</div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-[#F5F2EB] rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Unit Amenities</div>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map(a => (
                  <span key={a} className="bg-white text-on-surface text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Unit details panel */}
          <div className="space-y-4">
            {selectedUnit ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Selected Unit</div>
                <h3 className="text-xl font-bold text-on-surface mb-1">{selectedUnit.unitCode} — {selectedUnit.unitLabel}</h3>
                <p className="text-sm text-on-surface-variant mb-4">{detail.name}, {selectedUnit.areaSqm} sqm</p>
                <div className="space-y-2 text-sm mb-4">
                  {[
                    ["Floor Area",       `${selectedUnit.areaSqm} sqm`],
                    ["Monthly Rent",     `฿${selectedUnit.priceThb.toLocaleString()}`],
                    ["Service Charge",   `฿${service.toLocaleString()}`],
                    ["Security Deposit", `฿${deposit.toLocaleString()} (3 mo)`],
                    ["Min. Lease Term",  "3 Months"],
                    ["Fit-out Period",   "14 Days"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-on-surface-variant">{k}</span>
                      <span className="font-medium text-on-surface">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-outline-variant/20 mb-4" />
                <div className="flex justify-between text-sm font-bold mb-4">
                  <span className="text-on-surface">Total Monthly</span>
                  <span className="text-primary">฿{(selectedUnit.priceThb + service).toLocaleString()}</span>
                </div>
                <button
                  type="button"
                  onClick={confirmSelection}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105"
                >
                  Confirm Selection →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm text-sm text-on-surface-variant text-center">
                Select an available unit to see details.
              </div>
            )}

            <div className="bg-[#F5F2EB] rounded-2xl p-4">
              <div className="text-xs text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface">48-hour hold</strong> applied on confirmation. Full application review takes 3–5 business days.
              </div>
            </div>
          </div>
        </div>
      )}
    </RetailerBackofficeLayout>
  );
}
