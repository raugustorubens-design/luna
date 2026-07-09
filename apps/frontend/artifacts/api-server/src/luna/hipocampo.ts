import { emitReport } from "./reporter";
import { persistMemory, type MemoryPersistInput } from "./memory-engine";
import type { LunaMemoryRecord } from "./contracts";

export type ConsolidationCandidate = MemoryPersistInput;

export interface ConsolidationDecision {
  action: "consolidate" | "discard";
  reason: string;
}

interface InteractionContent {
  user_message?: unknown;
  assistant_response?: unknown;
}

function isMeaningful(candidate: ConsolidationCandidate): boolean {
  const content = candidate.conteudo as InteractionContent;
  const userMessage = String(content?.user_message ?? "").trim();
  const assistantResponse = String(content?.assistant_response ?? "").trim();
  return userMessage.length > 0 && assistantResponse.length > 0;
}

function isImmediateDuplicate(
  candidate: ConsolidationCandidate,
  lastMemory: LunaMemoryRecord | undefined,
): boolean {
  if (!lastMemory) return false;
  const last = lastMemory.conteudo as InteractionContent | undefined;
  const current = candidate.conteudo as InteractionContent;
  return (
    last?.user_message === current?.user_message &&
    last?.assistant_response === current?.assistant_response
  );
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
