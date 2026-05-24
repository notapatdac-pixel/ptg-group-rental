import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import Link from "next/link";

const UNITS = [
  { id: "A", label: "Corner Unit", sqm: 72, rent: "฿36,500/mo", status: "occupied" },
  { id: "B", label: "Mid Unit", sqm: 38, rent: "฿18,000/mo", status: "under_contract" },
  { id: "C", label: "Compact Unit", sqm: 48, rent: "฿8,500/mo", status: "selected" },
  { id: "D", label: "Express Bay", sqm: 24, rent: "฿12,000/mo", status: "reserved" },
];

const STATUS_COLOR: Record<string, string> = {
  occupied: "bg-outline-variant/10 border-outline-variant/30 text-on-surface-variant cursor-not-allowed",
  under_contract: "bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed",
  selected: "bg-primary border-primary text-white",
  reserved: "bg-outline-variant/10 border-outline-variant/30 text-on-surface-variant cursor-not-allowed",
};

const STATUS_LABEL: Record<string, string> = {
  occupied: "Occupied",
  under_contract: "Under Contract",
  selected: "Selected ✓",
  reserved: "Reserved",
};

const AMENITIES = ["3-Phase Power", "HVAC Ready", "Loading Bay", "Fiber"];

export default function SlotSelectionPage() {
  const selected = UNITS.find((u) => u.status === "selected")!;

  return (
    <RetailerBackofficeLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/retailer_backoffice/exploreLocationPage" className="text-on-surface-variant text-sm hover:text-on-surface">← Back to Location</Link>
        </div>
        <h1 className="text-3xl font-bold text-on-surface">Select a Unit</h1>
        <p className="text-sm text-on-surface-variant mt-1">PTG Station Lat Phrao 71 · Choose your preferred retail unit</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Floor plan grid */}
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-on-surface">Floor Plan – Ground Level</h3>
            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" />Selected</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 inline-block border border-amber-200" />Under Contract</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-outline-variant/20 inline-block" />Occupied / Reserved</span>
            </div>
          </div>

          <div className="text-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30 pb-1 px-4">Main Entrance</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {UNITS.map((unit) => (
              <button
                key={unit.id}
                type="button"
                disabled={unit.status !== "selected"}
                className={`rounded-xl border-2 p-6 text-left transition-all ${STATUS_COLOR[unit.status]}`}
              >
                <div className="text-xl font-bold mb-1">Unit {unit.id}</div>
                <div className="text-sm font-medium">{unit.label}</div>
                <div className="text-xs opacity-70 mt-1">{unit.sqm} sqm · {unit.rent}</div>
                <div className="text-[10px] font-bold mt-2 uppercase tracking-widest">{STATUS_LABEL[unit.status]}</div>
              </button>
            ))}
          </div>

          {/* Amenities */}
          <div className="bg-[#F5F2EB] rounded-xl p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Unit Amenities</div>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
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
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Selected Unit</div>
            <h3 className="text-xl font-bold text-on-surface mb-1">Unit {selected.id} — {selected.label}</h3>
            <p className="text-sm text-on-surface-variant mb-4">Lat Phrao 71, Ground Level</p>
            <div className="space-y-2 text-sm mb-4">
              {[
                ["Floor Area", `${selected.sqm} sqm`],
                ["Monthly Rent", "฿15,000"],
                ["Service Charge", "฿2,500"],
                ["Security Deposit", "฿45,000 (3 mo)"],
                ["Min. Lease Term", "3 Months"],
                ["Fit-out Period", "14 Days"],
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
              <span className="text-primary">฿17,500</span>
            </div>
            <Link href="/retailer_backoffice/confirmApplyPage">
              <button type="button" className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
                Confirm Selection →
              </button>
            </Link>
          </div>

          <div className="bg-[#F5F2EB] rounded-2xl p-4">
            <div className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">48-hour hold</strong> applied on confirmation. Full application review takes 3–5 business days.
            </div>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
