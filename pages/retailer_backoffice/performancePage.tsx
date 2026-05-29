import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/languageContext";
import { storeBrand } from "@/lib/retailerStores";
import { useStoreFilter } from "@/lib/storeFilterContext";
import RetailerBackofficeLayout from "@/components/retailer_backoffice/RetailerBackofficeLayout";
import AiSuggestionInline from "@/components/shared/AiSuggestionInline";

// ── API types ────────────────────────────────────────────────────────────────

type ApiBreakeven = { storeId: string; name: string; revenue: number; rent: number; utilities: number; net: number };
type ApiBenchTriple = { you: number; top: number; median: number; bottom: number; unit: string };
type ApiPerformance = {
  kpis: {
    annualRevenue: number;
    avgBasket: number;
    monthlyRent: number;
    costToRevenuePct: number;
    costToRevenueHealthy: boolean;
  };
  breakeven: ApiBreakeven[];
  benchmark: {
    salesPerSqm:   ApiBenchTriple | null;
    dailyVisitors: ApiBenchTriple | null;
    revisitRate:   ApiBenchTriple | null;
  };
  retention: {
    newCustomers: number;
    returningCustomers: number;
    lapsedCustomers: number;
    newMomPct: number | null;
    returningMomPct: number | null;
    lapsedMomPct: number | null;
  };
  segments: {
    age:   { label: string; sharePct: number; avgBasket: number | null; growthPct: number | null }[];
    spend: { label: string; sharePct: number }[];
  };
};

// ── Static strings ────────────────────────────────────────────────────────────

const STRINGS = {
  en: {
    headerTitle: "Shop Performance Report",
    headerSub: "Live database — updated monthly",
    kpi1Label: "Your shops earned this year",
    kpi1SubAll: "total across branches",
    kpi1SubOne: "this year",
    kpi2Label: "Average spent per visit",
    kpi2Sub: "per customer visit",
    kpi3Label: "Monthly rent",
    kpi3SubAll: "combined leases",
    kpi3SubOne: "this store",
    kpi3Note: "Fixed each month",
    kpi4Label: "Rent + utilities vs revenue",
    kpi4Sub: "of monthly revenue",
    kpi4TrendOk: "Healthy — well under 25%",
    kpi4TrendWarn: "Watch this — above 25%",
    breakevenTitle: "Are Your Shops Making Money?",
    breakevenSub: "After rent and utilities, how much does each shop keep?",
    profitBadge: "Profitable — costs under control",
    leftOverLabel: "net profit / month",
    rentLabel: "Rent",
    utilitiesLabel: "Utilities",
    revenueLabel: "Revenue",
    netLegend: "Net profit",
    benchmarkTitle: "How Do You Stack Up?",
    benchmarkSub: "Compared to similar café shops on the platform",
    benchmarkRowLabels: ["You", "Top 25%", "Typical shop", "Bottom 25%"] as const,
    benchmarkMetricTitles: ["Sales per sqm", "Daily Visitors", "Revisit Rate"] as const,
    retentionTitle: "Are Customers Coming Back?",
    retentionSub: "This month breakdown",
    newLabel: "New Customers",
    returningLabel: "Existing Customers",
    lapsedLabel: "Customers Who Stopped Coming",
    ofTotal: "of total",
    vsLastMonth: "vs last month",
    segmentsTitle: "Which Customers Spend the Most?",
    segmentsSub: "How much each age group contributes to your sales",
    ofCustomers: "of customers",
    avgSpentPre: "Avg spent per visit",
    revenueGrowth: "revenue growth",
    loading: "Loading from database...",
    noData: "No performance data available for this branch yet.",
  },
  th: {
    headerTitle: "รายงานผลการดำเนินงาน",
    headerSub: "ข้อมูลสด — อัปเดตรายเดือน",
    kpi1Label: "ร้านคุณได้เงินปีนี้",
    kpi1SubAll: "รวมทุกสาขา",
    kpi1SubOne: "ปีนี้",
    kpi2Label: "เฉลี่ยต่อการเข้าร้าน",
    kpi2Sub: "ต่อครั้งที่ลูกค้าเข้าร้าน",
    kpi3Label: "ค่าเช่ารายเดือน",
    kpi3SubAll: "รวมสัญญาเช่าทุกสาขา",
    kpi3SubOne: "ร้านนี้",
    kpi3Note: "คงที่ทุกเดือน",
    kpi4Label: "ค่าเช่า + ค่าน้ำไฟ เทียบรายได้",
    kpi4Sub: "ของรายได้รายเดือน",
    kpi4TrendOk: "ดี — ต่ำกว่า 25% มาก",
    kpi4TrendWarn: "เฝ้าระวัง — เกิน 25%",
    breakevenTitle: "ร้านคุณทำกำไรอยู่ไหม?",
    breakevenSub: "หลังหักค่าเช่าและค่าสาธารณูปโภค แต่ละร้านเหลือเงินเท่าไหร่?",
    profitBadge: "กำไรดี — ต้นทุนควบคุมได้",
    leftOverLabel: "กำไรสุทธิ / เดือน",
    rentLabel: "ค่าเช่า",
    utilitiesLabel: "ค่าสาธารณูปโภค",
    revenueLabel: "รายได้",
    netLegend: "กำไรสุทธิ",
    benchmarkTitle: "คุณอยู่ตรงไหนเทียบกับร้านอื่น?",
    benchmarkSub: "เทียบกับร้านคาเฟ่ที่คล้ายกันบน platform",
    benchmarkRowLabels: ["คุณ", "Top 25%", "ร้านทั่วไป", "Bottom 25%"] as const,
    benchmarkMetricTitles: ["ยอดขายต่อตารางเมตร", "ผู้เข้าร้านต่อวัน", "Revisit Rate"] as const,
    retentionTitle: "ลูกค้ากลับมาอีกไหม?",
    retentionSub: "สรุปเดือนนี้",
    newLabel: "ลูกค้าใหม่",
    returningLabel: "ลูกค้าที่กลับมา",
    lapsedLabel: "ลูกค้าที่หายไป",
    ofTotal: "ของทั้งหมด",
    vsLastMonth: "เทียบเดือนที่แล้ว",
    segmentsTitle: "ลูกค้ากลุ่มไหนใช้จ่ายมากที่สุด?",
    segmentsSub: "แต่ละกลุ่มอายุมีส่วนร่วมในยอดขายของคุณแค่ไหน",
    ofCustomers: "ของลูกค้า",
    avgSpentPre: "ใช้จ่ายเฉลี่ยต่อครั้ง",
    revenueGrowth: "การเติบโตของรายได้",
    loading: "กำลังโหลดจากฐานข้อมูล...",
    noData: "ยังไม่มีข้อมูลผลการดำเนินงานของสาขานี้",
  },
} as const;


function fmtTHB(n: number): string {
  if (n >= 1_000_000) return `฿${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `฿${Math.round(n / 1000)}k`;
  return `฿${n}`;
}

function fmtMoM(pct: number | null, isLapsed: boolean = false): string {
  if (pct == null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% ${isLapsed ? "vs last mo" : "vs last mo"}`;
}

export default function PerformancePage() {
  const { lang } = useLanguage();
  const { storeId } = useStoreFilter();
  const T = STRINGS[lang];

  const [data, setData] = useState<ApiPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);

    fetch(`/api/retailer/performance?storeId=${storeId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ApiPerformance | null) => {
        if (cancelled) return;
        if (!d || !d.kpis) setError(true);
        else setData(d);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [storeId]);

  if (loading || !data) {
    return (
      <RetailerBackofficeLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface">{T.headerTitle}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{T.headerSub}</p>
        </div>
        <div className="bg-white rounded-2xl p-12 shadow-sm text-center text-on-surface-variant">
          {error ? T.noData : T.loading}
        </div>
      </RetailerBackofficeLayout>
    );
  }

  const storeName = storeBrand(storeId, lang);
  const isAll     = storeId === "all";

  const annualRevenueStr = fmtTHB(data.kpis.annualRevenue);
  const monthlyRentStr   = fmtTHB(data.kpis.monthlyRent);
  const avgBasketStr     = `฿${data.kpis.avgBasket}`;
  const cToRStr          = `${data.kpis.costToRevenuePct.toFixed(1)}%`;
  const kpi4Trend        = data.kpis.costToRevenueHealthy ? T.kpi4TrendOk : T.kpi4TrendWarn;

  const retention = data.retention;
  const retTotal  = retention.newCustomers + retention.returningCustomers + retention.lapsedCustomers;
  const pctNew    = retTotal ? `${((retention.newCustomers       / retTotal) * 100).toFixed(1)}% ${T.ofTotal}` : "—";
  const pctRet    = retTotal ? `${((retention.returningCustomers / retTotal) * 100).toFixed(1)}% ${T.ofTotal}` : "—";
  const pctLap    = retTotal ? `${((retention.lapsedCustomers    / retTotal) * 100).toFixed(1)}% ${T.ofTotal}` : "—";

  // ── Build AI dataContext strings from REAL data ─────────────────────────────
  const beDataContext = [
    `${storeName} — Breakeven Analysis (latest month from DB)`,
    `Annual Revenue YTD: ${annualRevenueStr}`,
    `Monthly Rent: ${monthlyRentStr}`,
    `Cost-to-Revenue: ${cToRStr} (${data.kpis.costToRevenueHealthy ? "healthy under 25%" : "above 25% threshold"})`,
    data.breakeven.map((b) => `${b.name}: revenue ฿${b.revenue}k, rent ฿${b.rent}k, utilities ฿${b.utilities}k, net profit ฿${b.net}k`).join("; "),
  ].join(" | ");

  const bm = data.benchmark;
  const bmDataContext = [
    `${storeName} — Benchmark vs Platform Cafe Category`,
    bm.salesPerSqm   ? `Sales/sqm: you=฿${bm.salesPerSqm.you}/sqm, top25=฿${bm.salesPerSqm.top}/sqm, median=฿${bm.salesPerSqm.median}/sqm, bottom25=฿${bm.salesPerSqm.bottom}/sqm`     : "",
    bm.dailyVisitors ? `Daily Visitors: you=${bm.dailyVisitors.you}/day, top25=${bm.dailyVisitors.top}/day, median=${bm.dailyVisitors.median}/day, bottom25=${bm.dailyVisitors.bottom}/day`   : "",
    bm.revisitRate   ? `Revisit Rate: you=${bm.revisitRate.you}%, top25=${bm.revisitRate.top}%, median=${bm.revisitRate.median}%, bottom25=${bm.revisitRate.bottom}%`                     : "",
  ].filter(Boolean).join(" | ");

  const retDataContext = [
    `${storeName} — Customer Retention (latest month)`,
    `New customers: ${retention.newCustomers} (${fmtMoM(retention.newMomPct)})`,
    `Returning customers: ${retention.returningCustomers} (${fmtMoM(retention.returningMomPct)})`,
    `Lapsed customers: ${retention.lapsedCustomers} (${fmtMoM(retention.lapsedMomPct, true)})`,
  ].join(" | ");

  const segDataContext = [
    `${storeName} — Customer Segments (latest month)`,
    "Age:",
    ...data.segments.age.map((a) => `${a.label}: ${a.sharePct}% of customers, ${a.avgBasket ? `฿${a.avgBasket}/visit, ` : ""}${a.growthPct != null ? `${a.growthPct >= 0 ? "+" : ""}${a.growthPct}% growth` : "growth n/a"}`),
    "Spend bands:",
    ...data.segments.spend.map((s) => `${s.label}: ${s.sharePct}% of customers`),
  ].join(" | ");

  // ── Benchmark normalised rows (for chart rendering) ─────────────────────────
  const benchmarkRows = [
    bm.salesPerSqm   ? { titleIdx: 0, max: Math.max(bm.salesPerSqm.top,   bm.salesPerSqm.you,   bm.salesPerSqm.median,   bm.salesPerSqm.bottom),   you: bm.salesPerSqm,   unitPrefix: "฿", unitSuffix: "/sqm" } : null,
    bm.dailyVisitors ? { titleIdx: 1, max: Math.max(bm.dailyVisitors.top, bm.dailyVisitors.you, bm.dailyVisitors.median, bm.dailyVisitors.bottom), you: bm.dailyVisitors, unitPrefix: "",  unitSuffix: "/day"  } : null,
    bm.revisitRate   ? { titleIdx: 2, max: Math.max(bm.revisitRate.top,   bm.revisitRate.you,   bm.revisitRate.median,   bm.revisitRate.bottom),   you: bm.revisitRate,   unitPrefix: "",  unitSuffix: "%"     } : null,
  ].filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <RetailerBackofficeLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">{T.headerTitle}</h1>
        <p className="text-sm text-on-surface-variant mt-1">{T.headerSub}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi1Label}</div>
          <div className="text-3xl font-bold text-on-surface">{annualRevenueStr}</div>
          <div className="text-sm text-on-surface-variant mb-3">{isAll ? T.kpi1SubAll : T.kpi1SubOne}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi2Label}</div>
          <div className="text-3xl font-bold text-on-surface">{avgBasketStr}</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi2Sub}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi3Label}</div>
          <div className="text-3xl font-bold text-on-surface">{monthlyRentStr}</div>
          <div className="text-sm text-on-surface-variant mb-3">{isAll ? T.kpi3SubAll : T.kpi3SubOne}</div>
          <span className="text-xs text-on-surface-variant">{T.kpi3Note}</span>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs text-on-surface-variant mb-3">{T.kpi4Label}</div>
          <div className="text-3xl font-bold text-on-surface">{cToRStr}</div>
          <div className="text-sm text-on-surface-variant mb-3">{T.kpi4Sub}</div>
          <span className={`text-xs font-bold ${data.kpis.costToRevenueHealthy ? "text-primary" : "text-amber-600"}`}>{kpi4Trend}</span>
        </div>
      </div>

      {/* Are Your Shops Making Money? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.breakevenTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-5">{T.breakevenSub}</p>

        <div className="flex items-center gap-5 text-xs text-on-surface-variant mb-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-amber-400 inline-block" />{T.rentLabel}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-sky-300 inline-block" />{T.utilitiesLabel}</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2.5 rounded bg-[#6ab04c] inline-block" />{T.netLegend}</span>
        </div>

        <div className="space-y-3 mb-5">
          {data.breakeven.map((s) => {
            const rentPct      = (s.rent      / s.revenue) * 100;
            const utilitiesPct = (s.utilities / s.revenue) * 100;
            const netPct       = (s.net       / s.revenue) * 100;
            const totalCostPct = Math.round((s.rent + s.utilities) / s.revenue * 100);
            return (
              <div key={s.storeId} className="bg-[#F5F2EB] rounded-2xl px-5 py-4">
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

        <AiSuggestionInline
          role="retailer"
          pageContext="Performance — Breakeven Analysis"
          dataContext={beDataContext}
        />
      </div>

      {/* How Do You Stack Up? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.benchmarkTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-4">{T.benchmarkSub}</p>

        <div className="grid grid-cols-3 gap-8 mb-5">
          {benchmarkRows.map((m, mi) => {
            const fmt = (v: number) => `${m.unitPrefix}${v.toLocaleString()}${m.unitSuffix}`;
            const rows = [
              { label: T.benchmarkRowLabels[0], value: m.you.you,    bold: true,  color: "bg-primary",       h: "h-3" },
              { label: T.benchmarkRowLabels[1], value: m.you.top,    bold: false, color: "bg-on-surface/25", h: "h-2" },
              { label: T.benchmarkRowLabels[2], value: m.you.median, bold: false, color: "bg-on-surface/15", h: "h-2" },
              { label: T.benchmarkRowLabels[3], value: m.you.bottom, bold: false, color: "bg-on-surface/10", h: "h-2" },
            ];
            return (
              <div key={mi}>
                <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">{T.benchmarkMetricTitles[m.titleIdx]}</div>
                <div className="space-y-3">
                  {rows.map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className={`flex items-center gap-1.5 ${r.bold ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                          <span className={`w-2 h-2 rounded-full inline-block ${r.bold ? "bg-primary" : "bg-on-surface/20"}`} />
                          {r.label}
                        </span>
                        <span className={r.bold ? "font-bold text-primary" : "text-on-surface-variant"}>{fmt(r.value)}</span>
                      </div>
                      <div className={`${r.h} bg-[#F5F2EB] rounded-full overflow-hidden`}>
                        <div className={`${r.h} ${r.color} rounded-full`} style={{ width: `${(r.value / m.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <AiSuggestionInline
          role="retailer"
          pageContext="Performance — Benchmark Comparison"
          dataContext={bmDataContext}
        />
      </div>

      {/* Are Customers Coming Back? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.retentionTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-5">{T.retentionSub}</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-green-700 mb-2">{T.newLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">{retention.newCustomers.toLocaleString()}</div>
            <div className="text-xs text-on-surface-variant mb-1">{pctNew}</div>
            <div className="text-xs font-bold text-green-700">{fmtMoM(retention.newMomPct)}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-blue-700 mb-2">{T.returningLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">{retention.returningCustomers.toLocaleString()}</div>
            <div className="text-xs text-on-surface-variant mb-1">{pctRet}</div>
            <div className="text-xs font-bold text-blue-700">{fmtMoM(retention.returningMomPct)}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <div className="text-xs font-semibold text-red-700 mb-2">{T.lapsedLabel}</div>
            <div className="text-4xl font-bold text-on-surface mb-1">{retention.lapsedCustomers.toLocaleString()}</div>
            <div className="text-xs text-on-surface-variant mb-1">{pctLap}</div>
            <div className="text-xs font-bold text-red-600">{fmtMoM(retention.lapsedMomPct, true)}</div>
          </div>
        </div>
        <AiSuggestionInline
          role="retailer"
          pageContext="Performance — Customer Retention"
          dataContext={retDataContext}
        />
      </div>

      {/* Which Customers Spend the Most? */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-on-surface mb-0.5">{T.segmentsTitle}</h3>
        <p className="text-xs text-on-surface-variant mb-5">{T.segmentsSub}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {data.segments.age.map((s) => (
            <div key={s.label} className="flex items-center gap-4 bg-[#F5F2EB] rounded-xl px-5 py-4">
              <div className="flex-shrink-0">
                <div className="text-xs text-on-surface-variant mb-0.5">{s.label}</div>
                <div className="text-3xl font-bold text-on-surface">{s.sharePct}%</div>
                <div className="text-xs text-on-surface-variant">{T.ofCustomers}</div>
              </div>
              <div className="flex-1">
                {s.avgBasket != null && (
                  <div className="text-xs text-on-surface-variant mb-1">
                    {T.avgSpentPre} <span className="font-semibold text-on-surface">฿{s.avgBasket}</span>
                  </div>
                )}
                {s.growthPct != null && (
                  <div className={`text-xs font-semibold ${s.growthPct >= 0 ? "text-primary" : "text-red-500"}`}>
                    {s.growthPct >= 0 ? "+" : ""}{s.growthPct}% {T.revenueGrowth}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <AiSuggestionInline
          role="retailer"
          pageContext="Performance — Customer Segments"
          dataContext={segDataContext}
        />
      </div>
    </RetailerBackofficeLayout>
  );
}
