import assert from "node:assert/strict";
import test from "node:test";
import { CognitiveMap } from "../cognitive-map";
import type { ConceptRelation } from "../contracts";

function relation(fromKey: string, toKey: string, relationType = "relates_to"): ConceptRelation {
  return { id: `${fromKey}->${toKey}`, fromKey, toKey, relationType, createdAt: new Date().toISOString() };
}

test("neighborsOf returns direct neighbors at depth 1", () => {
  const map = CognitiveMap.fromRelations([relation("gateway", "hippocampus"), relation("gateway", "planner")]);
  assert.deepEqual(map.neighborsOf("gateway", 1), ["hippocampus", "planner"]);
});

test("neighborsOf expands across hops up to the given depth", () => {
  const map = CognitiveMap.fromRelations([relation("gateway", "hippocampus"), relation("hippocampus", "planner")]);
  assert.deepEqual(map.neighborsOf("gateway", 1), ["hippocampus"]);
  assert.deepEqual(map.neighborsOf("gateway", 2), ["hippocampus", "planner"]);
});

test("neighborsOf never includes the origin key itself", () => {
  const map = CognitiveMap.fromRelations([relation("gateway", "hippocampus"), relation("hippocampus", "gateway")]);
  assert.deepEqual(map.neighborsOf("gateway", 2), ["hippocampus"]);
});

test("relationsOf returns relations where the key is either endpoint", () => {
  const map = CognitiveMap.fromRelations([relation("gateway", "hippocampus"), relation("planner", "gateway")]);
  assert.equal(map.relationsOf("gateway").length, 2);
});
