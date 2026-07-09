import { emitReport } from "./reporter";
import { persistMemory, type MemoryPersistInput } from "./memory-engine";
import type { LunaMemoryRecord } from "./contracts";

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
