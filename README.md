# PTG Retail Intelligence Platform

A two-sided web platform that **redesigns the retail-leasing decision** at PTG petrol
stations. It matches **landlords** (who lease retail space at stations) with **retailers**
(who want to open shops there), and embeds three *separated* AI paradigms —
**Symbolic, Predictive, and Generative** — directly into the leasing workflow.

> Term project demo. Bilingual **EN/TH** throughout. Two seeded test accounts:
> `retailer@ptg.test` (Lumina Retail Group, a multi-format operator with 4 stores) and
> `landlord@ptg.test` (PTG property manager over 6 stations).

---

## What it does

**For retailers**
- Explore stations on an interactive **Leaflet map** and view per-station detail pages.
- Apply for a unit; track applications (Submitted → Approved → Booking).
- A live **dashboard** + **ML Predictions** page: revenue forecast, customer origins /
  catchment, churn risk, best/worst hours, anomalies — all from real per-store data.
- An **AI advisor chatbot** (on Explore, Station Detail, and the back office) that answers
  "which station suits my shop and why," grounded in match scores and each station's
  surroundings.

**For landlords**
- **Executive overview**, **My Stations**, **Tenant Applications**, and **Tenant
  Management**, all filterable per station.
- **Decision support** on each application: a Predictive match score, Symbolic
  approve/review/decline rules, and a Generative plain-language explanation.
- **Best-fit store types per station** — location-aware recommendations (e.g. *near a
  university → bakery & dessert*) that say what kind of tenant to recruit and why.
- AI suggestions and a property advisor chatbot scoped to the selected station.

---

## The three AI paradigms (separated responsibilities)

The recurring decision — *"should this landlord approve this tenant for this unit?"* — is
produced by three distinct layers, each with one job. The Symbolic layer can **override**
the Predictive score (a 90/100 match to an *unavailable* unit is still declined), and the
human landlord always makes the final, accountable call.

| Paradigm | Job | Where it lives |
|---|---|---|
| **Symbolic AI** | Enforce rules & constraints (approve / review / decline) | `agent/rules/` — `policies.ts`, `decisionEngine.ts`, `stationFit.ts` |
| **Predictive AI** | Produce scores & forecasts (match, revenue, churn, anomaly) | `agent/ml/service/` (Python) → `ml_*` tables, `applications.ai_score` |
| **Generative AI** | Explain & interact (advice, chat, bilingual summaries) | `agent/ai/` — Gemini via `geminiClient.ts`, `systemPrompts.ts` |

See `docs/` (local only) for the full architecture, data model, and business-value write-ups.

---

## Tech stack

- **Next.js 15** (Pages Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling; **Recharts** for charts; **Leaflet** for maps
- **Supabase** (Postgres) — data, auth, RLS (deny-direct; API routes use the service role),
  and Realtime for live application/notification updates
- **Google Gemini** (`@google/genai`) — `gemini-2.5-flash` primary, `gemini-2.0-flash`
  fallback; AI summaries cached in `ai_summaries`
- **Python ML service** (FastAPI, scikit-learn `.joblib` models) under `agent/ml/service/`,
  re-trained/scored on a schedule via **Vercel cron** → `/api/cron/ml-run`
- Deployed on **Vercel**

---

## Project structure

```
agent/
  ai/        Gemini client + system prompts (Generative)
  rules/     decision engine, policies, station-fit (Symbolic)
  ml/        ML types + Python FastAPI service & models (Predictive)
components/  React UI (retailer & landlord back office, explore, shared)
lib/         contexts (auth, language, station/store filters) + retailerStores
             (single source of truth for the demo retailer's stores)
pages/
  api/       Next.js API routes (ai, applications, landlord, retailer, ml, cron…)
  ...        retailer_backoffice/, landlord_backoffice/, explorepage/, etc.
style/       global styles & design tokens
supabase/    migrations/ + seeds/ (see supabase/seeds/RESTORE_DEMO.md)
docs/        internal architecture & presentation docs (gitignored)
```

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Create a `.env` (gitignored) with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
ML_SERVICE_URL=...        # base URL of the Python ML service
CRON_SECRET=...           # guards /api/cron/ml-run
```

**Database / demo data:** apply `supabase/migrations/`, then seed. To restore the full
demo state (applications, leases, tenants, per-store differentiation) after a reset, follow
`supabase/seeds/RESTORE_DEMO.md` — run seeds in order **012 → 013 → 015 → 014**.

```bash
npm run build      # production build
npm run lint
```

---

## Notes

- This is a **demo / academic** project; the data is seeded and the recommendations are
  illustrative, not financial advice.
- The `docs/` folder holds internal design notes and is intentionally **not committed**.
