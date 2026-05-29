import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { generateChatResponse, type ChatMessage } from "@/agent/ai/geminiClient";
import { buildSystemPrompt } from "@/agent/ai/systemPrompts";
import { RETAILER_STORES, RETAILER_ID } from "@/lib/retailerStores";
import { stationLandmark } from "@/agent/rules/stationFit";

const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Landlord portfolio filter_keys (5 owned stations)
const PORTFOLIO_KEYS = ["lat_phrao", "sukhumvit", "rama9", "bang_na", "main"];

const RETAILER_STORE_IDS = RETAILER_STORES.map((s) => s.storeId); // ["STN-001", ...]

type EventRow = {
  store_display_id: string | null;
  year_month: string;
  event_name: string;
  event_type: string;
  description: string | null;
  est_traffic_lift_pct: number | null;
  est_sales_lift_pct: number | null;
};

function signed(n: number | null): string {
  if (n === null || n === undefined) return "?";
  return `${n > 0 ? "+" : ""}${n}%`;
}

function formatEventLine(e: EventRow): string {
  return (
    `    • ${e.year_month} ${e.event_name} (${e.event_type}): ` +
    `traffic ${signed(e.est_traffic_lift_pct)}, sales ${signed(e.est_sales_lift_pct)}` +
    (e.description ? ` — ${e.description}` : "")
  );
}

// Build a per-store event map from a flat result set, keyed by store_display_id.
function groupEvents(rows: EventRow[]): { byStore: Record<string, EventRow[]>; portfolio: EventRow[] } {
  const byStore: Record<string, EventRow[]> = {};
  const portfolio: EventRow[] = [];
  for (const e of rows) {
    if (e.store_display_id === null) portfolio.push(e);
    else (byStore[e.store_display_id] ??= []).push(e);
  }
  return { byStore, portfolio };
}

async function buildRetailerContext(activeStoreId?: string): Promise<string> {
  // Load latest-two-months performance + P&L + events for ALL retailer stores,
  // so the chatbot can answer about any branch and compare across branches.
  const [{ data: perf }, { data: pnl }, { data: events }] = await Promise.all([
    serviceSupabase
      .from("store_monthly_performance")
      .select("store_display_id, year_month, traffic, orders, conversion_pct, avg_basket_thb, revisit_rate_pct")
      .in("store_display_id", RETAILER_STORE_IDS)
      .order("year_month", { ascending: false }),
    serviceSupabase
      .from("store_monthly_pnl")
      .select("store_display_id, year_month, revenue_thb, rent_thb, utilities_thb, net_thb")
      .in("store_display_id", RETAILER_STORE_IDS)
      .order("year_month", { ascending: false }),
    serviceSupabase
      .from("store_events")
      .select("store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct")
      .or(`store_display_id.in.(${RETAILER_STORE_IDS.join(",")}),store_display_id.is.null`)
      .order("year_month", { ascending: true }),
  ]);

  const perfByStore: Record<string, any[]> = {};
  for (const p of (perf ?? []) as any[]) (perfByStore[p.store_display_id] ??= []).push(p);
  const pnlByStore: Record<string, any[]> = {};
  for (const p of (pnl ?? []) as any[]) (pnlByStore[p.store_display_id] ??= []).push(p);
  const { byStore: eventsByStore, portfolio } = groupEvents((events ?? []) as EventRow[]);

  const activeStore = RETAILER_STORES.find((s) => s.storeId === activeStoreId);
  const lines: string[] = ["=== YOUR BUSINESS DATA (all branches) ==="];
  if (activeStore) {
    lines.push(
      `ACTIVE STORE: ${activeStore.brand} (${activeStore.type}) at ${activeStore.shortName}. ` +
      `Answer about THIS store by default unless the user names another one. ` +
      `Always call it by its brand name "${activeStore.brand}", never a station code.`
    );
  }

  for (const s of RETAILER_STORES) {
    lines.push(`\n--- ${s.brand} (${s.type}) — ${s.shortName} ---`);

    const ps = (perfByStore[s.storeId] ?? []).slice(0, 2);
    for (const p of ps) {
      lines.push(
        `  Performance ${p.year_month}: ${p.traffic} visits/day · ${p.orders} orders/day · ` +
        `${p.conversion_pct}% convert · ฿${Number(p.avg_basket_thb).toLocaleString()} avg basket · ` +
        `${p.revisit_rate_pct}% revisit`
      );
    }

    const ls = (pnlByStore[s.storeId] ?? []).slice(0, 2);
    for (const p of ls) {
      lines.push(
        `  P&L ${p.year_month}: revenue ฿${Number(p.revenue_thb).toLocaleString()} · ` +
        `rent ฿${Number(p.rent_thb).toLocaleString()} · ` +
        `utilities ฿${Number(p.utilities_thb ?? 0).toLocaleString()} · ` +
        `net ฿${Number(p.net_thb).toLocaleString()}`
      );
    }

    const evs = eventsByStore[s.storeId] ?? [];
    if (evs.length) {
      lines.push(`  Event knowledge (causes of movement at this branch):`);
      for (const e of evs) lines.push(formatEventLine(e));
    }
  }

  if (portfolio.length) {
    lines.push(`\n--- Portfolio-wide events (affect all branches) ---`);
    for (const e of portfolio) lines.push(formatEventLine(e));
  }

  // Station-discovery context — answers "which station suits us, and why?" on the
  // Explore / Station-Detail pages, using the AI match score for this retailer +
  // each station's surroundings.
  const [{ data: matches }, { data: stationRows }] = await Promise.all([
    serviceSupabase.from("ml_matching_scores")
      .select("station_id, match_pct, match_label")
      .eq("retailer_id", RETAILER_ID).order("match_pct", { ascending: false }),
    serviceSupabase.from("stations").select("display_id, name, traffic_level, location_text"),
  ]);
  const stationById: Record<string, { name: string; traffic: string; loc: string }> = {};
  for (const s of (stationRows ?? []) as { display_id: string; name: string; traffic_level: string | null; location_text: string | null }[]) {
    stationById[s.display_id] = { name: s.name, traffic: s.traffic_level ?? "medium", loc: s.location_text ?? "" };
  }
  if ((matches ?? []).length) {
    lines.push(`\n=== STATIONS YOU COULD OPEN AT (your AI match score + why) ===`);
    for (const m of (matches ?? []) as { station_id: string; match_pct: number; match_label: string }[]) {
      const st = stationById[m.station_id];
      if (!st) continue;
      const landmark = stationLandmark(m.station_id);
      lines.push(
        `  ${st.name}: ${Math.round(m.match_pct)}% match (${m.match_label}) · ${st.traffic} traffic · ${st.loc}` +
        (landmark ? ` · near ${landmark}` : "")
      );
    }
    lines.push(`When asked which station suits the retailer, recommend the highest match % and explain why using its traffic and what's nearby.`);
  }

  return lines.join("\n");
}

async function buildLandlordContext(activeStoreId?: string): Promise<string> {
  // Step 1: Fetch portfolio stations with their units
  const { data: stationsData } = await serviceSupabase
    .from("stations")
    .select("id, display_id, name, filter_key, station_units(id, unit_code)")
    .in("filter_key", PORTFOLIO_KEYS);

  const stations = (stationsData ?? []) as any[];
  const stationIds = stations.map((s) => s.id as string);
  const stationDisplayIds = stations.map((s) => s.display_id as string);

  const stationNameById: Record<string, string> = {};
  const displayIdByStationId: Record<string, string> = {};
  const unitCodeById: Record<string, string> = {};
  const unitStationById: Record<string, string> = {};

  for (const s of stations) {
    stationNameById[s.id] = `${s.name} (${s.display_id})`;
    displayIdByStationId[s.id] = s.display_id;
    for (const u of (s.station_units ?? []) as any[]) {
      unitCodeById[u.id] = u.unit_code;
      unitStationById[u.id] = s.id;
    }
  }

  const unitIds = Object.keys(unitCodeById);
  if (stationIds.length === 0) return "=== PORTFOLIO DATA ===\n(no stations found)";

  // activeStoreId on landlord is a filter_key (e.g. "lat_phrao") → resolve to a name
  const activeStation = stations.find((s) => s.filter_key === activeStoreId);

  // Step 2: Latest metrics, events, approved apps, and pending apps in parallel
  const [{ data: metrics }, { data: events }, { data: approvedApps }, { data: pendingApps }] = await Promise.all([
    serviceSupabase
      .from("station_monthly_metrics")
      .select("station_id, year_month, daily_customers_avg, est_revenue_k_thb")
      .in("station_id", stationIds)
      .order("year_month", { ascending: false })
      .limit(18),
    serviceSupabase
      .from("store_events")
      .select("store_display_id, year_month, event_name, event_type, description, est_traffic_lift_pct, est_sales_lift_pct")
      .or(`store_display_id.in.(${stationDisplayIds.join(",")}),store_display_id.is.null`)
      .order("year_month", { ascending: true }),
    unitIds.length
      ? serviceSupabase
          .from("applications")
          .select("id, station_unit_id, retailer_profile_id")
          .in("station_unit_id", unitIds)
          .eq("status", "approved")
      : Promise.resolve({ data: [] as any[] }),
    unitIds.length
      ? serviceSupabase
          .from("applications")
          .select("id, station_unit_id, retailer_profile_id, applied_date")
          .in("station_unit_id", unitIds)
          .eq("status", "pending_review")
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const appList = (approvedApps ?? []) as any[];
  const appIds = appList.map((a) => a.id as string);
  const profileIds = [...new Set(appList.map((a) => a.retailer_profile_id as string))];

  // Step 3: Leases and retailer profile names in parallel
  const [{ data: leases }, { data: profiles }] = await Promise.all([
    appIds.length
      ? serviceSupabase.from("tenant_leases").select("*").in("application_id", appIds)
      : Promise.resolve({ data: [] as any[] }),
    profileIds.length
      ? serviceSupabase
          .from("retailer_profiles")
          .select("id, business_name")
          .in("id", profileIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const profileNameById: Record<string, string> = {};
  for (const p of (profiles ?? []) as any[]) profileNameById[p.id] = p.business_name;

  const lines: string[] = ["=== PORTFOLIO DATA ==="];
  if (activeStation) {
    lines.push(
      `ACTIVE STATION FILTER: ${activeStation.name} (${activeStation.display_id}). ` +
      `Answer about THIS station by default unless the user names another one.`
    );
  }
  const leaseList = (leases ?? []) as any[];

  if (leaseList.length) {
    const totalRent = leaseList.reduce((s: number, l: any) => s + ((l.monthly_rent as number) ?? 0), 0);
    const expiring = leaseList.filter((l: any) => {
      if (!l.end_date) return false;
      const daysLeft = (new Date(l.end_date).getTime() - Date.now()) / 86400000;
      return daysLeft >= 0 && daysLeft <= 60;
    });
    lines.push(
      `\nPORTFOLIO SUMMARY: ${leaseList.length} active leases · ` +
      `฿${totalRent.toLocaleString()}/mo total rent · ` +
      `${expiring.length} expiring within 60 days`
    );
    lines.push("\nACTIVE LEASES:");
    for (const l of leaseList) {
      const app = appList.find((a) => a.id === l.application_id);
      const unitId = app?.station_unit_id as string | undefined;
      const stId = unitId ? unitStationById[unitId] : null;
      const retailer = app ? (profileNameById[app.retailer_profile_id] ?? "?") : "?";
      lines.push(
        `  ${stId ? stationNameById[stId] : "?"} Unit ${unitId ? unitCodeById[unitId] : "?"} [${retailer}]: ` +
        `฿${((l.monthly_rent as number) ?? 0).toLocaleString()}/mo · ends ${l.end_date}`
      );
    }
  }

  if ((metrics ?? []).length) {
    lines.push("\nRECENT STATION METRICS:");
    for (const m of (metrics ?? []) as any[]) {
      lines.push(
        `  ${stationNameById[m.station_id] ?? m.station_id} ${m.year_month}: ` +
        `฿${(((m.est_revenue_k_thb as number) ?? 0) * 1000).toLocaleString()} revenue · ` +
        `${m.daily_customers_avg} customers/day`
      );
    }
  }

  const { byStore: eventsByDisplayId, portfolio } = groupEvents((events ?? []) as EventRow[]);
  const stationsWithEvents = stations.filter((s) => (eventsByDisplayId[s.display_id] ?? []).length);
  if (stationsWithEvents.length) {
    lines.push("\nEVENT KNOWLEDGE (causes of station-level movement):");
    for (const s of stationsWithEvents) {
      lines.push(`  ${s.name} (${s.display_id}):`);
      for (const e of eventsByDisplayId[s.display_id]) lines.push(formatEventLine(e));
    }
  }
  if (portfolio.length) {
    lines.push("\nPORTFOLIO-WIDE EVENTS (affect all stations):");
    for (const e of portfolio) lines.push(formatEventLine(e));
  }

  const pendingList = (pendingApps ?? []) as any[];
  if (pendingList.length) {
    lines.push(`\nPENDING APPLICATIONS: ${pendingList.length} awaiting review`);
    for (const p of pendingList) {
      const unitId = p.station_unit_id as string | undefined;
      const stId = unitId ? unitStationById[unitId] : null;
      const retailer = profileNameById[p.retailer_profile_id] ?? "Unknown";
      lines.push(
        `  ${stId ? stationNameById[stId] : "?"} Unit ${unitId ? unitCodeById[unitId] : "?"} [${retailer}]: applied ${p.applied_date}`
      );
    }
  }

  return lines.join("\n");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, role, pageContext, activeStoreId, conversationId, userId } = req.body as {
    message:         string;
    role:            "retailer" | "landlord";
    pageContext?:    string;
    activeStoreId?:  string;
    conversationId?: string;
    userId?:         string;
  };

  if (!message || !role) return res.status(400).json({ error: "message and role are required" });

  try {
    const [historyResult, convResult, userDataContext] = await Promise.all([
      conversationId
        ? serviceSupabase
            .from("ai_messages")
            .select("role, content")
            .eq("conversation_id", conversationId)
            .order("created_at", { ascending: true })
            .limit(20)
        : Promise.resolve({ data: null }),

      (!conversationId && userId)
        ? serviceSupabase
            .from("ai_conversations")
            .insert({ user_id: userId, role, page_context: pageContext ?? null })
            .select("id")
            .single()
        : Promise.resolve({ data: null }),

      role === "retailer" ? buildRetailerContext(activeStoreId) : buildLandlordContext(activeStoreId),
    ]);

    const convId = conversationId ?? (convResult.data as { id?: string } | null)?.id;

    const history: ChatMessage[] = historyResult.data
      ? (historyResult.data as { role: string; content: string }[]).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      : [];

    const base = buildSystemPrompt(role, pageContext, activeStoreId);
    const systemPrompt = userDataContext
      ? `${base}\n\n${userDataContext}\n\nUse the data above to answer questions specifically and accurately. Always reference real numbers when relevant.`
      : base;

    const aiResponse = await generateChatResponse(systemPrompt, history, message);

    if (convId) {
      await serviceSupabase.from("ai_messages").insert([
        { conversation_id: convId, role: "user",      content: message    },
        { conversation_id: convId, role: "assistant", content: aiResponse },
      ]);
    }

    return res.status(200).json({ reply: aiResponse, conversationId: convId ?? null });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI error";
    console.error("[ai/chat]", msg);
    return res.status(500).json({ error: msg });
  }
}
