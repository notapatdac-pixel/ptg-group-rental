const BTN_ON_DARK =
  "inline-flex items-center justify-center primary-gradient text-white w-full py-3 rounded-md text-sm font-bold shadow-sm border-0 cursor-pointer transition-all hover:shadow-lime-500/40 hover:ring-2 hover:ring-lime-300 hover:ring-offset-2 hover:ring-offset-black/90 active:scale-95";

export default function ProInsightsCard() {
  return (
    <div className="relative h-full min-h-0 flex flex-col rounded-xl overflow-hidden border border-white/10 bg-black shadow-lg">
      <div className="relative z-10 p-8 h-full flex flex-col justify-between flex-1 min-h-0">
        <span className="bg-lime-400/90 text-on-primary-container text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider mb-4 inline-block">
          Pro Access
        </span>
        <h4 className="font-headline text-2xl md:text-3xl mb-3 leading-tight text-white">
          Unlock Granular AI Insights
        </h4>
        <p className="text-white/70 text-sm mb-8 leading-relaxed">
          Get predictive analytics on fuel prices, competitor heatmaps, and hourly visitor forecasting.
        </p>
        <button type="button" className={BTN_ON_DARK}>
          Start 14-Day Pro Trial
        </button>
      </div>
    </div>
  );
}
