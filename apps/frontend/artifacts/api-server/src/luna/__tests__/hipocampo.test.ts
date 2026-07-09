import assert from "node:assert/strict";
import test from "node:test";
import { decideAndConsolidate } from "../hipocampo";
import type { LunaMemoryRecord } from "../contracts";

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
