import { useLanguage } from "@/lib/languageContext";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";

const BREAKEVEN = [
  { name: "Coffee Corner",           rent: 22, revenue: 142, surplus: 120 },
  { name: "Quick Mart",              rent: 37, revenue: 143, surplus: 106 },
  { name: "Lumina Artisan Roastery", rent: 49, revenue: 318, surplus: 269 },
];

const BENCHMARK = [
  {
    you:    { value: 3650, label: "฿3,650/sqm" },
    top:    { value: 5200, label: "฿5,200/sqm" },
    median: { value: 3100, label: "฿3,100/sqm" },
    bottom: { value: 1900, label: "฿1,900/sqm" },
    max: 5200,
  },
  {
    you:    { value: 340, label: "340/day" },
    top:    { value: 420, label: "420/day" },
    median: { value: 285, label: "285/day" },
    bottom: { value: 175, label: "175/day" },
    max: 420,
  },
  {
    you:    { value: 54, label: "54%" },
    top:    { value: 68, label: "68%" },
    median: { value: 47, label: "47%" },
    bottom: { value: 31, label: "31%" },
    max: 68,
  },
];

const SEGMENTS = [
  { gen: "Gen Z",      pct: 28, basket: "฿195", share: "+8%"  },
  { gen: "Millennial", pct: 42, basket: "฿265", share: "+12%" },
  { gen: "Gen X",      pct: 20, basket: "฿270", share: "+3%"  },
  { gen: "Boomer",     pct: 10, basket: "฿240", share: "+1%"  },
];

const STRINGS = {
  en: {
    exportReport: "Export Report",
    headerTitle: "Shop Performance Report",
    headerSub: "Fiscal Year 2024",
    kpi1Label: "Your shops earned this year",
    kpi1Sub: "total (3 stores)",
    kpi1Trend: "↑ +28% vs last year",
    kpi2Label: "Average spent per visit",
    kpi2Sub: "per customer visit",
    kpi2Trend: "↑ +4% above target",
    kpi3Label: "Monthly rent (3 shops)",
    kpi3Sub: "3 leases combined",
    kpi3Note: "Fixed each month",
    kpi4Label: "Rent vs what you earn",
    kpi4Sub: "of monthly revenue",
    kpi4Trend: "Healthy — well under 25%",
    breakevenTitle: "Are Your Shops Making Money?",
    breakevenSub: "After paying rent, how much does each shop keep?",
    profitBadge: "Making a profit after rent",
    leftOverLabel: "left over after rent / month",
    rentLabel: "Rent",
    revenueLabel: "Revenue",
    breakevenTipPre: "All 3 shops are making money after rent — great! ",
    breakevenTipBold1: "Quick Mart",
    breakevenTipMid: " is the one to keep an eye on: rent takes up 26% of its revenue, leaving the least buffer if sales dip. A small revenue boost or rent negotiation there would give you a bigger safety cushion. Overall your rent is just ",
    breakevenTipBold2: "17.9%",
    breakevenTipPost: " of total revenue — a healthy ratio.",
    benchmarkTitle: "How Do You Stack Up?",
    benchmarkSub: "Compared to similar café shops on the platform",
    benchmarkIntroPre: "You rank in the ",
    benchmarkIntroBold: "top 23%",
    benchmarkIntroPost: " on the platform among similar café shops. Customers spend well and come back often — your main growth area is earning more from each square meter of store space.",
    benchmarkRowLabels: ["You (avg)", "Top 25%", "Typical shop", "Bottom 25%"] as const,
    benchmarkMetricTitles: ["Sales per sqm of store space", "Daily Visitors", "Customers Who Come Back"] as const,
    benchmarkTipPre: "You're above average on all three measures. The biggest gap vs. top shops is ",
    benchmarkTipBold: "sales per square meter",
    benchmarkTipPost: " (you earn ฿3,650 vs ฿5,200 for top shops). This doesn't mean you need more customers — it means better shelf placement or a higher-margin product line could close this gap without adding any foot traffic.",
    retentionTitle: "Are Customers Coming Back?",
    retentionSub: "This month breakdown",
    newLabel: "New Customers",
    returningLabel: "Returning Customers",
    lapsedLabel: "Customers Who Stopped Coming",
    pct_new: "24.9% of total",
    pct_returning: "66.3% of total",
    pct_lapsed: "8.8% of total",
    trend_new: "↑ +12% vs last month",
    trend_returning: "↑ +5% vs last month",
    trend_lapsed: "↓ -3% vs last month",
    retentionTipPre: "Fewer customers are leaving — that's good news! But ",
    retentionTipBold: "new customers (+12%) are growing faster than returning ones (+5%)",
    retentionTipPost: " — your shops are great at attracting new people, but not as good at keeping them coming back. A simple punch card or \"3rd visit free\" deal could turn first-timers into regulars.",
    segmentsTitle: "Which Customers Spend the Most?",
    segmentsSub: "How much each age group contributes to your sales",
    ofCustomers: "of customers",
    avgSpentPre: "Avg spent per visit",
    revenueGrowth: "revenue growth",
    segmentsTipPre: "",
    segmentsTipBold: "26–35 year olds (Millennials, 42%)",
    segmentsTipPost: " bring in the most sales today. But your youngest customers (18–25, Gen Z) are the fastest-growing group — up +8% in revenue. This age group often becomes very loyal to brands they discover early. A student discount or Instagram-friendly packaging could lock them in before competitors do.",
  },
  th: {
    exportReport: "ดาวน์โหลดรายงาน",
    headerTitle: "รายงานผลการดำเนินงาน",
    headerSub: "ปีงบประมาณ 2024",
    kpi1Label: "ร้านคุณได้เงินปีนี้",
    kpi1Sub: "รวมทั้งหมด (3 ร้าน)",
    kpi1Trend: "↑ +28% จากปีที่แล้ว",
    kpi2Label: "เฉลี่ยต่อการเข้าร้าน",
    kpi2Sub: "ต่อครั้งที่ลูกค้าเข้าร้าน",
    kpi2Trend: "↑ +4% เกินเป้า",
    kpi3Label: "ค่าเช่ารายเดือน (3 ร้าน)",
    kpi3Sub: "รวม 3 สัญญาเช่า",
    kpi3Note: "คงที่ทุกเดือน",
    kpi4Label: "ค่าเช่าเทียบกับรายได้",
    kpi4Sub: "ของรายได้รายเดือน",
    kpi4Trend: "ดี — ต่ำกว่า 25% มาก",
    breakevenTitle: "ร้านคุณทำกำไรอยู่ไหม?",
    breakevenSub: "หลังจ่ายค่าเช่าแล้ว แต่ละร้านเหลือเงินเท่าไหร่?",
    profitBadge: "ทำกำไรหลังจ่ายค่าเช่า",
    leftOverLabel: "เหลือหลังค่าเช่า / เดือน",
    rentLabel: "ค่าเช่า",
    revenueLabel: "รายได้",
    breakevenTipPre: "ทั้ง 3 ร้านทำกำไรหลังจ่ายค่าเช่า — เยี่ยมมาก! ",
    breakevenTipBold1: "Quick Mart",
    breakevenTipMid: " เป็นร้านที่ต้องจับตาดู: ค่าเช่าคิดเป็น 26% ของรายได้ เหลือ buffer น้อยที่สุดหากยอดขายลดลง การเพิ่มรายได้นิดหน่อยหรือต่อรองค่าเช่าจะช่วยเพิ่มความปลอดภัยได้มาก โดยรวมค่าเช่าของคุณอยู่ที่แค่ ",
    breakevenTipBold2: "17.9%",
    breakevenTipPost: " ของรายได้รวม — อยู่ในระดับที่ดี",
    benchmarkTitle: "คุณอยู่ตรงไหนเทียบกับร้านอื่น?",
    benchmarkSub: "เทียบกับร้านคาเฟ่ที่คล้ายกันบน platform",
    benchmarkIntroPre: "คุณอยู่ใน ",
    benchmarkIntroBold: "top 23%",
    benchmarkIntroPost: " บน platform ในกลุ่มร้านคาเฟ่ที่คล้ายกัน ลูกค้าใช้จ่ายดีและกลับมาบ่อย — จุดที่ยังพัฒนาได้คือการทำรายได้ต่อตารางเมตรให้มากขึ้น",
    benchmarkRowLabels: ["คุณ (เฉลี่ย)", "Top 25%", "ร้านทั่วไป", "Bottom 25%"] as const,
    benchmarkMetricTitles: ["ยอดขายต่อตารางเมตร", "ผู้เข้าร้านต่อวัน", "ลูกค้าที่กลับมา"] as const,
    benchmarkTipPre: "คุณสูงกว่าค่าเฉลี่ยทั้งสามตัวชี้วัด ความต่างที่ใหญ่ที่สุดเทียบร้าน top คือ ",
    benchmarkTipBold: "ยอดขายต่อตารางเมตร",
    benchmarkTipPost: " (คุณได้ ฿3,650 เทียบกับ ฿5,200 สำหรับร้าน top) ไม่ได้หมายความว่าต้องการลูกค้าเพิ่ม — แต่การจัดวางสินค้าดีขึ้นหรือสินค้ากำไรสูงกว่าอาจปิด gap นี้ได้โดยไม่ต้องรอคนเพิ่ม",
    retentionTitle: "ลูกค้ากลับมาอีกไหม?",
    retentionSub: "สรุปเดือนนี้",
    newLabel: "ลูกค้าใหม่",
    returningLabel: "ลูกค้าที่กลับมา",
    lapsedLabel: "ลูกค้าที่หายไป",
    pct_new: "24.9% ของทั้งหมด",
    pct_returning: "66.3% ของทั้งหมด",
    pct_lapsed: "8.8% ของทั้งหมด",
    trend_new: "↑ +12% จากเดือนที่แล้ว",
    trend_returning: "↑ +5% จากเดือนที่แล้ว",
    trend_lapsed: "↓ -3% จากเดือนที่แล้ว",
    retentionTipPre: "ลูกค้าที่หายไปน้อยลง — ข่าวดี! แต่ ",
    retentionTipBold: "ลูกค้าใหม่ (+12%) เติบโตเร็วกว่าลูกค้าที่กลับมา (+5%)",
    retentionTipPost: " — ร้านคุณดึงดูดคนใหม่ได้เก่งมาก แต่ยังรักษาลูกค้าประจำได้ไม่ดีพอ บัตรสะสมแต้มง่ายๆ หรือดีล \"มาครั้งที่ 3 ฟรี\" อาจเปลี่ยนคนมาครั้งแรกให้เป็นขาประจำได้",
    segmentsTitle: "ลูกค้ากลุ่มไหนใช้จ่ายมากที่สุด?",
    segmentsSub: "แต่ละกลุ่มอายุมีส่วนร่วมในยอดขายของคุณแค่ไหน",
    ofCustomers: "ของลูกค้า",
    avgSpentPre: "ใช้จ่ายเฉลี่ยต่อครั้ง",
    revenueGrowth: "การเติบโตของรายได้",
    segmentsTipPre: "",
    segmentsTipBold: "กลุ่มอายุ 26–35 ปี (Millennials, 42%)",
    segmentsTipPost: " สร้างยอดขายสูงสุดในตอนนี้ แต่ลูกค้าที่อายุน้อยที่สุด (18–25, Gen Z) เติบโตเร็วที่สุด — เพิ่มขึ้น +8% ในด้านรายได้ กลุ่มนี้มักซื้อสัตย์กับแบรนด์ที่ค้นพบตั้งแต่ต้น ส่วนลดนักศึกษาหรือแพ็กเกจถ่ายรูปสวยอาจดึงดูดพวกเขาก่อนคู่แข่ง",
  },
} as const;

export default function PerformancePage() {
  const { lang } = useLanguage();
  const T = STRINGS[lang];

  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold italic text-[#1C3A1C]">{T.headerTitle}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{T.headerSub}</p>
        </div>
        <button type="button" className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full border-0 cursor-pointer hover:brightness-105">
          {T.exportReport}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
          <div className="text-3xl font-bold text-on-surface">฿3.6M</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi1Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi1Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
          <div className="text-3xl font-bold text-on-surface">฿249</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi2Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi2Trend}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
          <div className="text-3xl font-bold text-on-surface">฿108k</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi3Sub}</div>
          <span className="text-xs text-on-surface-variant">{T.kpi3Note}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
          <div className="text-3xl font-bold text-on-surface">17.9%</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi4Sub}</div>
          <span className="text-xs font-bold text-primary">{T.kpi4Trend}</span>
        </div>
      </div>

      {/* Are Your Shops Making Money? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.breakevenTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-5">{T.breakevenSub}</p>

        <div className="space-y-3 mb-5">
          {BREAKEVEN.map((s) => {
            const rentPct    = (s.rent    / s.revenue) * 100;
            const surplusPct = (s.surplus / s.revenue) * 100;
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
                  <span className="text-2xl font-bold text-primary">+฿{s.surplus}k</span>
                  <span className="text-xs text-on-surface-variant">{T.leftOverLabel}</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden mb-2">
                  <div className="bg-amber-400 flex-shrink-0" style={{ width: `${rentPct}%` }} />
                  <div className="bg-[#6ab04c] rounded-r-full" style={{ width: `${surplusPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-amber-600 font-semibold">{T.rentLabel} ฿{s.rent}k · {Math.round(rentPct)}% of {T.revenueLabel.toLowerCase()}</span>
                  <span className="text-on-surface-variant">{T.revenueLabel} ฿{s.revenue}k</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {T.breakevenTipPre}<strong className="text-on-surface">{T.breakevenTipBold1}</strong>{T.breakevenTipMid}<strong className="text-on-surface">{T.breakevenTipBold2}</strong>{T.breakevenTipPost}
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
            {T.benchmarkTipPre}<strong className="text-on-surface">{T.benchmarkTipBold}</strong>{T.benchmarkTipPost}
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
            <div className="text-4xl font-bold text-on-surface mb-1">847</div>
            <div className="text-xs text-on-surface-variant mb-1">{T.pct_new}</div>
            <div className="text-xs font-bold text-green-700">{T.trend_new}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-blue-700 mb-2">{T.returningLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">2,253</div>
            <div className="text-xs text-on-surface-variant mb-1">{T.pct_returning}</div>
            <div className="text-xs font-bold text-blue-700">{T.trend_returning}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-red-700 mb-2">{T.lapsedLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">300</div>
            <div className="text-xs text-on-surface-variant mb-1">{T.pct_lapsed}</div>
            <div className="text-xs font-bold text-red-600">{T.trend_lapsed}</div>
          </div>
        </div>
        <div className="bg-[#F5F2EB] rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 flex-shrink-0">auto_awesome</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {T.retentionTipPre}<strong className="text-on-surface">{T.retentionTipBold}</strong>{T.retentionTipPost}
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
            {T.segmentsTipPre}<strong className="text-on-surface">{T.segmentsTipBold}</strong>{T.segmentsTipPost}
          </p>
        </div>
      </div>
    </RetailerBackofficeLayout>
  );
}
