// ─────────────────────────────────────────────────────────────────────────────
// SYMBOLIC AI — Deterministic decision engine for the tenant-approval decision.
//
// Pure function: same inputs → same output, no AI, no I/O. It consumes the
// PREDICTIVE score + hard facts, applies the LEASING_POLICY rules, and returns a
// structured, explainable recommendation. The landlord remains the decision
// owner (advisory only) — accountability stays human.
// ─────────────────────────────────────────────────────────────────────────────

import { LEASING_POLICY } from "./policies";

export type CheckStatus = "pass" | "warn" | "fail";
export type Decision = "approve_recommended" | "review_required" | "decline_recommended";

export type RuleCheck = {
  rule:      string;
  status:    CheckStatus;
  message:   string; // EN
  messageTh: string; // TH
};

export interface EvaluationInput {
  businessName:            string;
  stationName:            string;
  matchScore:             number | null;   // Predictive AI output (0–100); null = unavailable
  profileMissingFields:   string[];        // empty = complete
  unitAvailable:          boolean;
  rentPerSqm:             number | null;
  stationMedianRentPerSqm: number | null;
}

export interface EvaluationResult {
  decision:       Decision;
  checks:         RuleCheck[];
  scoreAvailable: boolean;
  rentBand:       { floor: number; ceiling: number } | null;
}

export function evaluateApplication(input: EvaluationInput): EvaluationResult {
  const checks: RuleCheck[] = [];
  const P = LEASING_POLICY;

  // ── Rule 1 — Profile completeness (hard constraint) ────────────────────────
  if (input.profileMissingFields.length === 0) {
    checks.push({
      rule: "Profile completeness",
      status: "pass",
      message: "Tenant business profile is complete.",
      messageTh: "ข้อมูลโปรไฟล์ผู้เช่าครบถ้วน",
    });
  } else {
    checks.push({
      rule: "Profile completeness",
      status: "fail",
      message: `Profile is missing: ${input.profileMissingFields.join(", ")}.`,
      messageTh: `โปรไฟล์ขาดข้อมูล: ${input.profileMissingFields.join(", ")}`,
    });
  }

  // ── Rule 2 — Unit availability (hard constraint) ───────────────────────────
  checks.push(
    input.unitAvailable
      ? { rule: "Unit availability", status: "pass",
          message: "The requested unit is available to lease.",
          messageTh: "ยูนิตที่ขอยังว่างให้เช่าได้" }
      : { rule: "Unit availability", status: "fail",
          message: "The requested unit is no longer available (already leased).",
          messageTh: "ยูนิตที่ขอไม่ว่างแล้ว (ถูกเช่าไปแล้ว)" }
  );

  // ── Rule 3 — Predictive match-score gate ───────────────────────────────────
  const scoreAvailable = input.matchScore != null;
  if (!scoreAvailable) {
    checks.push({
      rule: "Match score gate",
      status: "warn",
      message: "No predictive match score available — route to manual review.",
      messageTh: "ไม่มีคะแนนการจับคู่จาก AI — ส่งให้พิจารณาด้วยตนเอง",
    });
  } else {
    const s = input.matchScore as number;
    if (s >= P.matchScore.approveMin) {
      checks.push({ rule: "Match score gate", status: "pass",
        message: `Match score ${s}/100 — strong tenant–station fit.`,
        messageTh: `คะแนนการจับคู่ ${s}/100 — เหมาะสมกับสาขาอย่างมาก` });
    } else if (s >= P.matchScore.reviewMin) {
      checks.push({ rule: "Match score gate", status: "warn",
        message: `Match score ${s}/100 — moderate fit, needs review.`,
        messageTh: `คะแนนการจับคู่ ${s}/100 — เหมาะสมปานกลาง ควรพิจารณา` });
    } else {
      checks.push({ rule: "Match score gate", status: "fail",
        message: `Match score ${s}/100 — weak fit, below approval threshold.`,
        messageTh: `คะแนนการจับคู่ ${s}/100 — เหมาะสมต่ำ ต่ำกว่าเกณฑ์อนุมัติ` });
    }
  }

  // ── Rule 4 — Rent guardrail ────────────────────────────────────────────────
  let rentBand: { floor: number; ceiling: number } | null = null;
  if (input.rentPerSqm != null && input.stationMedianRentPerSqm != null && input.stationMedianRentPerSqm > 0) {
    const floor = Math.round(input.stationMedianRentPerSqm * P.rentBand.lowerPct);
    const ceiling = Math.round(input.stationMedianRentPerSqm * P.rentBand.upperPct);
    rentBand = { floor, ceiling };
    const rps = Math.round(input.rentPerSqm);
    if (rps >= floor && rps <= ceiling) {
      checks.push({ rule: "Rent guardrail", status: "pass",
        message: `Rent ฿${rps}/sqm is within the station band (฿${floor}–฿${ceiling}/sqm).`,
        messageTh: `ค่าเช่า ฿${rps}/ตร.ม. อยู่ในเกณฑ์ของสาขา (฿${floor}–฿${ceiling}/ตร.ม.)` });
    } else if (rps > ceiling) {
      checks.push({ rule: "Rent guardrail", status: "warn",
        message: `Rent ฿${rps}/sqm is above the station band (฿${floor}–฿${ceiling}/sqm) — vacancy risk.`,
        messageTh: `ค่าเช่า ฿${rps}/ตร.ม. สูงกว่าเกณฑ์ (฿${floor}–฿${ceiling}/ตร.ม.) — เสี่ยงปล่อยไม่ออก` });
    } else {
      checks.push({ rule: "Rent guardrail", status: "warn",
        message: `Rent ฿${rps}/sqm is below the station band (฿${floor}–฿${ceiling}/sqm) — lost revenue.`,
        messageTh: `ค่าเช่า ฿${rps}/ตร.ม. ต่ำกว่าเกณฑ์ (฿${floor}–฿${ceiling}/ตร.ม.) — เสียโอกาสรายได้` });
    }
  }

  // ── Aggregate → decision ───────────────────────────────────────────────────
  // Hard fails first (these override even a high predictive score).
  const failed = checks.filter((c) => c.status === "fail");
  const warned = checks.filter((c) => c.status === "warn");

  let decision: Decision;
  if (!input.unitAvailable) {
    // Unit gone → decline regardless of how strong the match score is.
    decision = "decline_recommended";
  } else if (input.profileMissingFields.length > 0) {
    decision = "review_required";
  } else if (scoreAvailable && (input.matchScore as number) < P.matchScore.reviewMin) {
    decision = "decline_recommended";
  } else if (failed.length > 0) {
    decision = "decline_recommended";
  } else if (warned.length > 0) {
    decision = "review_required";
  } else {
    decision = "approve_recommended";
  }

  return { decision, checks, scoreAvailable, rentBand };
}
