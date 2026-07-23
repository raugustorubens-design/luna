import { emitReport } from "./reporter";
import { persistMemory, type MemoryPersistInput } from "./memory-engine";
import type { LunaMemoryRecord } from "./contracts";
import type { MemorySignals } from "./memory-signals";

export type ConsolidationCandidate = MemoryPersistInput;

export interface ConsolidationDecision {
  action: "consolidate" | "discard";
  reason: string;
}

/**
 * Deliberately shape-agnostic: Hipocampo receives candidates from more than
 * one source now (Cognitive Engine's chat interactions, Convergia's
 * transformation/knowledge results), each with a different `conteudo`
 * shape. A candidate is meaningful if it carries at least one non-empty
 * value anywhere in its content — not tied to specific field names.
 */
function isMeaningful(candidate: ConsolidationCandidate): boolean {
  const content = candidate.conteudo;
  if (content === null || content === undefined) return false;
  if (typeof content !== "object") return String(content).trim().length > 0;
  return Object.values(content as Record<string, unknown>).some((value) => {
    if (value === null || value === undefined) return false;
    return String(value).trim().length > 0;
  });
}

function isImmediateDuplicate(
  candidate: ConsolidationCandidate,
  lastMemory: LunaMemoryRecord | undefined,
): boolean {
  if (!lastMemory) return false;
  return JSON.stringify(lastMemory.conteudo ?? null) === JSON.stringify(candidate.conteudo ?? null);
}

/**
 * Hipocampo: decides what gets consolidated. Never touches the database
 * directly — every persistence path goes through the Memory Engine's
 * `persistMemory`.
 *
 * This is a v1 filter (empty-content + immediate-duplicate rules), not the
 * full K(t) = f(L, C, I, T) formula from ADR-003 — that formula has no
 * concrete algorithm defined anywhere in the project yet, and fabricating
 * one here would misrepresent the organism's real maturity.
 */
export async function decideAndConsolidate(
  candidate: ConsolidationCandidate,
  recentMemories: LunaMemoryRecord[],
  persist: (input: ConsolidationCandidate) => Promise<void> = persistMemory,
): Promise<ConsolidationDecision> {
  if (!isMeaningful(candidate)) {
    const decision: ConsolidationDecision = { action: "discard", reason: "empty_or_incomplete_content" };
    emitReport({ name: "hipocampo.decision", evidence: { decision } });
    return decision;
  }

  if (isImmediateDuplicate(candidate, recentMemories[0])) {
    const decision: ConsolidationDecision = { action: "discard", reason: "immediate_duplicate" };
    emitReport({ name: "hipocampo.decision", evidence: { decision } });
    return decision;
  }

  await persist(candidate);

  const decision: ConsolidationDecision = { action: "consolidate", reason: "meaningful_new_interaction" };
  emitReport({ name: "hipocampo.decision", evidence: { decision } });
  return decision;
}

/**
 * Decision thresholds for `decideAndConsolidateV2`, bucketing the Signal
 * Engine's `impact` into high/moderate/low/discard tiers. Parameterized (not
 * hardcoded) so a future calibration pass can tune these without touching
 * this file — these defaults are not derived from real usage data yet.
 */
export interface ConsolidationThresholds {
  /** impact >= this → consolidate as high impact. */
  consolidateThreshold: number;
  /** impact >= this (and below consolidateThreshold) → consolidate, flagged for review. */
  reviewThreshold: number;
  /** impact >= this (and below reviewThreshold) → consolidate as low priority. Below it → discard. */
  discardThreshold: number;
}

export const DEFAULT_CONSOLIDATION_THRESHOLDS: ConsolidationThresholds = {
  consolidateThreshold: 0.8,
  reviewThreshold: 0.6,
  discardThreshold: 0.3,
};

type ImpactTier = "high_impact" | "moderate_impact_review_recommended" | "low_impact" | "impact_below_threshold";

function classifyImpact(impact: number, thresholds: ConsolidationThresholds): ImpactTier {
  if (impact >= thresholds.consolidateThreshold) return "high_impact";
  if (impact >= thresholds.reviewThreshold) return "moderate_impact_review_recommended";
  if (impact >= thresholds.discardThreshold) return "low_impact";
  return "impact_below_threshold";
}

/**
 * V2: same empty-content and immediate-duplicate guard rails as v1, plus a
 * threshold-driven decision over the candidate's Signal Engine reading.
 * `signals` is computed by the caller (`computeMemorySignals`) — this
 * function, like v1, never touches persistence beyond calling `persist`.
 */
export async function decideAndConsolidateV2(
  candidate: ConsolidationCandidate,
  recentMemories: LunaMemoryRecord[],
  signals: MemorySignals,
  thresholds: ConsolidationThresholds = DEFAULT_CONSOLIDATION_THRESHOLDS,
  persist: (input: ConsolidationCandidate) => Promise<void> = persistMemory,
): Promise<ConsolidationDecision> {
  if (!isMeaningful(candidate)) {
    const decision: ConsolidationDecision = { action: "discard", reason: "empty_or_incomplete_content" };
    emitReport({ name: "hipocampo.decision_v2", evidence: { decision, signals } });
    return decision;
  }

  if (isImmediateDuplicate(candidate, recentMemories[0])) {
    const decision: ConsolidationDecision = { action: "discard", reason: "immediate_duplicate" };
    emitReport({ name: "hipocampo.decision_v2", evidence: { decision, signals } });
    return decision;
  }

  const tier = classifyImpact(signals.impact, thresholds);

  if (tier === "impact_below_threshold") {
    const decision: ConsolidationDecision = {
      action: "discard",
      reason: `impact_below_threshold(${thresholds.discardThreshold})`,
    };
    emitReport({ name: "hipocampo.decision_v2", evidence: { decision, signals } });
    return decision;
  }

  await persist(candidate);

  const decision: ConsolidationDecision = { action: "consolidate", reason: tier };
  emitReport({ name: "hipocampo.decision_v2", evidence: { decision, signals } });
  return decision;
}
