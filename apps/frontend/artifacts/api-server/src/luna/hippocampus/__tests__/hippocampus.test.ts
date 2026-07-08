import assert from "node:assert/strict";
import test from "node:test";
import { Hippocampus } from "../index";
import type { CognitiveCheckpoint, CognitiveConcept, ConceptRelation, EpisodicMemoryRecord, HippocampusStore } from "../index";

class StubHippocampusStore implements HippocampusStore {
  episodic: EpisodicMemoryRecord[] = [];
  concepts: CognitiveConcept[] = [];
  relations: ConceptRelation[] = [];
  checkpoints: CognitiveCheckpoint[] = [];

  async appendEpisodic(record: EpisodicMemoryRecord): Promise<void> {
    this.episodic.push(record);
  }

  async recentEpisodic(limit = 10): Promise<EpisodicMemoryRecord[]> {
    return this.episodic.slice(0, limit);
  }

  async loadConcepts(): Promise<CognitiveConcept[]> {
    return this.concepts;
  }

  async saveConcept(concept: CognitiveConcept): Promise<void> {
    const index = this.concepts.findIndex((existing) => existing.id === concept.id);
    if (index >= 0) this.concepts[index] = concept;
    else this.concepts.push(concept);
  }

  async loadRelations(): Promise<ConceptRelation[]> {
    return this.relations;
  }

  async saveRelation(relation: ConceptRelation): Promise<void> {
    this.relations.push(relation);
  }

  async loadCheckpoints(): Promise<CognitiveCheckpoint[]> {
    return [...this.checkpoints].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async saveCheckpoint(checkpoint: CognitiveCheckpoint): Promise<void> {
    this.checkpoints.push(checkpoint);
  }
}

test("remember() discards low-salience candidates without persisting anything", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  const result = await hippocampus.remember({
    latentState: { kind: "semantic", key: "noise", content: {}, salience: 0.05 },
    context: { source: "test" },
  });

  assert.equal(result.decision.action, "discard");
  assert.equal(store.concepts.length, 0);
});

test("remember() creates a new concept for an unseen semantic key", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  const result = await hippocampus.remember({
    latentState: { kind: "semantic", key: "gateway", content: { description: "v1" } },
    context: { source: "test" },
  });

  assert.equal(result.decision.action, "create_concept");
  assert.equal(store.concepts.length, 1);
  assert.equal(store.concepts[0]?.version, 1);
  assert.equal(store.concepts[0]?.state, "ACTIVE");
});

test("remember() evolves an existing concept without deleting its previous version", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  await hippocampus.remember({
    latentState: { kind: "semantic", key: "gateway", content: { description: "v1" } },
    context: { source: "test" },
  });

  const result = await hippocampus.remember({
    latentState: { kind: "semantic", key: "gateway", content: { description: "v2" } },
    context: { source: "test" },
  });

  assert.equal(result.decision.action, "update_concept");
  assert.equal(store.concepts.length, 2);

  const superseded = store.concepts.find((concept) => concept.version === 1)!;
  const current = store.concepts.find((concept) => concept.version === 2)!;

  assert.equal(superseded.state, "SUPERSEDED");
  assert.ok(superseded.supersededAt);
  assert.equal(current.state, "ACTIVE");
  assert.equal(current.previousVersionId, superseded.id);
});

test("remember() appends episodic candidates to episodic memory", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  await hippocampus.remember({
    latentState: { kind: "episodic", content: { userMessage: "hello" } },
    context: { source: "chat" },
  });

  assert.equal(store.episodic.length, 1);
  assert.equal(store.episodic[0]?.tipo, "episodic");
});

test("remember() only accepts relations between concepts already known to the index", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  await hippocampus.remember({ latentState: { kind: "semantic", key: "gateway", content: {} }, context: { source: "test" } });

  const rejected = await hippocampus.remember({
    latentState: { kind: "relation", content: {}, relatesTo: { fromKey: "gateway", toKey: "hippocampus", relationType: "depends_on" } },
    context: { source: "test" },
  });
  assert.equal(rejected.decision.action, "discard");
  assert.equal(store.relations.length, 0);

  await hippocampus.remember({ latentState: { kind: "semantic", key: "hippocampus", content: {} }, context: { source: "test" } });

  const accepted = await hippocampus.remember({
    latentState: { kind: "relation", content: {}, relatesTo: { fromKey: "gateway", toKey: "hippocampus", relationType: "depends_on" } },
    context: { source: "test" },
  });
  assert.equal(accepted.decision.action, "update_relations");
  assert.equal(store.relations.length, 1);
});

test("remember() creates a checkpoint that references the current cognitive index", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  await hippocampus.remember({ latentState: { kind: "semantic", key: "gateway", content: {} }, context: { source: "test" } });
  const result = await hippocampus.remember({ latentState: { kind: "checkpoint", content: {} }, context: { source: "test", metadata: { reason: "session end" } } });

  assert.equal(result.decision.action, "update_checkpoint");
  assert.equal(store.checkpoints.length, 1);
  assert.deepEqual(store.checkpoints[0]?.conceptRefs, ["gateway"]);
});

test("reconstruct() assembles concepts and relations matching the objective, including one hop of neighbors", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  await hippocampus.remember({ latentState: { kind: "semantic", key: "gateway", content: { note: "sovereign api organ" } }, context: { source: "test" } });
  await hippocampus.remember({ latentState: { kind: "semantic", key: "hippocampus", content: { note: "memory guardian" } }, context: { source: "test" } });
  await hippocampus.remember({
    latentState: { kind: "relation", content: {}, relatesTo: { fromKey: "gateway", toKey: "hippocampus", relationType: "cooperates_with" } },
    context: { source: "test" },
  });

  const state = await hippocampus.reconstruct({ objective: "explain the gateway" });

  assert.ok(state.concepts.some((concept) => concept.key === "gateway"));
  assert.ok(state.concepts.some((concept) => concept.key === "hippocampus"));
  assert.equal(state.relations.length, 1);
  assert.ok(state.cognitiveIndexRefs.includes("gateway"));
  assert.ok(state.reconstructionRefs.length > 0);
});

test("remember() with a reconstruction_request candidate returns a reconstructed state", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  await hippocampus.remember({ latentState: { kind: "semantic", key: "planner", content: {} }, context: { source: "test" } });

  const result = await hippocampus.remember({
    latentState: { kind: "reconstruction_request", content: "planner" },
    context: { source: "test" },
  });

  assert.equal(result.decision.action, "reconstruct_memory");
  assert.ok(result.reconstruction);
  assert.ok(result.reconstruction!.concepts.some((concept) => concept.key === "planner"));
});

test("ingestAuditEvent() lets the Hippocampus consume Reporter events as episodic memory", async () => {
  const store = new StubHippocampusStore();
  const hippocampus = new Hippocampus(store);

  await hippocampus.ingestAuditEvent({ type: "capability.executed", occurredAt: new Date().toISOString(), metadata: { duration: 12 } });

  assert.equal(store.episodic.length, 1);
  assert.equal(store.episodic[0]?.tipo, "episodic");
});
