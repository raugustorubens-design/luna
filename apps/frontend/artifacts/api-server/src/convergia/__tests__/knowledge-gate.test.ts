import assert from "node:assert/strict";
import test from "node:test";
import { submitAsKnowledge } from "../knowledge/knowledge-gate";
import type { CanonicalDocument } from "../contracts";

function stubDocument(): CanonicalDocument {
  return {
    title: "Treinamento X",
    columns: ["item"],
    records: [{ fields: [{ name: "item", value: "conceito A" }] }],
    metadata: { sourceFormat: "json", sourceName: "x", parsedAt: new Date().toISOString(), recordCount: 1 },
  };
}

test("submitAsKnowledge consolidates through Hipocampo (never persists directly)", async () => {
  const persisted: unknown[] = [];

  const decision = await submitAsKnowledge(
    { document: stubDocument(), knowledgeType: "semantica", summary: "resumo" },
    {
      retrieveMemory: async () => [],
      persist: async (input) => {
        persisted.push(input);
      },
    },
  );

  assert.equal(decision.action, "consolidate");
  assert.equal(persisted.length, 1);
  assert.equal((persisted[0] as { tipo: string }).tipo, "convergia_semantica");
});

test("submitAsKnowledge carries records and extra data into conteudo", async () => {
  const persisted: unknown[] = [];

  await submitAsKnowledge(
    { document: stubDocument(), knowledgeType: "procedimental", summary: "resumo", extra: { relations: [{ a: 1 }] } },
    { retrieveMemory: async () => [], persist: async (input) => void persisted.push(input) },
  );

  const conteudo = (persisted[0] as { conteudo: Record<string, unknown> }).conteudo;
  assert.deepEqual(conteudo.records, [{ item: "conceito A" }]);
  assert.deepEqual(conteudo.relations, [{ a: 1 }]);
});

test("submitAsKnowledge discards through Hipocampo when the candidate is an immediate duplicate", async () => {
  const persisted: unknown[] = [];
  const document = stubDocument();

  const decision = await submitAsKnowledge(
    { document, knowledgeType: "semantica", summary: "resumo" },
    {
      retrieveMemory: async () => [
        {
          conteudo: {
            summary: "resumo",
            sourceFormat: "json",
            recordCount: 1,
            columns: ["item"],
            records: [{ item: "conceito A" }],
          },
        },
      ],
      persist: async (input) => void persisted.push(input),
    },
  );

  assert.equal(decision.action, "discard");
  assert.equal(persisted.length, 0);
});
