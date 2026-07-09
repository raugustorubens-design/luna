import { checkpoint as defaultCheckpoint } from "../../luna/memory-engine";
import { readProjectContext } from "../../luna/indice-cognitivo";
import { submitAsKnowledge as defaultSubmitAsKnowledge } from "../knowledge/knowledge-gate";
import type { ConsolidationDecision } from "../../luna/hipocampo";
import type { KnowledgeCandidate } from "../knowledge/knowledge-gate";

export interface TrainingInput {
  title: string;
  content: string;
}

export interface ExtractedRelation {
  from: string;
  to: string;
  type: "co_occurs_with";
}

export interface TrainingExtraction {
  concepts: string[];
  procedures: string[];
  relations: ExtractedRelation[];
  compactedSummary: string;
  inferences: string[];
}

export interface TrainingToMemoryResult {
  extraction: TrainingExtraction;
  decisions: {
    semantica?: ConsolidationDecision;
    procedimental?: ConsolidationDecision;
    inferencial?: ConsolidationDecision;
  };
}

function dedupe(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter((item) => item.length > 0))];
}

/** Deterministic — headings and bullet lines are treated as concept candidates. */
export function extractConcepts(content: string): string[] {
  const lines = content.split("\n");
  return dedupe(
    lines
      .filter((line) => /^\s*#{1,6}\s+/.test(line) || /^\s*[-*]\s+/.test(line))
      .map((line) => line.replace(/^\s*(#{1,6}|[-*])\s+/, "").trim()),
  );
}

/** Deterministic — numbered lines and "Passo"/"Etapa" markers are treated as procedure steps. */
export function extractProcedures(content: string): string[] {
  const lines = content.split("\n");
  return dedupe(
    lines
      .filter((line) => /^\s*\d+[.)]\s+/.test(line) || /^\s*(passo|etapa)\s*\d*[:.]?/i.test(line))
      .map((line) => line.replace(/^\s*\d+[.)]\s+/, "").replace(/^\s*(passo|etapa)\s*\d*[:.]?\s*/i, "").trim()),
  );
}

/** Deterministic co-occurrence within the same paragraph — no embeddings, no semantic linking. */
export function extractRelations(content: string, concepts: string[]): ExtractedRelation[] {
  if (concepts.length < 2) return [];

  const paragraphs = content.split(/\n\s*\n/);
  const relations: ExtractedRelation[] = [];
  const seen = new Set<string>();

  for (const paragraph of paragraphs) {
    const present = concepts.filter((concept) => concept.length > 0 && paragraph.includes(concept));
    for (let i = 0; i < present.length; i += 1) {
      for (let j = i + 1; j < present.length; j += 1) {
        const key = [present[i], present[j]].sort().join("|||");
        if (seen.has(key)) continue;
        seen.add(key);
        relations.push({ from: present[i]!, to: present[j]!, type: "co_occurs_with" });
      }
    }
  }

  return relations;
}

/**
 * "Compactação" here is deterministic truncation/deduplication — a bullet
 * list of what was actually extracted, not a semantic summary. Matches
 * ADR-003's "compress" tier without pretending to have the "preserve
 * meaning" guarantee that only a real summarization model could offer.
 */
function compact(concepts: string[], procedures: string[]): string {
  const parts: string[] = [];
  if (concepts.length > 0) parts.push(`Conceitos: ${concepts.join("; ")}`);
  if (procedures.length > 0) parts.push(`Procedimentos: ${procedures.join("; ")}`);
  return parts.join("\n") || "Nenhum conceito ou procedimento extraído.";
}

/**
 * "Reconstrução híbrida" v1: logical only. Cross-references extracted
 * concepts against the real luna_context (ROADMAP/DECISIONS) already read
 * by the Índice Cognitivo — a deterministic substring match, not a semantic
 * inference model. Semantic reconstruction remains unimplemented for the
 * same infrastructure reason documented in `indice-cognitivo.ts`.
 */
async function inferAgainstProjectContext(concepts: string[]): Promise<string[]> {
  if (concepts.length === 0) return [];
  const projectContext = await readProjectContext();
  const knownItems = [...projectContext.roadmap, ...projectContext.evolutiveContext];

  const inferences: string[] = [];
  for (const concept of concepts) {
    const match = knownItems.find((item) => item.toLowerCase().includes(concept.toLowerCase()));
    if (match) {
      inferences.push(`"${concept}" já aparece no contexto evolutivo do projeto: "${match}"`);
    }
  }
  return inferences;
}

/**
 * Treinamento → Extração de Conceitos → Extração de Procedimentos →
 * Extração de Relações → Compactação → Reconstrução Híbrida → Hipocampo →
 * Memory Engine → database.
 *
 * Produces up to three knowledge submissions (semântica, procedimental,
 * inferencial per Prompt 3's "Geração de Conhecimento"), each independently
 * validated by Hipocampo — a training with no procedures yields no
 * procedimental submission rather than an empty one.
 */
export interface TrainingToMemoryDeps {
  submitAsKnowledge: (candidate: KnowledgeCandidate) => Promise<ConsolidationDecision>;
  checkpoint: (summary: Record<string, unknown>) => Promise<void>;
}

const defaultDeps: TrainingToMemoryDeps = {
  submitAsKnowledge: defaultSubmitAsKnowledge,
  checkpoint: defaultCheckpoint,
};

export async function convertTrainingToMemory(
  training: TrainingInput,
  deps: TrainingToMemoryDeps = defaultDeps,
): Promise<TrainingToMemoryResult> {
  const concepts = extractConcepts(training.content);
  const procedures = extractProcedures(training.content);
  const relations = extractRelations(training.content, concepts);
  const compactedSummary = compact(concepts, procedures);
  const inferences = await inferAgainstProjectContext(concepts);

  const extraction: TrainingExtraction = { concepts, procedures, relations, compactedSummary, inferences };
  const decisions: TrainingToMemoryResult["decisions"] = {};

  if (concepts.length > 0 || relations.length > 0) {
    decisions.semantica = await deps.submitAsKnowledge({
      document: trainingAsCanonicalDocument(training, "concepts", concepts),
      knowledgeType: "semantica",
      summary: compactedSummary,
      extra: { relations },
    });
  }

  if (procedures.length > 0) {
    decisions.procedimental = await deps.submitAsKnowledge({
      document: trainingAsCanonicalDocument(training, "procedures", procedures),
      knowledgeType: "procedimental",
      summary: compactedSummary,
    });
  }

  if (inferences.length > 0) {
    decisions.inferencial = await deps.submitAsKnowledge({
      document: trainingAsCanonicalDocument(training, "inferences", inferences),
      knowledgeType: "inferencial",
      summary: inferences.join(" | "),
      extra: { inferences },
    });
  }

  await deps.checkpoint({
    kind: "training_to_memory",
    trainingTitle: training.title,
    conceptCount: concepts.length,
    procedureCount: procedures.length,
    relationCount: relations.length,
    inferenceCount: inferences.length,
  });

  return { extraction, decisions };
}

function trainingAsCanonicalDocument(
  training: TrainingInput,
  kind: "concepts" | "procedures" | "inferences",
  items: string[],
) {
  return {
    title: `${training.title} — ${kind}`,
    columns: ["item"],
    records: items.map((item) => ({ fields: [{ name: "item", value: item }] })),
    metadata: {
      sourceFormat: "json" as const,
      sourceName: training.title,
      parsedAt: new Date().toISOString(),
      recordCount: items.length,
    },
  };
}
