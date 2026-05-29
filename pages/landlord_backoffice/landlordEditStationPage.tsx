import { useRef, useState } from "react";
import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";
import { STATIONS_DATA, type StationUnit } from "@/components/landlord_backoffice/stationsData";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";
import latphrao71Img from "@/components/image/station-ptg-latphrao71.png";
import ramaIxImg from "@/components/image/station-ptg-ramaix.png";
import Link from "next/link";
import { useRouter } from "next/router";

const STATION_IMAGES: Record<string, string> = {
  "PTG Lat Phrao 71": latphrao71Img.src,
  "PTG Sukhumvit 62": ramaIxImg.src,
};

const STATUS_STYLE: Record<string, string> = {
  occupied: "bg-primary/10 text-primary",
  vacant: "bg-amber-100 text-amber-700",
};

const UNIT_TYPES = ["Premium Kiosk", "Pop-up Corner", "Express Counter", "Standard Kiosk", "Boutique Unit", "Flagship Store", "Highway Frontage"];

// ── Editable unit row ──────────────────────────────────────────────
function UnitRow({
  unit,
  onEdit,
  onDelete,
}: {
  unit: StationUnit;
  onEdit: (u: StationUnit) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StationUnit>(unit);

  function save() {
    onEdit(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Unit ID</label>
            <input
              value={draft.id}
              onChange={e => setDraft(d => ({ ...d, id: e.target.value }))}
              className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Type</label>
            <select
              value={draft.type}
              onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
              className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
            >
              {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Size (sqm)</label>
            <input
              type="number"
              value={draft.sqm}
              onChange={e => setDraft(d => ({ ...d, sqm: Number(e.target.value) }))}
              className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Rent (THB/mo)</label>
            <input
              type="number"
              value={draft.rent}
              onChange={e => setDraft(d => ({ ...d, rent: Number(e.target.value) }))}
              className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Status</label>
            <select
              value={draft.status}
              onChange={e => setDraft(d => ({ ...d, status: e.target.value as "occupied" | "vacant", tenant: e.target.value === "vacant" ? null : d.tenant }))}
              className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
            >
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Tenant</label>
            <input
              value={draft.tenant ?? ""}
              disabled={draft.status === "vacant"}
              onChange={e => setDraft(d => ({ ...d, tenant: e.target.value || null }))}
              placeholder="Tenant name"
              className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none disabled:opacity-40"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={save} className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full border-0 cursor-pointer">Save</button>
          <button onClick={() => setEditing(false)} className="text-xs text-on-surface-variant px-3 py-1.5 rounded-full border border-outline-variant/30 bg-white cursor-pointer">Cancel</button>
          <button onClick={() => onDelete(unit.id)} className="ml-auto text-xs text-error px-3 py-1.5 rounded-full border border-error/30 bg-white cursor-pointer">Delete</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-on-surface flex-shrink-0">
        {unit.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-on-surface">{unit.type} · {unit.sqm} sqm</div>
        <div className="text-xs text-on-surface-variant truncate">{unit.tenant ?? "Vacant"}</div>
      </div>
      <div className="text-sm font-medium text-on-surface text-right flex-shrink-0">
        {unit.rent.toLocaleString()} <span className="text-[10px] text-on-surface-variant">THB/mo</span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[unit.status]}`}>
        {unit.status}
      </span>
      <button type="button" onClick={() => setEditing(true)} className="text-on-surface-variant hover:text-primary bg-transparent border-0 cursor-pointer flex-shrink-0 p-0">
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
    </div>
  );
}

// ── Add Unit inline form ───────────────────────────────────────────
const BLANK_UNIT: Omit<StationUnit, "id"> = { type: "Standard Kiosk", sqm: 20, rent: 40000, status: "vacant", tenant: null };

function AddUnitForm({ onAdd, onCancel }: { onAdd: (u: StationUnit) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<StationUnit>({ id: "", ...BLANK_UNIT });

  function submit() {
    if (!draft.id.trim()) return;
    onAdd({ ...draft, tenant: draft.status === "vacant" ? null : draft.tenant });
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-4 space-y-3 mt-2">
      <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">New Unit</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Unit ID</label>
          <input
            value={draft.id}
            onChange={e => setDraft(d => ({ ...d, id: e.target.value.toUpperCase() }))}
            placeholder="e.g. D1"
            className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Type</label>
          <select
            value={draft.type}
            onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
            className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
          >
            {UNIT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Size (sqm)</label>
          <input
            type="number"
            value={draft.sqm}
            onChange={e => setDraft(d => ({ ...d, sqm: Number(e.target.value) }))}
            className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Rent (THB/mo)</label>
          <input
            type="number"
            value={draft.rent}
            onChange={e => setDraft(d => ({ ...d, rent: Number(e.target.value) }))}
            className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Status</label>
          <select
            value={draft.status}
            onChange={e => setDraft(d => ({ ...d, status: e.target.value as "occupied" | "vacant" }))}
            className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none"
          >
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Tenant</label>
          <input
            value={draft.tenant ?? ""}
            disabled={draft.status === "vacant"}
            onChange={e => setDraft(d => ({ ...d, tenant: e.target.value || null }))}
            placeholder="Tenant name"
            className="w-full bg-white rounded-lg px-3 py-2 text-sm border border-outline-variant/30 outline-none disabled:opacity-40"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button onClick={submit} className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full border-0 cursor-pointer">Add Unit</button>
        <button onClick={onCancel} className="text-xs text-on-surface-variant px-3 py-1.5 rounded-full border border-outline-variant/30 bg-white cursor-pointer">Cancel</button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function LandlordEditStationPage() {
  const { query } = useRouter();
  const stationName = typeof query.name === "string" ? query.name : "PTG Lat Phrao 71";
  const station = STATIONS_DATA[stationName] ?? STATIONS_DATA["PTG Lat Phrao 71"];
  const stationImage = STATION_IMAGES[station.name] ?? latphrao71Img.src;

  // ── form state ──
  const [form, setForm] = useState({
    fullName: station.fullName,
    province: station.province,
    type: station.type,
    area: station.area,
    hours: station.hours,
  });
  const [units, setUnits] = useState<StationUnit[]>(station.units);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [photos, setPhotos] = useState<string[]>([stationImage]);
  const [saved, setSaved] = useState(false);

  const photoInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const occupiedCount = units.filter(u => u.status === "occupied").length;
  const occupancyPct = units.length > 0 ? Math.round((occupiedCount / units.length) * 100) : 0;
  const totalRevenue = units.filter(u => u.status === "occupied").reduce((s, u) => s + u.rent, 0);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleEditUnit(updated: StationUnit) {
    setUnits(us => us.map(u => u.id === updated.id ? updated : u));
  }

  function handleDeleteUnit(id: string) {
    setUnits(us => us.filter(u => u.id !== id));
  }

  function handleAddUnit(u: StationUnit) {
    setUnits(us => [...us, u]);
    setShowAddUnit(false);
  }

  function handlePhotoChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos(prev => {
      const next = [...prev];
      next[idx] = url;
      return next;
    });
  }

  return (
    <LandlordBackofficeLayout key={stationName}>
      {/* Save toast */}
      {saved && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Changes saved
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/landlord_backoffice/landlordMyStationsPage"
            className="no-underline flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface mb-2 w-fit"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            My Stations
          </Link>
          <h1 className="text-3xl font-bold text-on-surface">{station.name}</h1>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
            <span className="text-sm text-on-surface-variant">{station.location}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-full border-0 cursor-pointer hover:brightness-105 active:scale-95 transition-all"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="col-span-2 space-y-6">

          {/* Station banner */}
          <div className="rounded-2xl overflow-hidden h-48 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[0] ?? stationImage} alt={station.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-5">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1 rounded-full">
                {form.type}
              </span>
            </div>
          </div>

          {/* Station Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-5">Station Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                  Station Name
                </label>
                <input
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Province
                  </label>
                  <div className="relative">
                    <select
                      value={form.province}
                      onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                      className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer"
                    >
                      <option>Bangkok</option>
                      <option>Chiang Mai</option>
                      <option>Phuket</option>
                      <option>Samut Prakan</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Station Type
                  </label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer"
                    >
                      <option>Premium Transit Hub</option>
                      <option>Community Station</option>
                      <option>Highway Stop</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Total Retail Area (sqm)
                  </label>
                  <input
                    type="number"
                    value={form.area}
                    onChange={e => setForm(f => ({ ...f, area: Number(e.target.value) }))}
                    className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">
                    Operating Hours
                  </label>
                  <input
                    value={form.hours}
                    onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
                    className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Unit Inventory */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-on-surface">Unit Inventory</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{occupiedCount} occupied · {units.length - occupiedCount} vacant</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUnit(v => !v)}
                className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer flex items-center gap-1 hover:bg-primary/20 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">{showAddUnit ? "close" : "add"}</span>
                {showAddUnit ? "Cancel" : "Add Unit"}
              </button>
            </div>
            <div className="space-y-2.5">
              {units.map(unit => (
                <UnitRow key={unit.id} unit={unit} onEdit={handleEditUnit} onDelete={handleDeleteUnit} />
              ))}
              {units.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant text-sm">No units yet. Add your first unit above.</div>
              )}
            </div>
            {showAddUnit && (
              <AddUnitForm onAdd={handleAddUnit} onCancel={() => setShowAddUnit(false)} />
            )}
          </div>

          {/* Station Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Station Photos</h3>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => photoInputRefs[i]?.current?.click()}>
                  <input
                    ref={photoInputRefs[i]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handlePhotoChange(i, e)}
                  />
                  {photos[i] ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photos[i]} alt={`Station photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-2xl">edit</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#F5F2EB] flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-outline text-2xl">add_photo_alternate</span>
                      <span className="text-xs text-on-surface-variant">Add Photo</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Quick Stats (live from state) */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Station Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-on-surface-variant">Occupancy</span>
                  <span className="font-bold text-on-surface">{occupiedCount} / {units.length} units</span>
                </div>
                <div className="h-2 bg-outline-variant/20 rounded-full">
                  <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="text-[10px] text-on-surface-variant mt-1">{occupancyPct}% occupied</div>
              </div>
              {[
                { label: "Monthly Revenue",  value: `฿${(totalRevenue / 1000).toFixed(0)}K` },
                { label: "Daily Footfall",   value: station.footfall },
                { label: "Retail Area",      value: `${form.area.toLocaleString()} sqm` },
                { label: "Operating Hours",  value: form.hours },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm border-t border-outline-variant/10 pt-3">
                  <span className="text-on-surface-variant">{label}</span>
                  <span className="font-semibold text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestion — real Gemini summary based on the station's live edit form */}
          <AiSuggestionInline
            role="landlord"
            pageContext={`Edit Station — ${station.name}`}
            dataContext={[
              `Station: ${station.name}`,
              `Location: ${station.location}`,
              `Type: ${form.type}`,
              `Province: ${form.province}`,
              `Operating hours: ${form.hours}`,
              `Total retail area: ${form.area} sqm`,
              `Units: ${units.length} total, ${occupiedCount} occupied (${occupancyPct}%)`,
              `Monthly rental revenue from occupied units: ฿${totalRevenue.toLocaleString()}`,
              `Vacant units: ${units.filter((u) => u.status === "vacant").map((u) => `${u.id} (${u.type}, ${u.sqm} sqm, ฿${u.rent.toLocaleString()}/mo)`).join("; ") || "none"}`,
            ].join(" | ")}
          />

        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
