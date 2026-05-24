import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const DOCS = [
  { name: "Signed Lease Agreement", status: "pending", desc: "Download, sign, and re-upload the lease agreement.", required: true },
  { name: "Business Registration Certificate", status: "approved", desc: "Verified by PTG Legal Team.", required: true },
  { name: "VAT Registration (PP.20)", status: "approved", desc: "Verified by PTG Legal Team.", required: true },
  { name: "Director's ID Copy", status: "pending", desc: "Upload a clear copy of the authorized director's national ID.", required: true },
  { name: "Proof of Insurance", status: "missing", desc: "Upload business liability insurance certificate.", required: true },
  { name: "Brand Portfolio / Lookbook", status: "approved", desc: "On file — no action needed.", required: false },
];

const STATUS_STYLE: Record<string, { pill: string; icon: string }> = {
  approved: { pill: "bg-primary/10 text-primary", icon: "check_circle" },
  pending: { pill: "bg-amber-100 text-amber-700", icon: "schedule" },
  missing: { pill: "bg-red-50 text-red-600", icon: "error" },
};

export default function ApprovedDocsPage() {
  return (
    <RetailerBackofficeLayout>
      {/* Status banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center gap-4">
        <span className="material-symbols-outlined text-amber-600 text-2xl">info</span>
        <div className="flex-1">
          <div className="font-semibold text-amber-800 text-sm">Application Under Review — Action Required</div>
          <div className="text-xs text-amber-700 mt-0.5">3 of 5 required documents are verified. Please upload missing documents to proceed.</div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-3 py-1 rounded-full">3/5 Complete</span>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">Documents & Approvals</h1>
        <p className="text-sm text-on-surface-variant mt-1">PTG-APP-2025-4821 · A2 Pop-up Corner · Rama 9 Station</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Document list */}
        <div className="col-span-2 space-y-3">
          {DOCS.map((doc) => {
            const style = STATUS_STYLE[doc.status];
            return (
              <div key={doc.name} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <span className={`material-symbols-outlined text-2xl ${doc.status === "approved" ? "text-primary" : doc.status === "pending" ? "text-amber-500" : "text-red-400"}`}>{style.icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-on-surface text-sm">{doc.name}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">{doc.desc}</div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.pill}`}>{doc.status}</span>
                {doc.status !== "approved" && (
                  <button type="button" className="text-xs text-primary font-semibold bg-transparent border-0 cursor-pointer whitespace-nowrap">
                    {doc.status === "missing" ? "Upload" : "Re-upload"}
                  </button>
                )}
              </div>
            );
          })}

          {/* Upload zone */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline text-3xl">cloud_upload</span>
            <div className="text-sm font-medium text-on-surface">Drop additional files here</div>
            <div className="text-xs text-on-surface-variant">PDF, JPG, PNG up to 20MB each</div>
            <button type="button" className="mt-1 bg-[#F5F2EB] text-on-surface text-xs font-semibold px-4 py-2 rounded-full border-0 cursor-pointer hover:bg-primary/10">Browse Files</button>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Timeline */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Application Timeline</h3>
            <div className="space-y-4">
              {[
                { label: "Application Submitted", date: "Oct 26, 2025", done: true },
                { label: "Initial Review", date: "Oct 27, 2025", done: true },
                { label: "Document Verification", date: "In Progress", done: false },
                { label: "Legal Approval", date: "Est. Nov 1", done: false },
                { label: "Onboarding & Keys", date: "Est. Nov 15", done: false },
              ].map((t) => (
                <div key={t.label} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${t.done ? "bg-primary" : "bg-outline-variant/20"}`}>
                    {t.done && <span className="material-symbols-outlined text-white text-[11px]">check</span>}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${t.done ? "text-on-surface" : "text-on-surface-variant"}`}>{t.label}</div>
                    <div className="text-[10px] text-on-surface-variant">{t.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist contact */}
          <div className="bg-[#1C3A1C] rounded-2xl p-5 text-white">
            <div className="text-[10px] font-bold uppercase tracking-widest text-lime-300 mb-3">Your PTG Specialist</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-lime-400 rounded-full flex items-center justify-center text-[#1C3A1C] font-bold text-sm">KS</div>
              <div>
                <div className="font-semibold text-sm">Kanya Srisuk</div>
                <div className="text-xs text-white/70">Retail Partnership Manager</div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-white/80 mb-4">
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span>kanya.s@ptg.co.th</div>
              <div className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">phone</span>+66 2-123-4567 ext. 214</div>
            </div>
            <button type="button" className="w-full bg-lime-400 text-[#1C3A1C] text-xs font-bold py-2.5 rounded-full cursor-pointer border-0 hover:brightness-105">
              Schedule a Call
            </button>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
