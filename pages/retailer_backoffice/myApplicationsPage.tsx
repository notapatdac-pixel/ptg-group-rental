import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const APPLICATIONS = [
  {
    id: 1,
    badge: "ACTIVE APPLICATION",
    badgeColor: "bg-primary/10 text-primary",
    title: "Rama 9 Station – Retail",
    location: "Pathumgao, Thailand",
    applied: "Oct 24, 2023",
    type: "Premium Kiosk (30 sqm)",
    duration: "24 Months",
    steps: ["SUBMITTED", "REVIEWING", "APPROVED", "BOOKING"],
    progress: 3,
    bgColor: "bg-blue-100",
  },
  {
    id: 2,
    badge: "UNDER REVIEW",
    badgeColor: "bg-amber-100 text-amber-700",
    title: "Sukhumvit Prime",
    location: "Sukhumvit, Bangkok",
    applied: "Nov 12, 2023",
    type: "Pop-up Corner (8 sqm)",
    duration: "6 Months",
    steps: ["SUBMITTED", "REVIEWING", "APPROVED", "BOOKING"],
    progress: 2,
    bgColor: "bg-amber-50",
  },
];

export default function MyApplicationsPage() {
  return (
    <RetailerBackofficeLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">My Applications</h1>
        <p className="text-sm text-on-surface-variant mt-1">Track and manage your retail space applications across premium locations.</p>
      </div>

      <div className="space-y-5">
        {APPLICATIONS.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`h-32 ${app.bgColor} flex items-end p-5 relative`}>
              <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${app.badgeColor}`}>
                {app.badge}
              </span>
              <div>
                <h3 className="text-xl font-bold text-on-surface">{app.title}</h3>
                <p className="text-sm text-on-surface-variant">{app.location} | Applied: {app.applied}</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6 mb-5 text-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Lease Type</span>
                  <div className="font-medium text-on-surface">{app.type}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Duration</span>
                  <div className="font-medium text-on-surface">{app.duration}</div>
                </div>
              </div>
              {/* Progress steps */}
              <div className="flex items-center gap-2">
                {app.steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < app.progress ? "bg-primary text-white" : "bg-outline-variant/20 text-on-surface-variant"}`}>
                        {i < app.progress ? <span className="material-symbols-outlined text-[12px]">check</span> : i + 1}
                      </div>
                      <span className="text-[9px] text-on-surface-variant whitespace-nowrap">{step}</span>
                    </div>
                    {i < app.steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 ${i < app.progress - 1 ? "bg-primary" : "bg-outline-variant/20"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="fixed bottom-8 right-8 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center border-0 cursor-pointer hover:brightness-105">
        <span className="material-symbols-outlined text-xl">add</span>
      </button>
    </RetailerBackofficeLayout>
  );
}
