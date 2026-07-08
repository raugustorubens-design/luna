// src/luna/hippocampus/cognitive-filter.ts
//
// K(t) = f(L, C, I, T)
//
// L = Estado Latente   (the candidate itself)
// C = Contexto          (where it came from)
// I = Indice Cognitivo  (what is already known)
// T = Temporalidade     (whether this is new knowledge or an evolution of it)
//
// This is deterministic infrastructure, not intelligence: it routes
// candidates to one of six outcomes using explicit, declared signals. It
// makes no judgement calls about meaning - that is left for future
// cognition to be built on top of this seam.

import type { CognitiveFilterDecision, CognitiveFilterInput } from "./contracts";

const DISCARD_SALIENCE_THRESHOLD = 0.2;

export function applyCognitiveFilter(input: CognitiveFilterInput): CognitiveFilterDecision {
  const evaluatedAt = new Date().toISOString();
  const { latentState, index, temporality } = input;

  const discard = (reason: string): CognitiveFilterDecision => ({ action: "discard", reason, evaluatedAt });

  if (latentState.salience !== undefined && latentState.salience < DISCARD_SALIENCE_THRESHOLD) {
    return discard(`salience ${latentState.salience} below persistence threshold ${DISCARD_SALIENCE_THRESHOLD}`);
  }

  if (latentState.kind === "reconstruction_request") {
    return { action: "reconstruct_memory", reason: "candidate requests cognitive state reconstruction", evaluatedAt };
  }

  if (latentState.kind === "checkpoint") {
    return { action: "update_checkpoint", reason: "candidate is a checkpoint signal", evaluatedAt };
  }

  if (latentState.kind === "relation") {
    const relatesTo = latentState.relatesTo;
    if (!relatesTo) return discard("relation candidate is missing relatesTo");
    if (!index.hasKey(relatesTo.fromKey) || !index.hasKey(relatesTo.toKey)) {
      return discard("relation references at least one concept absent from the cognitive index");
    }
    return { action: "update_relations", reason: "both concepts of the relation are known", evaluatedAt, targetKey: relatesTo.toKey };
  }

  if (latentState.kind === "episodic") {
    return { action: "create_concept", reason: "episodic entries are appended chronologically", evaluatedAt };
  }

  // semantic | procedural
  if (!latentState.key) {
    return discard("the cognitive index is semantic: a concept requires a key");
  }

  const existing = index.getEntry(latentState.key);
  const evolvesExisting = temporality.evolutionOf === latentState.key;

  if (existing || evolvesExisting) {
    return { action: "update_concept", reason: "concept already present in the cognitive index", evaluatedAt, targetKey: latentState.key };
  }

  return { action: "create_concept", reason: "concept is new to the cognitive index", evaluatedAt, targetKey: latentState.key };
}
