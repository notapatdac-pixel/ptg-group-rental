// ─────────────────────────────────────────────────────────────────────────────
// SYMBOLIC AI — Business rules & constraints (the "rules" paradigm)
//
// This is the explicit, deterministic, auditable policy layer of the platform.
// It is intentionally separated from:
//   • Predictive AI (ml_* tables / ai_score — produces the match/success SCORE)
//   • Generative AI (Gemini — EXPLAINS the decision in plain language)
//
// Rules here gate the predictive score and enforce hard constraints. They are
// human-readable and tunable in one place, so the leasing policy is governable
// (and a failing/absent ML score never auto-approves a lease).
// ─────────────────────────────────────────────────────────────────────────────

export const LEASING_POLICY = {
  // Predictive match/success score (0–100) thresholds.
  matchScore: {
    approveMin: 85, // ≥ 85  → strong fit, eligible to auto-recommend approval
    reviewMin:  70, // 70–84 → moderate fit, route to manual review
    // < 70       → weak fit, recommend decline
  },

  // Rent guardrail: a unit's rent-per-sqm must sit within this band of the
  // station's median rent-per-sqm. Outside the band = pricing risk
  // (over-priced → vacancy risk; under-priced → lost revenue).
  rentBand: {
    lowerPct: 0.85,
    upperPct: 1.20,
  },

  // Hard eligibility constraints — a tenant profile must carry these fields
  // before an application can be recommended for approval.
  requiredProfileFields: ["business_name", "category", "concept"] as const,
} as const;

export type LeasingPolicy = typeof LEASING_POLICY;

// Analytics policy — what counts as a *material* signal worth surfacing.
export const ANALYTICS_POLICY = {
  // An anomaly is only shown if it deviates at least this much from normal.
  // Smaller wobbles (e.g. a 1% revenue blip) are noise — ignore them.
  anomalyMinDeviation: 0.03,
} as const;
