// src/luna/hippocampus/temporality.ts
//
// Temporality represents the evolution of knowledge, never its deletion.
// A concept moves v1 -> v2 -> v3 -> ACTIVE, and every prior version is
// retained with a SUPERSEDED (or DEPRECATED) state and a link to what
// replaced it.

import type { CognitiveConcept, ConceptMemoryType } from "./contracts";

export function createInitialConcept(params: {
  id: string;
  key: string;
  memoryType: ConceptMemoryType;
  content: unknown;
  createdAt?: string;
}): CognitiveConcept {
  return {
    id: params.id,
    key: params.key,
    memoryType: params.memoryType,
    content: params.content,
    version: 1,
    state: "ACTIVE",
    previousVersionId: null,
    createdAt: params.createdAt ?? new Date().toISOString(),
    supersededAt: null,
  };
}

/**
 * Evolves a concept by producing its next version. The previous version is
 * returned alongside, marked SUPERSEDED - it is never mutated in place and
 * never removed from the store.
 */
export function evolveConcept(
  previous: CognitiveConcept,
  params: { id: string; content: unknown; evolvedAt?: string },
): { next: CognitiveConcept; superseded: CognitiveConcept } {
  const evolvedAt = params.evolvedAt ?? new Date().toISOString();

  const next: CognitiveConcept = {
    id: params.id,
    key: previous.key,
    memoryType: previous.memoryType,
    content: params.content,
    version: previous.version + 1,
    state: "ACTIVE",
    previousVersionId: previous.id,
    createdAt: evolvedAt,
    supersededAt: null,
  };

  const superseded: CognitiveConcept = {
    ...previous,
    state: "SUPERSEDED",
    supersededAt: evolvedAt,
  };

  return { next, superseded };
}

export function deprecateConcept(concept: CognitiveConcept, deprecatedAt?: string): CognitiveConcept {
  return {
    ...concept,
    state: "DEPRECATED",
    supersededAt: deprecatedAt ?? new Date().toISOString(),
  };
}

export function isCurrent(concept: CognitiveConcept): boolean {
  return concept.state === "ACTIVE";
}
