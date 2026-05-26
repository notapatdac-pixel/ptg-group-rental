import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const RECOMMENDATIONS = [
  { icon: "calendar_today", title: "Optimize Saturday Demand", body: "Target 32% afternoon traffic window with extended promotional bundles to capture the peak 14:00–17:00 footfall segment.", link: "learn more →" },
  { icon: "sell", title: "Dynamic Bundling Opportunity", body: "09:00–13:30 windows present a cross-sell volume increase. Pair beverage + bakery to increase basket size by an estimated 18%.", link: "explore now" },
  { icon: "apartment", title: "Lat Phrao 71 Expansion", body: "100% status in the top-performing cluster. A second retail unit at Lat Phrao 71 would capture 23% more of the existing footfall.", link: "New Insight" },
];

const SUGGESTIONS = [
  "What are my competitors doing?",
  "What is my top retail consultant?",
  "Identify saturation in market",
];

export default function AiAdvisorPage() {
  return (
    <RetailerBackofficeLayout>
      <h1 className="text-3xl font-bold text-on-surface mb-8">AI Retailer Advisor</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Main left panel */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface border border-on-surface/20 rounded-full px-3 py-1 mb-4 inline-block">LIVE INTELLIGENCE REPORT</span>
            <p className="text-2xl font-bold italic text-on-surface mt-4 mb-4 leading-snug">
              &ldquo;Your Coffee Corner segment is performing 18% above rolling average.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span>PATRON SCORE</span><span className="text-base font-extrabold ml-1">92</span>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>REVENUE GROWTH +18%</span>
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

          <div className="bg-[#F5F2EB] rounded-2xl p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#1C3A1C] flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            </div>
            <div>
              <div className="text-sm font-bold text-on-surface mb-0.5">Ask your AI Retail Advisor</div>
              <div className="text-xs text-on-surface-variant">Use the chat button in the bottom-right corner to ask anything about your performance, trends, or expansion opportunities.</div>
            </div>
          </div>
        </div>

        {/* Right dark panel */}
        <div className="bg-[#1C3A1C] rounded-2xl p-6 text-white h-fit">
          <h3 className="font-semibold mb-3">Projected Q4 Shift in Consumer Behavior</h3>
          <p className="text-sm text-white/70 mb-6 leading-relaxed">
            Weekly traffic patterns are trending toward premium coffee and artisan baked goods. Early adopter market in Silom showing strong signals by Quarter 5.
          </p>
          <button type="button" className="w-full bg-lime-400 text-[#1C3A1C] text-xs font-bold py-2.5 rounded-full cursor-pointer border-0 hover:brightness-105">
            View Strategy Forecast →
          </button>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
