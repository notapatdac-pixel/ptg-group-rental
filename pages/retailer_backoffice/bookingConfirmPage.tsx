import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import Link from "next/link";

export default function BookingConfirmPage() {
  return (
    <RetailerBackofficeLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        {/* Success icon */}
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="material-symbols-outlined text-white text-4xl">check</span>
        </div>

        <h1 className="text-3xl font-bold text-on-surface mb-2">Application Submitted!</h1>
        <p className="text-sm text-on-surface-variant mb-8 max-w-md">
          Your lease application for <strong>A2 — Pop-up Corner</strong> at Rama 9 Station has been received.
          Our team will review your application within 3–5 business days.
        </p>

        {/* Reservation card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-lg mb-6 text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Reservation Summary</div>
          <div className="space-y-3 text-sm mb-4">
            {[
              ["Reference No.", "PTG-APP-2025-4821"],
              ["Unit", "A2 — Pop-up Corner, Rama 9"],
              ["Applicant", "Coffee Corner Co., Ltd."],
              ["Submitted", "Oct 26, 2025 · 14:32 ICT"],
              ["Status", "Under Review"],
              ["Hold Expires", "Oct 28, 2025 · 14:32 ICT"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-on-surface-variant">{k}</span>
                <span className={`font-medium ${k === "Status" ? "text-amber-600" : "text-on-surface"}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-outline-variant/20 mb-4" />
          {/* Progress steps */}
          <div className="flex items-center gap-2">
            {["Submitted", "Under Review", "Approved", "Finalized"].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface-variant"}`}>
                    {i === 0 ? <span className="material-symbols-outlined text-[12px]">check</span> : i + 1}
                  </div>
                  <span className="text-[9px] text-on-surface-variant whitespace-nowrap">{step}</span>
                </div>
                {i < 3 && <div className="flex-1 h-0.5 mb-4 bg-outline-variant/20" />}
              </div>
            ))}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="bg-[#F5F2EB] rounded-2xl w-full max-w-lg h-36 mb-6 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-primary text-3xl block mb-1">location_on</span>
            <div className="text-sm font-medium text-on-surface">Rama 9 Station</div>
            <div className="text-xs text-on-surface-variant">Pathumgao, Thailand</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/retailer_backoffice/myApplicationsPage">
            <button type="button" className="bg-primary text-white font-bold px-6 py-3 rounded-full text-sm cursor-pointer border-0 hover:brightness-105">
              Track My Application
            </button>
          </Link>
          <Link href="/retailer_backoffice/approvedDocsPage">
            <button type="button" className="border border-outline-variant text-on-surface font-medium px-6 py-3 rounded-full text-sm cursor-pointer bg-white hover:bg-surface-container-low">
              Upload More Documents
            </button>
          </Link>
        </div>

        <p className="text-xs text-on-surface-variant mt-6">
          Confirmation sent to <strong>notapat.dac@gmail.com</strong>
        </p>
      </div>
    </RetailerBackofficeLayout>
  );
}
