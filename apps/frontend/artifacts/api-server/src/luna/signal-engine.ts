// src/luna/signal-engine.ts
//
// Signal Engine: turns a memory candidate + the existing memories relevant
// to it into a `MemorySignals` reading.
//
// Non-negotiable rule: this file never queries, persists, calls a
// provider, caches, or calls an LLM. Callers fetch whatever existing
// memories matter and pass them in; everything here is computed from
// arguments only, which is what makes it testable with fixed data and no
// network mocks.

import { lexicalSimilarity, tokenize } from "./memory-engine";
import type { MemorySignals } from "./memory-signals";

/**
 * Decoupled from any persistence-layer record shape on purpose — the
 * Signal Engine must not know about `LunaMemoryRecord` or the Hippocampus's
 * `CognitiveConcept`. Callers adapt their own memory shape into this.
 */
export interface MemoryObject {
  /** Semantic identity, when known. Used as the topic proxy for entropy. */
  key?: string;
  content: unknown;
  /** ISO timestamp. Used for recurrence's temporal decay. */
  createdAt?: string;
}

/**
 * Signal Engine as an interface, not a loose function: `DefaultSignalCalculator`
 * is today's (lexical-only) implementation, but this seam lets a future
 * implementation (e.g. embeddings-backed) be swapped in without touching
 * anything else that depends on `MemorySignals`.
 */
export interface SignalCalculator {
  calculate(memory: MemoryObject, existing: MemoryObject[]): MemorySignals;
}

/** Recurrence's temporal decay rate (per day). Not tuned against real usage data yet — a placeholder that at least decays. */
const RECURRENCE_DECAY_LAMBDA = 0.05;

/** A candidate counts toward recurrence only once it's "similar enough" to an existing memory. */
const RECURRENCE_SIMILARITY_THRESHOLD = 0.5;

/**
 * Two memories that share a topic (same key) but whose content similarity
 * falls below this ceiling are considered to conflict. Deliberately high:
 * the whole point of "same topic, different content" is that most of the
 * text overlaps (subject, verb, surrounding words) except for the part that
 * actually changed — an exact/near-duplicate (similarity close to 1) is
 * recurrence, not conflict.
 */
const ENTROPY_CONTENT_CONFLICT_CEILING = 0.9;

function contentText(content: unknown): string {
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content) ?? "";
  } catch {
    return String(content);
  }
}

function daysBetween(isoA: string, isoB: string): number {
  const diffMs = Math.abs(new Date(isoA).getTime() - new Date(isoB).getTime());
  return diffMs / (1000 * 60 * 60 * 24);
}

interface SimilarityEntry {
  memory: MemoryObject;
  similarity: number;
}

function computeEntropy(
  candidate: MemoryObject,
  similarities: SimilarityEntry[],
): { entropy: number; explanation: string[] } {
  if (!candidate.key) {
    return { entropy: 0, explanation: ["candidato sem key — conflito de tópico não computável nesta v1"] };
  }

  const sameTopic = similarities.filter((entry) => entry.memory.key === candidate.key);
  if (sameTopic.length === 0) {
    return { entropy: 0, explanation: [`nenhuma memória existente com o mesmo tópico (key="${candidate.key}")`] };
  }

  const lowestContentSimilarity = Math.min(...sameTopic.map((entry) => entry.similarity));
  const conflict = lowestContentSimilarity <= ENTROPY_CONTENT_CONFLICT_CEILING;

  if (!conflict) {
    return {
      entropy: 0,
      explanation: [
        `mesmo tópico (key="${candidate.key}"), sem conflito de conteúdo detectado (similaridade mínima ${lowestContentSimilarity.toFixed(2)})`,
      ],
    };
  }

  return {
    entropy: 1 - lowestContentSimilarity,
    explanation: [
      `mesmo tópico (key="${candidate.key}") com baixa similaridade de conteúdo (${lowestContentSimilarity.toFixed(2)}) — possível conflito`,
    ],
  };
}

/**
 * v1 (lexical-only) implementation of `SignalCalculator`. See individual
 * private methods for what each signal does and does not account for yet.
 */
export class DefaultSignalCalculator implements SignalCalculator {
  calculate(candidate: MemoryObject, existingMemories: MemoryObject[]): MemorySignals {
    const candidateTokens = tokenize(contentText(candidate.content));
    const referenceTime = candidate.createdAt ?? new Date().toISOString();

    const similarities: SimilarityEntry[] = existingMemories.map((memory) => ({
      memory,
      similarity: lexicalSimilarity(candidateTokens, tokenize(contentText(memory.content))),
    }));

    const maxSimilarity = similarities.reduce((max, entry) => Math.max(max, entry.similarity), 0);

    // V1 intencionalmente só léxico. NÃO aumentar complexidade
    // heurística aqui (regex, stemming, sinônimos). SemanticSimilarity,
    // GoalAlignment e MemoryTypeWeight pertencem a versões futuras,
    // depois que embeddings existirem.
    const relevance = maxSimilarity;

    const novelty = 1 - maxSimilarity;

    const recurrenceRaw = similarities
      .filter((entry) => entry.similarity >= RECURRENCE_SIMILARITY_THRESHOLD)
      .reduce((sum, entry) => {
        const ageDays = entry.memory.createdAt ? daysBetween(referenceTime, entry.memory.createdAt) : 0;
        return sum + entry.similarity * Math.exp(-RECURRENCE_DECAY_LAMBDA * ageDays);
      }, 0);
    const recurrence = Math.min(1, recurrenceRaw);
    const recurrenceCount = similarities.filter((entry) => entry.similarity >= RECURRENCE_SIMILARITY_THRESHOLD).length;

    const { entropy, explanation: entropyExplanation } = computeEntropy(candidate, similarities);

    // impact — v1 has no better source, so novelty is used as a temporary
    // proxy. Real Utility Gain needs a better signal (e.g. detecting
    // decision/architecture-changing keywords) — not implemented yet, only
    // documented as a known limitation.
    const impact = novelty;

    return {
      relevance,
      novelty,
      recurrence,
      entropy,
      impact,
      outcome: 0,
      explanation: {
        relevance: [
          `LexicalSimilarity máxima contra ${existingMemories.length} memória(s) existente(s) = ${relevance.toFixed(2)}`,
          "SemanticSimilarity, GoalAlignment, Recency e MemoryTypeWeight aguardam embeddings reais (peso 0)",
        ],
        novelty: [`1 − similaridade léxica máxima (${maxSimilarity.toFixed(2)})`],
        recurrence: [
          `${recurrenceCount} ocorrência(s) semanticamente semelhante(s) (limiar ${RECURRENCE_SIMILARITY_THRESHOLD})`,
          `decaimento exp(-λt), λ=${RECURRENCE_DECAY_LAMBDA}`,
        ],
        entropy: entropyExplanation,
        impact: [
          "proxy provisório = novelty",
          "Utility Gain real precisa de fonte melhor (ex.: detecção de palavras-chave de mudança de decisão/arquitetura), não implementada ainda",
        ],
        outcome: ["OutcomeProvider não implementado"],
      },
    };
  }
}

/**
 * Future direction, not implemented here: an "Evidence Engine" that
 * normalizes evidence from multiple sources before it reaches the Signal
 * Engine. Out of scope for this round — `SignalCalculator`'s signature is
 * deliberately not expanded to anticipate it.
 */

const defaultSignalCalculator = new DefaultSignalCalculator();

/** Convenience wrapper around `DefaultSignalCalculator` for simple call sites. */
export function computeMemorySignals(candidate: MemoryObject, existingMemories: MemoryObject[]): MemorySignals {
  return defaultSignalCalculator.calculate(candidate, existingMemories);
}
