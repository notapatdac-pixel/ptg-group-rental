import { useLanguage } from "@/lib/languageContext";
import { useStoreFilter } from "@/lib/storeFilterContext";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const BREAKEVEN = [
  { id: "coffee", name: "Coffee Corner",           rent: 22, utilities: 3, revenue: 142, net: 117 },
  { id: "quick",  name: "Quick Mart",              rent: 37, utilities: 5, revenue: 143, net: 101 },
  { id: "lumina", name: "Lumina Artisan Roastery", rent: 49, utilities: 8, revenue: 318, net: 261 },
];

const BENCHMARK_BASE = [
  { top: { value: 5200, label: "฿5,200/sqm" }, median: { value: 3100, label: "฿3,100/sqm" }, bottom: { value: 1900, label: "฿1,900/sqm" }, max: 5200 },
  { top: { value: 420,  label: "420/day"     }, median: { value: 285,  label: "285/day"     }, bottom: { value: 175,  label: "175/day"     }, max: 420  },
  { top: { value: 68,   label: "68%"          }, median: { value: 47,   label: "47%"          }, bottom: { value: 31,   label: "31%"          }, max: 68   },
];

const SEGMENTS = [
  { gen: "Gen Z",      pct: 28, basket: "฿195", share: "+8%"  },
  { gen: "Millennial", pct: 42, basket: "฿265", share: "+12%" },
  { gen: "Gen X",      pct: 20, basket: "฿270", share: "+3%"  },
  { gen: "Boomer",     pct: 10, basket: "฿240", share: "+1%"  },
];

const PERF_BY_STORE = {
  all: {
    kpi1: "฿3.6M",  kpi1Sub_en: "total (3 stores)",   kpi1Sub_th: "รวม 3 ร้าน",
    kpi2: "฿249",
    kpi3: "฿108k",  kpi3Sub_en: "3 leases combined",  kpi3Sub_th: "3 สัญญาเช่า",
    kpi4: "17.9%",  kpi4Ok: true,
    benchYou: [
      { value: 3650, label: "฿3,650/sqm" },
      { value: 340,  label: "340/day"    },
      { value: 54,   label: "54%"        },
    ],
    retention: { n: 847, r: 2253, l: 300, tn: "+12% vs last month", tr: "+5% vs last month", tl: "-3% vs last month" },
    tip_be:  { pre: "All 3 shops are profitable — great! ", b1: "Quick Mart", mid: " has the highest cost ratio (29%). A small revenue boost or rent negotiation would give a bigger cushion. Overall costs are just ", b2: "19.7%", post: " of total revenue." },
    tip_bm:  { pre: "You're above average on all three measures. The biggest gap vs. top shops is ", b: "sales per square meter", post: " (฿3,650 vs. ฿5,200 for top shops). Better shelf placement or a higher-margin product line could close this gap without adding foot traffic." },
    tip_ret: { pre: "Fewer customers are leaving — good news! But ", b: "new customers (+12%) are growing faster than returning ones (+5%)", post: " — your shops attract new people well, but keeping them coming back needs work. A punch card or \"3rd visit free\" deal could turn first-timers into regulars." },
  },
  coffee: {
    kpi1: "฿1.70M", kpi1Sub_en: "this year",          kpi1Sub_th: "ปีนี้",
    kpi2: "฿248",
    kpi3: "฿22k",   kpi3Sub_en: "this store",         kpi3Sub_th: "ร้านนี้",
    kpi4: "15.4%",  kpi4Ok: true,
    benchYou: [
      { value: 2580, label: "฿2,580/sqm" },
      { value: 340,  label: "340/day"    },
      { value: 54,   label: "54%"        },
    ],
    retention: { n: 312, r: 880, l: 92, tn: "+18% vs last month", tr: "+6% vs last month", tl: "-4% vs last month" },
    tip_be:  { pre: "Coffee Corner covers rent and utilities with ", b1: "฿117k net profit", mid: " every month — a healthy 17.6% cost ratio. This store has a strong safety cushion even if monthly sales dip.", b2: "", post: "" },
    tip_bm:  { pre: "Coffee Corner is above average on daily visitors and revisit rate. The main growth area is ", b: "sales per square meter (฿2,580 vs. ฿5,200 top)", post: ". Better counter use or a premium seasonal offering could close this gap." },
    tip_ret: { pre: "Coffee Corner has strong retention — 69% existing customers. ", b: "New customer growth (+18%) is the best across all your stores", post: ". A stamp card here could lock in new customers as regulars." },
  },
  quick: {
    kpi1: "฿1.72M", kpi1Sub_en: "this year",          kpi1Sub_th: "ปีนี้",
    kpi2: "฿195",
    kpi3: "฿37k",   kpi3Sub_en: "this store",         kpi3Sub_th: "ร้านนี้",
    kpi4: "29.0%",  kpi4Ok: false,
    benchYou: [
      { value: 2100, label: "฿2,100/sqm" },
      { value: 280,  label: "280/day"    },
      { value: 48,   label: "48%"        },
    ],
    retention: { n: 224, r: 728, l: 83, tn: "+4% vs last month", tr: "+3% vs last month", tl: "-2% vs last month" },
    tip_be:  { pre: "Quick Mart stays profitable, but rent and utilities take ", b1: "29% of revenue", mid: " — the highest of your stores. A combo deal or small price increase could add the margin to make this store more resilient.", b2: "", post: "" },
    tip_bm:  { pre: "Quick Mart scores below average, especially on ", b: "sales per sqm (฿2,100 vs. ฿3,100 median)", post: ". A targeted combo deal and better product placement could move both metrics up without waiting for more customers." },
    tip_ret: { pre: "Quick Mart's revisit rate (48%) is below your other stores. ", b: "New customers are growing slowly (+4%)", post: " and lapsed customers (8%) are higher than Coffee Corner. A regular Tuesday deal or loyalty stamp card could bring people back more consistently." },
  },
  lumina: {
    kpi1: "฿3.82M", kpi1Sub_en: "this year",          kpi1Sub_th: "ปีนี้",
    kpi2: "฿310",
    kpi3: "฿49k",   kpi3Sub_en: "this store",         kpi3Sub_th: "ร้านนี้",
    kpi4: "17.9%",  kpi4Ok: true,
    benchYou: [
      { value: 4850, label: "฿4,850/sqm" },
      { value: 415,  label: "415/day"    },
      { value: 62,   label: "62%"        },
    ],
    retention: { n: 415, r: 948, l: 95, tn: "+11% vs last month", tr: "+7% vs last month", tl: "-5% vs last month" },
    tip_be:  { pre: "Lumina is your most profitable store — ", b1: "฿261k net profit per month", mid: " with only 17.9% going to costs. This store has the most room to invest in growth (new products, longer hours, marketing) without risking the bottom line.", b2: "", post: "" },
    tip_bm:  { pre: "Lumina is close to the top quartile in sales per sqm (฿4,850 vs. ฿5,200). The ", b: "revisit rate (62%) is your best store by far", post: ". A premium seasonal menu or upsell at checkout could push you into the top 10% of the platform." },
    tip_ret: { pre: "Lumina has the best retention profile — 65% existing customers with ", b: "62% revisit rate", post: ". New customer growth (+11%) is also strong. A loyalty tier system could convert occasional visitors into high-frequency regulars." },
  },
};

const STRINGS = {
  en: {
    exportReport: "Export Report",
    headerTitle: "Shop Performance Report",
    headerSub: "Fiscal Year 2024",
    kpi1Label: "Your shops earned this year",
    kpi2Label: "Average spent per visit",
    kpi2Sub: "per customer visit",
    kpi2Trend: "+4% above target",
    kpi3Label: "Monthly rent",
    kpi3Note: "Fixed each month",
    kpi4Label: "Rent vs what you earn",
    kpi4Sub: "of monthly revenue",
    kpi4TrendOk: "Healthy — well under 25%",
    kpi4TrendWarn: "Watch this — above 25%",
    breakevenTitle: "Are Your Shops Making Money?",
    breakevenSub: "After rent and utilities, how much does each shop keep?",
    profitBadge: "Cost-to-revenue ratio: healthy",
    leftOverLabel: "net profit / month",
    rentLabel: "Rent",
    utilitiesLabel: "Utilities",
    revenueLabel: "Revenue",
    benchmarkTitle: "How Do You Stack Up?",
    benchmarkSub: "Compared to similar café shops on the platform",
    benchmarkIntroPre: "You rank in the ",
    benchmarkIntroBold: "top 23%",
    benchmarkIntroPost: " on the platform among similar café shops. Customers spend well and come back often — your main growth area is earning more from each square meter of store space.",
    benchmarkRowLabels: ["You", "Top 25%", "Typical shop", "Bottom 25%"] as const,
    benchmarkMetricTitles: ["Sales per sqm of store space", "Daily Visitors", "Revisit Rate"] as const,
    retentionTitle: "Are Customers Coming Back?",
    retentionSub: "This month breakdown",
    newLabel: "New Customers",
    returningLabel: "Existing Customers",
    lapsedLabel: "Customers Who Stopped Coming",
    ofTotal: "of total",
    segmentsTitle: "Which Customers Spend the Most?",
    segmentsSub: "How much each age group contributes to your sales",
    ofCustomers: "of customers",
    avgSpentPre: "Avg spent per visit",
    revenueGrowth: "revenue growth",
    segmentsTipBold: "26–35 year olds (Millennials, 42%)",
    segmentsTipPost: " bring in the most sales today. But your youngest customers (18–25, Gen Z) are the fastest-growing group — up +8% in revenue. A student discount or Instagram-friendly packaging could lock them in before competitors do.",
  },
  th: {
    exportReport: "ดาวน์โหลดรายงาน",
    headerTitle: "รายงานผลการดำเนินงาน",
    headerSub: "ปีงบประมาณ 2024",
    kpi1Label: "ร้านคุณได้เงินปีนี้",
    kpi2Label: "เฉลี่ยต่อการเข้าร้าน",
    kpi2Sub: "ต่อครั้งที่ลูกค้าเข้าร้าน",
    kpi2Trend: "+4% เกินเป้า",
    kpi3Label: "ค่าเช่ารายเดือน",
    kpi3Note: "คงที่ทุกเดือน",
    kpi4Label: "ค่าเช่าเทียบกับรายได้",
    kpi4Sub: "ของรายได้รายเดือน",
    kpi4TrendOk: "ดี — ต่ำกว่า 25% มาก",
    kpi4TrendWarn: "เฝ้าระวัง — เกิน 25%",
    breakevenTitle: "ร้านคุณทำกำไรอยู่ไหม?",
    breakevenSub: "หลังหักค่าเช่าและค่าสาธารณูปโภค แต่ละร้านเหลือเงินเท่าไหร่?",
    profitBadge: "อัตราส่วนค่าใช้จ่าย: ดี",
    leftOverLabel: "กำไรสุทธิ / เดือน",
    rentLabel: "ค่าเช่า",
    utilitiesLabel: "ค่าสาธารณูปโภค",
    revenueLabel: "รายได้",
    benchmarkTitle: "คุณอยู่ตรงไหนเทียบกับร้านอื่น?",
    benchmarkSub: "เทียบกับร้านคาเฟ่ที่คล้ายกันบน platform",
    benchmarkIntroPre: "คุณอยู่ใน ",
    benchmarkIntroBold: "top 23%",
    benchmarkIntroPost: " บน platform ในกลุ่มร้านคาเฟ่ที่คล้ายกัน ลูกค้าใช้จ่ายดีและกลับมาบ่อย — จุดที่ยังพัฒนาได้คือการทำรายได้ต่อตารางเมตรให้มากขึ้น",
    benchmarkRowLabels: ["คุณ", "Top 25%", "ร้านทั่วไป", "Bottom 25%"] as const,
    benchmarkMetricTitles: ["ยอดขายต่อตารางเมตร", "ผู้เข้าร้านต่อวัน", "Revisit Rate"] as const,
    retentionTitle: "ลูกค้ากลับมาอีกไหม?",
    retentionSub: "สรุปเดือนนี้",
    newLabel: "ลูกค้าใหม่",
    returningLabel: "Existing Customers",
    lapsedLabel: "ลูกค้าที่หายไป",
    ofTotal: "ของทั้งหมด",
    segmentsTitle: "ลูกค้ากลุ่มไหนใช้จ่ายมากที่สุด?",
    segmentsSub: "แต่ละกลุ่มอายุมีส่วนร่วมในยอดขายของคุณแค่ไหน",
    ofCustomers: "ของลูกค้า",
    avgSpentPre: "ใช้จ่ายเฉลี่ยต่อครั้ง",
    revenueGrowth: "การเติบโตของรายได้",
    segmentsTipBold: "กลุ่มอายุ 26–35 ปี (Millennials, 42%)",
    segmentsTipPost: " สร้างยอดขายสูงสุดในตอนนี้ แต่ลูกค้าที่อายุน้อยสุด (18–25, Gen Z) เติบโตเร็วที่สุด ส่วนลดนักศึกษาหรือแพ็กเกจถ่ายรูปสวยอาจดึงดูดพวกเขาก่อนคู่แข่ง",
  },
} as const;

export default function PerformancePage() {
  const { lang } = useLanguage();
  const { storeId } = useStoreFilter();
  const T = STRINGS[lang];

  const pd = PERF_BY_STORE[storeId];
  const kpi1Sub = lang === "th" ? pd.kpi1Sub_th : pd.kpi1Sub_en;
  const kpi3Sub = lang === "th" ? pd.kpi3Sub_th : pd.kpi3Sub_en;
  const kpi4Trend = pd.kpi4Ok ? T.kpi4TrendOk : T.kpi4TrendWarn;

  const filteredBreakeven = storeId === "all" ? BREAKEVEN : BREAKEVEN.filter((s) => s.id === storeId);

  const BENCHMARK = BENCHMARK_BASE.map((base, i) => ({
    you: pd.benchYou[i],
    top: base.top,
    median: base.median,
    bottom: base.bottom,
    max: base.max,
  }));

  const ret = pd.retention;
  const retTotal = ret.n + ret.r + ret.l;
  const pctNew = `${((ret.n / retTotal) * 100).toFixed(1)}% ${T.ofTotal}`;
  const pctRet = `${((ret.r / retTotal) * 100).toFixed(1)}% ${T.ofTotal}`;
  const pctLap = `${((ret.l / retTotal) * 100).toFixed(1)}% ${T.ofTotal}`;

  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold italic text-[#1C3A1C]">{T.headerTitle}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{T.headerSub}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
          <div className="text-3xl font-bold text-on-surface">{pd.kpi1}</div>
          <div className="text-sm text-on-surface-variant mb-3">{kpi1Sub}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
          <div className="text-3xl font-bold text-on-surface">{pd.kpi2}</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi2Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi2Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
          <div className="text-3xl font-bold text-on-surface">{pd.kpi3}</div>
          <div className="text-sm text-on-surface-variant mb-3">{kpi3Sub}</div>
          <span className="text-xs text-on-surface-variant">{T.kpi3Note}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
          <div className="text-3xl font-bold text-on-surface">{pd.kpi4}</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi4Sub}</div>
          <span className={`text-xs font-bold ${pd.kpi4Ok ? "text-primary" : "text-amber-600"}`}>{kpi4Trend}</span>
        </div>
      </div>

      {/* Are Your Shops Making Money? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.breakevenTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-5">{T.breakevenSub}</p>

        <div className="flex items-center gap-5 text-xs text-on-surface-variant mb-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-amber-400 inline-block" />{T.rentLabel}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-sky-300 inline-block" />{T.utilitiesLabel}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-[#6ab04c] inline-block" />Net profit</span>
        </div>

        <div className="space-y-3 mb-5">
          {filteredBreakeven.map((s) => {
            const rentPct      = (s.rent      / s.revenue) * 100;
            const utilitiesPct = (s.utilities / s.revenue) * 100;
            const netPct       = (s.net       / s.revenue) * 100;
            const totalCostPct = Math.round((s.rent + s.utilities) / s.revenue * 100);
            return (
              <div key={s.name} className="bg-[#F5F2EB] rounded-2xl px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-on-surface">{s.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
                    <span className="text-xs font-bold text-primary">{T.profitBadge}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-2xl font-bold text-primary">+฿{s.net}k</span>
                  <span className="text-xs text-on-surface-variant">{T.leftOverLabel}</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden mb-2">
                  <div className="bg-amber-400 flex-shrink-0" style={{ width: `${rentPct}%` }} />
                  <div className="bg-sky-300 flex-shrink-0" style={{ width: `${utilitiesPct}%` }} />
                  <div className="bg-[#6ab04c] rounded-r-full flex-shrink-0" style={{ width: `${netPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-on-surface-variant">
                    <span className="text-amber-600 font-semibold">{T.rentLabel} ฿{s.rent}k</span>
                    {" + "}
                    <span className="text-sky-600 font-semibold">{T.utilitiesLabel} ฿{s.utilities}k</span>
                    {" = "}
                    <span className="font-semibold text-on-surface">{totalCostPct}% of revenue</span>
                  </span>
                  <span className="text-on-surface-variant">{T.revenueLabel} ฿{s.revenue}k</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {pd.tip_be.pre}
            <strong className="text-on-surface">{pd.tip_be.b1}</strong>
            {pd.tip_be.mid}
            {pd.tip_be.b2 && <strong className="text-on-surface">{pd.tip_be.b2}</strong>}
            {pd.tip_be.post}
          </p>
        </div>
      </div>

      {/* How Do You Stack Up? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.benchmarkTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-4">{T.benchmarkSub}</p>

        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 mb-5 text-xs text-on-surface-variant leading-relaxed">
          {T.benchmarkIntroPre}<strong className="text-on-surface">{T.benchmarkIntroBold}</strong>{T.benchmarkIntroPost}
        </div>

        <div className="grid grid-cols-3 gap-8 mb-5">
          {BENCHMARK.map((m, mi) => {
            const rows = [
              { label: T.benchmarkRowLabels[0], value: m.you,    bold: true,  color: "bg-primary",       h: "h-3" },
              { label: T.benchmarkRowLabels[1], value: m.top,    bold: false, color: "bg-on-surface/25", h: "h-2" },
              { label: T.benchmarkRowLabels[2], value: m.median, bold: false, color: "bg-on-surface/15", h: "h-2" },
              { label: T.benchmarkRowLabels[3], value: m.bottom, bold: false, color: "bg-on-surface/10", h: "h-2" },
            ];
            return (
              <div key={mi}>
                <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">{T.benchmarkMetricTitles[mi]}</div>
                <div className="space-y-3">
                  {rows.map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`flex items-center gap-1.5 ${r.bold ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                          <span className={`w-2 h-2 rounded-full inline-block ${r.bold ? "bg-primary" : "bg-on-surface/20"}`} />
                          {r.label}
                        </span>
                        <span className={r.bold ? "font-bold text-primary" : "text-on-surface-variant"}>{r.value.label}</span>
                      </div>
                      <div className={`${r.h} bg-[#F5F2EB] rounded-full overflow-hidden`}>
                        <div className={`${r.h} ${r.color} rounded-full`} style={{ width: `${(r.value.value / m.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {pd.tip_bm.pre}<strong className="text-on-surface">{pd.tip_bm.b}</strong>{pd.tip_bm.post}
          </p>
        </div>
      </div>

      {/* Are Customers Coming Back? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.retentionTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-5">{T.retentionSub}</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-green-700 mb-2">{T.newLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">{ret.n.toLocaleString()}</div>
            <div className="text-xs text-on-surface-variant mb-1">{pctNew}</div>
            <div className="text-xs font-bold text-green-700">{ret.tn}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-blue-700 mb-2">{T.returningLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">{ret.r.toLocaleString()}</div>
            <div className="text-xs text-on-surface-variant mb-1">{pctRet}</div>
            <div className="text-xs font-bold text-blue-700">{ret.tr}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-red-700 mb-2">{T.lapsedLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">{ret.l.toLocaleString()}</div>
            <div className="text-xs text-on-surface-variant mb-1">{pctLap}</div>
            <div className="text-xs font-bold text-red-600">{ret.tl}</div>
          </div>
        </div>
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {pd.tip_ret.pre}<strong className="text-on-surface">{pd.tip_ret.b}</strong>{pd.tip_ret.post}
          </p>
        </div>
      </div>

      {/* Which Customers Spend the Most? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.segmentsTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-5">{T.segmentsSub}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {SEGMENTS.map((s) => (
            <div key={s.gen} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-5 py-4">
              <div className="flex-shrink-0">
                <div className="text-xs text-on-surface-variant mb-0.5">{s.gen}</div>
                <div className="text-3xl font-bold text-on-surface">{s.pct}%</div>
                <div className="text-xs text-on-surface-variant">{T.ofCustomers}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-on-surface-variant mb-1">{T.avgSpentPre} <span className="font-semibold text-on-surface">{s.basket}</span></div>
                <div className="text-xs font-semibold text-primary">{s.share} {T.revenueGrowth}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">{T.segmentsTipBold}</strong>{T.segmentsTipPost}
          </p>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
