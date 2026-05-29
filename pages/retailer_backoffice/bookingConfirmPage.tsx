import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

type ApplyResult = {
  retailerDisplayId: string;
  stationName: string;
  unitCode: string;
  unitLabel: string;
  bizName: string;
  submittedAt: string;
};

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    });
  } catch { return iso; }
}

export default function BookingConfirmPage() {
  const router = useRouter();
  const [result, setResult] = useState<ApplyResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("ptg_apply_result");
    if (!raw) { router.replace("/retailer_backoffice/myApplicationsPage"); return; }
    try {
      setResult(JSON.parse(raw));
      // Clear session data after reading
      localStorage.removeItem("ptg_apply_session");
      localStorage.removeItem("ptg_apply_result");
    } catch { router.replace("/retailer_backoffice/myApplicationsPage"); }
  }, [router]);

  if (!result) return null;

  return (
    <RetailerBackofficeLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6 shadow-lg">
          <span className="material-symbols-outlined text-white text-4xl">check</span>
        </div>

        <h1 className="text-3xl font-bold text-on-surface mb-2">Application Submitted!</h1>
        <p className="text-sm text-on-surface-variant mb-8 max-w-md">
          Your lease application for <strong>{result.unitCode} — {result.unitLabel}</strong> at {result.stationName} has been received.
          Our team will review your application within 3–5 business days.
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-lg mb-6 text-left">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Reservation Summary</div>
          <div className="space-y-3 text-sm mb-4">
            {[
              ["Reference No.", result.retailerDisplayId],
              ["Unit",          `${result.unitCode} — ${result.unitLabel}`],
              ["Station",       result.stationName],
              ["Applicant",     result.bizName],
              ["Submitted",     fmt(result.submittedAt)],
              ["Status",        "Under Review"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-on-surface-variant">{k}</span>
                <span className={`font-medium ${k === "Status" ? "text-amber-600" : "text-on-surface"}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-outline-variant/20 mb-4" />
          <div className="flex items-center gap-2 overflow-x-auto">
            {["Submitted", "Under Review", "Approved", "Finalized"].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex flex-col items-center gap-1 min-w-fit">
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

        <div className="flex gap-4">
          <Link href="/retailer_backoffice/myApplicationsPage">
            <button type="button" className="bg-primary text-white font-bold px-6 py-3 rounded-full text-sm cursor-pointer border-0 hover:brightness-105">
              Track My Application
            </button>
          </Link>
          <Link href="/retailer_backoffice/exploreLocationPage">
            <button type="button" className="border border-outline-variant text-on-surface font-medium px-6 py-3 rounded-full text-sm cursor-pointer bg-white hover:bg-surface-container-low">
              Explore More Locations
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
