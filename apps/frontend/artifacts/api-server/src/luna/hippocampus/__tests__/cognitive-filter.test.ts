import assert from "node:assert/strict";
import test from "node:test";
import { applyCognitiveFilter } from "../cognitive-filter";
import { CognitiveIndex } from "../cognitive-index";
import type { CognitiveFilterInput } from "../contracts";

const baseContext = { source: "test" };
const baseTemporality = { observedAt: new Date().toISOString() };

function input(overrides: Partial<CognitiveFilterInput>): CognitiveFilterInput {
  return {
    latentState: { kind: "semantic", key: "gateway", content: {} },
    context: baseContext,
    index: new CognitiveIndex(),
    temporality: baseTemporality,
    ...overrides,
  };
}

test("discards candidates below the salience threshold regardless of kind", () => {
  const decision = applyCognitiveFilter(input({ latentState: { kind: "semantic", key: "gateway", content: {}, salience: 0.1 } }));
  assert.equal(decision.action, "discard");
});

test("routes reconstruction_request candidates to reconstruct_memory", () => {
  const decision = applyCognitiveFilter(input({ latentState: { kind: "reconstruction_request", content: "plan the gateway rollout" } }));
  assert.equal(decision.action, "reconstruct_memory");
});

test("routes checkpoint candidates to update_checkpoint", () => {
  const decision = applyCognitiveFilter(input({ latentState: { kind: "checkpoint", content: {} } }));
  assert.equal(decision.action, "update_checkpoint");
});

test("discards relation candidates when either concept is unknown to the index", () => {
  const decision = applyCognitiveFilter(
    input({ latentState: { kind: "relation", content: {}, relatesTo: { fromKey: "gateway", toKey: "hippocampus", relationType: "depends_on" } } }),
  );
  assert.equal(decision.action, "discard");
});

test("accepts relation candidates when both concepts are known to the index", () => {
  const index = CognitiveIndex.fromConcepts([
    { id: "1", key: "gateway", memoryType: "semantic", content: {}, version: 1, state: "ACTIVE", previousVersionId: null, createdAt: "t", supersededAt: null },
    { id: "2", key: "hippocampus", memoryType: "semantic", content: {}, version: 1, state: "ACTIVE", previousVersionId: null, createdAt: "t", supersededAt: null },
  ]);
  const decision = applyCognitiveFilter(
    input({ index, latentState: { kind: "relation", content: {}, relatesTo: { fromKey: "gateway", toKey: "hippocampus", relationType: "depends_on" } } }),
  );
  assert.equal(decision.action, "update_relations");
});

test("episodic candidates are always appended (create_concept) above the salience threshold", () => {
  const decision = applyCognitiveFilter(input({ latentState: { kind: "episodic", content: { message: "hi" } } }));
  assert.equal(decision.action, "create_concept");
});

test("discards semantic candidates without a key - the index is semantic, never anonymous", () => {
  const decision = applyCognitiveFilter(input({ latentState: { kind: "semantic", content: {} } }));
  assert.equal(decision.action, "discard");
});

test("creates a new concept when the key is not yet in the index", () => {
  const decision = applyCognitiveFilter(input({ latentState: { kind: "semantic", key: "planner", content: {} } }));
  assert.equal(decision.action, "create_concept");
  assert.equal(decision.targetKey, "planner");
});

test("updates an existing concept when the key is already in the index", () => {
  const index = CognitiveIndex.fromConcepts([
    { id: "1", key: "gateway", memoryType: "semantic", content: {}, version: 1, state: "ACTIVE", previousVersionId: null, createdAt: "t", supersededAt: null },
  ]);
  const decision = applyCognitiveFilter(input({ index, latentState: { kind: "semantic", key: "gateway", content: {} } }));
  assert.equal(decision.action, "update_concept");
});

test("updates an existing concept when temporality explicitly declares an evolution", () => {
  const decision = applyCognitiveFilter(
    input({ latentState: { kind: "semantic", key: "new-key", content: {} }, temporality: { ...baseTemporality, evolutionOf: "new-key" } }),
  );
  assert.equal(decision.action, "update_concept");
});
