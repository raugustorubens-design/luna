import assert from "node:assert/strict";
import test from "node:test";
import { decideAndConsolidate, decideAndConsolidateV2, DEFAULT_CONSOLIDATION_THRESHOLDS } from "../hipocampo";
import type { LunaMemoryRecord } from "../contracts";
import type { MemorySignals } from "../memory-signals";

function stubSignals(overrides: Partial<MemorySignals> = {}): MemorySignals {
  return {
    relevance: 0,
    novelty: 1,
    recurrence: 0,
    entropy: 0,
    impact: 1,
    outcome: 0,
    explanation: { outcome: "OutcomeProvider não implementado" },
    ...overrides,
  };
}

test("hipocampo discards a candidate with empty content", async () => {
  const persisted: unknown[] = [];
  const decision = await decideAndConsolidate(
    {
      tipo: "interaction",
      contexto: "jarvis_mode",
      titulo: "Chat interaction",
      empresa_id: 1,
      conteudo: { user_message: "", assistant_response: "" },
    },
    [],
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "discard");
  assert.equal(decision.reason, "empty_or_incomplete_content");
  assert.equal(persisted.length, 0);
});

test("hipocampo discards an immediate duplicate of the most recent memory", async () => {
  const persisted: unknown[] = [];
  const recentMemories: LunaMemoryRecord[] = [
    {
      conteudo: { user_message: "oi", assistant_response: "olá" },
    },
  ];

  const decision = await decideAndConsolidate(
    {
      tipo: "interaction",
      contexto: "jarvis_mode",
      titulo: "Chat interaction",
      empresa_id: 1,
      conteudo: { user_message: "oi", assistant_response: "olá" },
    },
    recentMemories,
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "discard");
  assert.equal(decision.reason, "immediate_duplicate");
  assert.equal(persisted.length, 0);
});

test("hipocampo consolidates a meaningful new interaction through the Memory Engine", async () => {
  const persisted: unknown[] = [];
  const decision = await decideAndConsolidate(
    {
      tipo: "interaction",
      contexto: "jarvis_mode",
      titulo: "Chat interaction",
      empresa_id: 1,
      conteudo: { user_message: "qual a capital do brasil?", assistant_response: "Brasília" },
    },
    [],
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "consolidate");
  assert.equal(decision.reason, "meaningful_new_interaction");
  assert.equal(persisted.length, 1);
});

const candidate = {
  tipo: "interaction",
  contexto: "jarvis_mode",
  titulo: "Chat interaction",
  empresa_id: 1,
  conteudo: { user_message: "oi", assistant_response: "olá" },
};

test("decideAndConsolidateV2 consolidates as high_impact when impact meets the consolidate threshold", async () => {
  const persisted: unknown[] = [];

  const decision = await decideAndConsolidateV2(
    candidate,
    [],
    stubSignals({ impact: 0.9 }),
    DEFAULT_CONSOLIDATION_THRESHOLDS,
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "consolidate");
  assert.equal(decision.reason, "high_impact");
  assert.equal(persisted.length, 1);
});

test("decideAndConsolidateV2 consolidates as moderate_impact_review_recommended between review and consolidate thresholds", async () => {
  const persisted: unknown[] = [];

  const decision = await decideAndConsolidateV2(
    candidate,
    [],
    stubSignals({ impact: 0.7 }),
    DEFAULT_CONSOLIDATION_THRESHOLDS,
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "consolidate");
  assert.equal(decision.reason, "moderate_impact_review_recommended");
  assert.equal(persisted.length, 1);
});

test("decideAndConsolidateV2 discards when impact is below the discard threshold", async () => {
  const persisted: unknown[] = [];

  const decision = await decideAndConsolidateV2(
    candidate,
    [],
    stubSignals({ impact: 0.1 }),
    DEFAULT_CONSOLIDATION_THRESHOLDS,
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "discard");
  assert.equal(decision.reason, "impact_below_threshold(0.3)");
  assert.equal(persisted.length, 0);
});

test("decideAndConsolidateV2 honors custom thresholds instead of the hardcoded defaults", async () => {
  const persisted: unknown[] = [];

  const decision = await decideAndConsolidateV2(
    candidate,
    [],
    stubSignals({ impact: 0.4 }),
    { consolidateThreshold: 0.95, reviewThreshold: 0.6, discardThreshold: 0.45 },
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "discard");
  assert.equal(decision.reason, "impact_below_threshold(0.45)");
  assert.equal(persisted.length, 0);
});

test("decideAndConsolidateV2 still discards empty content before looking at signals", async () => {
  const persisted: unknown[] = [];

  const decision = await decideAndConsolidateV2(
    { ...candidate, conteudo: { user_message: "", assistant_response: "" } },
    [],
    stubSignals({ impact: 1 }),
    DEFAULT_CONSOLIDATION_THRESHOLDS,
    async (input) => {
      persisted.push(input);
    },
  );

  assert.equal(decision.action, "discard");
  assert.equal(decision.reason, "empty_or_incomplete_content");
  assert.equal(persisted.length, 0);
});
