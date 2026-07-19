// src/luna/hippocampus/reconstruction.ts
//
// Reconstruction turns (Objetivo, Contexto) into a Estado Cognitivo
// Reconstruido, using the Cognitive Index, the Cognitive Map, temporality
// and the concepts/relations they point to. It never invents knowledge -
// it only assembles what the Hippocampus already holds.

import type {
  CognitiveCheckpoint,
  CognitiveConcept,
  ConceptRelation,
  ReconstructedCognitiveState,
  ReconstructionInput,
} from "./contracts";
import { CognitiveIndex } from "./cognitive-index";
import { CognitiveMap } from "./cognitive-map";
import { isCurrent } from "./temporality";

const RELATION_TRAVERSAL_DEPTH = 1;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/i)
    .filter(Boolean);
}

/** Deterministic key matching: does the objective/context explicitly mention this concept key? */
function matchesObjective(key: string, tokens: string[]): boolean {
  return tokens.includes(key.toLowerCase());
}

export class MemoryReconstructor {
  reconstruct(
    input: ReconstructionInput,
    concepts: CognitiveConcept[],
    relations: ConceptRelation[],
    checkpoints: CognitiveCheckpoint[],
  ): ReconstructedCognitiveState {
    const index = CognitiveIndex.fromConcepts(concepts);
    const map = CognitiveMap.fromRelations(relations);
    const currentConcepts = concepts.filter(isCurrent);

    const contextTokens = input.context ? tokenize(JSON.stringify(input.context)) : [];
    const tokens = [...tokenize(input.objective), ...contextTokens];

    const matchedKeys = new Set(
      currentConcepts.filter((concept) => matchesObjective(concept.key, tokens)).map((concept) => concept.key),
    );

    for (const key of [...matchedKeys]) {
      for (const neighbor of map.neighborsOf(key, RELATION_TRAVERSAL_DEPTH)) {
        matchedKeys.add(neighbor);
      }
    }

    const matchedConcepts = currentConcepts.filter((concept) => matchedKeys.has(concept.key));
    const matchedRelations = relations.filter((relation) => matchedKeys.has(relation.fromKey) && matchedKeys.has(relation.toKey));
    const checkpoint = checkpoints[0] ?? null;

    const reconstructedAt = new Date().toISOString();

    return {
      objective: input.objective,
      concepts: matchedConcepts,
      relations: matchedRelations,
      checkpoint,
      cognitiveIndexRefs: index.keys(),
      checkpointRefs: checkpoint ? [checkpoint.id] : [],
      reconstructionRefs: [`reconstruction:${reconstructedAt}`],
      reconstructedAt,
    };
  }
}
