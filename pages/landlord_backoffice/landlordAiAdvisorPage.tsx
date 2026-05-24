import LandlordBackofficeLayout from "@/components/landlord_backoffice/LandlordBackofficeLayout";

const RECOMMENDATIONS = [
  { icon: "trending_up", title: "Optimize Rama 9 Pricing", body: "Unit B2 is underpriced by 14% compared to similar transit hubs. Adjust to market rate at next renewal to capture 58K THB additional annual income.", link: "Review pricing →" },
  { icon: "apartment", title: "Vacancy Opportunity", body: "Unit A3 at On Nut Central has been vacant 45 days. AI recommends targeting convenience or F&B tenants — 3 matching applicants in your pipeline.", link: "View applicants →" },
  { icon: "people", title: "Tenant Retention Alert", body: "FreshMart's lease expires in 45 days. Based on payment history and foot traffic correlation, AI gives 72% retention probability without proactive engagement.", link: "Initiate renewal →" },
];

export default function LandlordAiAdvisorPage() {
  return (
    <LandlordBackofficeLayout>
      <h1 className="text-3xl font-bold text-on-surface mb-8">AI Landlord Advisor</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface border border-on-surface/20 rounded-full px-3 py-1 mb-4 inline-block">LIVE PORTFOLIO INTELLIGENCE</span>
            <p className="text-2xl font-bold italic text-on-surface mt-4 mb-4 leading-snug">
              &ldquo;Your Rama 9 station is generating 23% above the PTG network median — consider expansion.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span>PORTFOLIO SCORE</span><span className="text-base font-extrabold ml-1">91</span>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>RENTAL INCOME +18% YOY</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Strategic Recommendations</h3>
            <div className="grid grid-cols-3 gap-4">
              {RECOMMENDATIONS.map((r) => (
                <div key={r.title} className="bg-[#F5F2EB] rounded-xl p-4 flex flex-col">
                  <span className="material-symbols-outlined text-primary text-xl mb-2">{r.icon}</span>
                  <h4 className="text-sm font-semibold text-on-surface mb-2">{r.title}</h4>
                  <p className="text-xs text-on-surface-variant flex-1">{r.body}</p>
                  <button type="button" className="text-xs text-primary font-semibold mt-3 text-left bg-transparent border-0 cursor-pointer p-0">{r.link}</button>
                </div>
              ))}
            </div>
          </div>

          {/* AI chat bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <input
                placeholder="Ask about your portfolio…"
                className="flex-1 bg-[#F5F2EB] rounded-full px-4 py-2.5 text-sm border-none outline-none"
              />
              <button type="button" className="w-9 h-9 bg-primary rounded-full flex items-center justify-center border-0 cursor-pointer">
                <span className="material-symbols-outlined text-white text-sm">send</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Which unit has highest ROI?", "When should I renegotiate leases?", "Best tenant mix for Rama 9?"].map((p) => (
                <button key={p} type="button" className="text-xs bg-surface-container-low text-on-surface-variant px-3 py-1.5 rounded-full border-none cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right dark panel */}
        <div className="space-y-4">
          <div className="bg-[#1C3A1C] rounded-2xl p-6 text-white">
            <h3 className="font-semibold mb-3">Q4 Market Outlook</h3>
            <p className="text-sm text-white/70 mb-6 leading-relaxed">
              Retail footfall at transit hubs is projected to grow 11% in Q4 due to holiday travel patterns. Premium F&B and convenience tenants will see highest revenue uplift.
            </p>
            <button type="button" className="w-full bg-lime-400 text-[#1C3A1C] text-xs font-bold py-2.5 rounded-full cursor-pointer border-0 hover:brightness-105">
              View Full Forecast →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Portfolio Health</h3>
            <div className="space-y-3">
              {[
                { label: "Occupancy Rate", score: 87, color: "bg-primary" },
                { label: "Avg Tenant AI Score", score: 84, color: "bg-primary" },
                { label: "Payment Timeliness", score: 96, color: "bg-primary" },
                { label: "Lease Renewal Rate", score: 78, color: "bg-lime-400" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant">{m.label}</span>
                    <span className="font-bold text-on-surface">{m.score}%</span>
                  </div>
                  <div className="h-2 bg-outline-variant/20 rounded-full">
                    <div className={`h-2 ${m.color} rounded-full`} style={{ width: `${m.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LandlordBackofficeLayout>
  );
}
