export default function StationDetailTabs() {
  return (
    <div className="border-b border-outline-variant/10 mb-8 overflow-x-auto">
      <div className="flex gap-8 min-w-max">
        <button
          type="button"
          className="pb-4 text-sm font-bold border-b-2 border-primary text-on-surface cursor-pointer"
        >
          Overview
        </button>
        <button
          type="button"
          className="pb-4 text-sm font-medium text-on-surface-variant hover:text-on-surface cursor-pointer"
        >
          Insights
        </button>
        <button
          type="button"
          className="pb-4 text-sm font-medium text-on-surface-variant hover:text-on-surface cursor-pointer"
        >
          Spaces
        </button>
        <button
          type="button"
          className="pb-4 text-sm font-medium text-outline flex items-center gap-1.5 cursor-not-allowed"
        >
          Analytics{" "}
          <span className="material-symbols-outlined text-sm">lock</span>
        </button>
        <button
          type="button"
          className="pb-4 text-sm font-medium text-outline flex items-center gap-1.5 cursor-not-allowed"
        >
          AI Insights{" "}
          <span className="material-symbols-outlined text-sm">lock</span>
        </button>
      </div>
    </div>
  );
}
