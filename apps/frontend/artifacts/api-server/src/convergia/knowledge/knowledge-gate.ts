import { decideAndConsolidate, type ConsolidationCandidate, type ConsolidationDecision } from "../../luna/hipocampo";
import { persistMemory, retrieveMemory } from "../../luna/memory-engine";
import type { CanonicalDocument } from "../contracts";
import type { LunaMemoryRecord } from "../../luna/contracts";

/**
 * The only path from Convergia to persistence:
 *   Convergia → Filtro Cognitivo → Hipocampo → Memory Engine → database
 *
 * Filtro Cognitivo lives inside Hipocampo (per ADR-003 and how it was built
 * in the backend consolidation pass) — this module does not persist
 * anything itself, it only shapes a Convergia result into the same
 * `ConsolidationCandidate` contract Hipocampo already accepts from the
 * Cognitive Engine, and hands it over. No database client import here —
 * enforced by architecture-check, same as the Cognitive Engine boundary.
 */
export interface KnowledgeCandidate {
  document: CanonicalDocument;
  knowledgeType: "semantica" | "procedimental" | "inferencial";
  summary: string;
  /** Extra structured data (e.g. extracted relations) merged into `conteudo`. */
  extra?: Record<string, unknown>;
}

export interface KnowledgeGateDeps {
  retrieveMemory: (query: string) => Promise<LunaMemoryRecord[]>;
  persist: (input: ConsolidationCandidate) => Promise<void>;
}

const defaultDeps: KnowledgeGateDeps = { retrieveMemory, persist: persistMemory };

function recordsToPlainObjects(document: CanonicalDocument): Record<string, unknown>[] {
  return document.records.map((record) => Object.fromEntries(record.fields.map((field) => [field.name, field.value])));
}

export async function submitAsKnowledge(
  candidate: KnowledgeCandidate,
  deps: KnowledgeGateDeps = defaultDeps,
): Promise<ConsolidationDecision> {
  const recentMemories = await deps.retrieveMemory(candidate.document.title);

  return decideAndConsolidate(
    {
      tipo: `convergia_${candidate.knowledgeType}`,
      contexto: "convergia_knowledge_gate",
      titulo: candidate.document.title,
      empresa_id: 1,
      conteudo: {
        summary: candidate.summary,
        sourceFormat: candidate.document.metadata.sourceFormat,
        recordCount: candidate.document.metadata.recordCount,
        columns: candidate.document.columns,
        records: recordsToPlainObjects(candidate.document),
        ...(candidate.extra ?? {}),
      },
    },
    recentMemories,
    deps.persist,
  );
}
