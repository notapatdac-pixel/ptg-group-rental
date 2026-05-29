import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import { useAuth } from "@/lib/authContext";

type ApplySession = {
  stationId: string;
  stationName: string;
  stationLoc: string;
  unitId: string;
  unitCode: string;
  unitLabel: string;
  areaSqm: number;
  priceThb: number;
  leaseType: string;
};

export default function ConfirmApplyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [session, setSession]       = useState<ApplySession | null>(null);
  const [bizName, setBizName]       = useState("");
  const [concept, setConcept]       = useState("");
  const [startDate, setStartDate]   = useState("");
  const [leaseDur, setLeaseDur]     = useState("12 Months");
  const [hours, setHours]           = useState("08:00–20:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("ptg_apply_session");
    if (!raw) { router.replace("/retailer_backoffice/exploreLocationPage"); return; }
    try {
      const s: ApplySession = JSON.parse(raw);
      setSession(s);
    } catch { router.replace("/retailer_backoffice/exploreLocationPage"); }

    // Fetch profile from API (with localStorage as fallback)
    async function loadProfile() {
      try {
        const res = await fetch(`/api/retailer/profile?userId=${user?.id ?? ""}`);
        if (res.ok) {
          const p = await res.json();
          if (p.businessName) setBizName(p.businessName);
          if (p.concept)      setConcept(p.concept);
          return;
        }
      } catch {}
      // Fallback to localStorage
      const profileRaw = localStorage.getItem("ptg_retailer_profiles");
      if (profileRaw) {
        try {
          const profiles = JSON.parse(profileRaw);
          const profile = Array.isArray(profiles) ? profiles[0] : profiles;
          if (profile?.businessName) setBizName(profile.businessName);
          if (profile?.concept)      setConcept(profile.concept);
        } catch {}
      }
    }
    loadProfile();
  }, [router, user]);

  async function handleSubmit() {
    if (!session) return;
    if (!bizName.trim()) { setError("Please enter your legal business name."); return; }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/retailer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationUnitId: session.unitId,
          concept:       concept || undefined,
        }),
      });

      if (res.status === 409) {
        setError("An active application already exists for this unit. Please choose a different unit.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const err = await res.json();
        setError(err.error ?? "Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }

      const result = await res.json();
      localStorage.setItem("ptg_apply_result", JSON.stringify({
        retailerDisplayId: result.retailerDisplayId,
        stationName:       session.stationName,
        unitCode:          session.unitCode,
        unitLabel:         session.unitLabel,
        bizName:           bizName.trim(),
        submittedAt:       result.submittedAt,
      }));

      router.push("/retailer_backoffice/bookingConfirmPage");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (!session) return null;

  const service  = Math.round(session.priceThb * 0.17);
  const deposit  = session.priceThb * 3;

  return (
    <RetailerBackofficeLayout>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/retailer_backoffice/slotSelectionPage?stationId=${session.stationId}`}
            className="text-on-surface-variant text-sm hover:text-on-surface"
          >
            ← Back to Slot Selection
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-on-surface">Confirm Application</h1>
        <p className="text-sm text-on-surface-variant mt-1">Review your unit selection and complete your retailer details.</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main form */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Business Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Legal Business Name *</label>
                  <input
                    value={bizName}
                    onChange={e => setBizName(e.target.value)}
                    placeholder="Your registered business name"
                    className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Tax ID</label>
                  <input placeholder="0-0000-00000-00-0" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Registered Address</label>
                <input placeholder="Full registered business address" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Proposed Operations</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Store Concept</label>
                <textarea
                  rows={2}
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Describe your product concept and target customers…"
                  className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Preferred Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Lease Duration</label>
                  <div className="relative">
                    <select
                      value={leaseDur}
                      onChange={e => setLeaseDur(e.target.value)}
                      className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer"
                    >
                      <option>6 Months</option>
                      <option>12 Months</option>
                      <option>24 Months</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Operating Hours</label>
                <div className="flex flex-wrap gap-2">
                  {["06:00–14:00", "08:00–20:00", "10:00–22:00", "24 Hours"].map(h => (
                    <button
                      key={h} type="button"
                      onClick={() => setHours(h)}
                      className={`flex-1 py-2 rounded-full text-xs font-medium cursor-pointer border-0 ${h === hours ? "bg-primary text-white" : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Document Upload</h3>
            <div className="space-y-3">
              {[
                { label: "Business Registration Certificate", required: true },
                { label: "VAT Registration (PP.20)",          required: true },
                { label: "Director's ID Copy",                required: true },
                { label: "Brand Portfolio / Lookbook",        required: false },
              ].map(doc => (
                <div key={doc.label} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">upload_file</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-on-surface">{doc.label}</div>
                    <div className="text-xs text-on-surface-variant">{doc.required ? "Required" : "Optional"}</div>
                  </div>
                  <button type="button" className="text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer">Upload</button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#1C3A1C] text-white font-bold py-4 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit Application →"}
          </button>
        </div>

        {/* Unit summary sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Unit Summary</div>
            <div className="bg-[#F5F2EB] rounded-xl p-4 mb-4">
              <div className="text-lg font-bold text-on-surface">{session.unitCode} — {session.unitLabel}</div>
              <div className="text-sm text-on-surface-variant">{session.stationName}</div>
              <div className="text-xs text-on-surface-variant mt-1">{session.areaSqm} sqm</div>
            </div>
            <div className="space-y-2 text-sm mb-4">
              {[
                ["Monthly Rent",     `฿${session.priceThb.toLocaleString()}`],
                ["Service Charge",   `฿${service.toLocaleString()}`],
                ["Security Deposit", `฿${deposit.toLocaleString()}`],
                ["Lease Term",       leaseDur],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-on-surface-variant">{k}</span>
                  <span className="font-medium text-on-surface">{v}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-outline-variant/20 mb-3" />
            <div className="flex justify-between font-bold text-sm">
              <span>Due at Signing</span>
              <span className="text-primary">฿{(deposit + session.priceThb + service).toLocaleString()}</span>
            </div>
          </div>
          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-xs text-on-surface leading-relaxed">
              <strong>48-hour hold</strong> applied to your selected slot. Submit before the hold expires to secure your unit.
            </p>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
