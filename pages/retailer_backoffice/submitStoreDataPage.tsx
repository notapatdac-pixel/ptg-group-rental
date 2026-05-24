import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const TIME_SLOTS = ["08:00–11:00", "11:00–14:00", "14:00–17:00", "17:00–20:00", "20:00–23:00"];

export default function SubmitStoreDataPage() {
  return (
    <RetailerBackofficeLayout>
      <h1 className="text-3xl font-bold text-on-surface mb-8">Submit Performance Data</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Form */}
        <div className="col-span-2 bg-white rounded-2xl p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Select Store</label>
              <div className="relative">
                <select className="w-full appearance-none bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none pr-8 cursor-pointer">
                  <option>Central Embassy – Boutique 490</option>
                  <option>Coffee Corner – Rama IV</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Reporting Month</label>
              <input defaultValue="November 2025" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Monthly Revenue (THB)</label>
              <input type="number" defaultValue={0} className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Daily Customers (AVG)</label>
              <input placeholder="Enter average daily customers" className="w-full bg-[#F5F2EB] rounded-xl px-4 py-3 text-sm border-none outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1.5">Peak Traffic Hours</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border-0 transition-colors ${
                      slot === "17:00–20:00" ? "bg-primary text-white" : "bg-[#F5F2EB] text-on-surface-variant hover:bg-primary/10"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="w-full bg-[#1C3A1C] text-white font-bold py-4 rounded-xl text-sm cursor-pointer border-0 hover:brightness-105">
              Submit Month @ Retailer
            </button>
            <p className="text-center text-[10px] text-on-surface-variant tracking-widest uppercase">Confidential Encrypted Submission</p>
          </div>
        </div>

        {/* Right info panel */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-on-surface mb-4">Why Submit?</h3>
            <div className="space-y-3">
              {[
                { icon: "insights", label: "Benchmark Pricing", desc: "Compare your performance against similar locations." },
                { icon: "smart_toy", label: "AI Forecasting", desc: "Enable predictive revenue modeling for your stores." },
                { icon: "lock", label: "Data Sovereignty", desc: "Your data remains encrypted and proprietary." },
              ].map((i) => (
                <div key={i.label} className="flex gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">{i.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-on-surface">{i.label}</div>
                    <div className="text-xs text-on-surface-variant">{i.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-primary rounded-2xl p-5 text-white">
            <div className="text-2xl font-bold mb-1">24/30 Days</div>
            <div className="text-xs text-white/70 mb-3">Submitted this month</div>
            <div className="bg-white/10 rounded-xl px-3 py-1.5 inline-block">
              <span className="text-xs font-bold text-lime-300">Top 15% Platform Ranking</span>
            </div>
          </div>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
