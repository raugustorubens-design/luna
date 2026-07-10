import assert from "node:assert/strict";
import test from "node:test";
import { createMemoryEngine } from "../memory-engine";
import type { GuardianContract, StorageRecord } from "../guardian-contract";

function stubGuardian(overrides?: {
  saveError?: unknown;
  searchResult?: StorageRecord[];
  searchError?: unknown;
}): { guardian: GuardianContract; saved: Record<string, unknown>[]; searchCalls: Array<Record<string, unknown>> } {
  const saved: Record<string, unknown>[] = [];
  const searchCalls: Array<Record<string, unknown>> = [];

  const guardian: GuardianContract = {
    async save(input) {
      if (overrides?.saveError) throw overrides.saveError;
      saved.push(input.data);
      return { id: "1", ...input.data };
    },
    async update() {
      throw new Error("not used by these tests");
    },
    async delete() {
      throw new Error("not used by these tests");
    },
    async get() {
      throw new Error("not used by these tests");
    },
    async search(input) {
      searchCalls.push({ ...input });
      if (overrides?.searchError) throw overrides.searchError;
      return overrides?.searchResult ?? [];
    },
  };

  return { guardian, saved, searchCalls };
}

test("memory engine persists a memory record through the Guardian contract", async () => {
  const { guardian, saved } = stubGuardian();
  const engine = createMemoryEngine(guardian);

  await engine.persistMemory({
    tipo: "interaction",
    contexto: "jarvis_mode",
    titulo: "t",
    empresa_id: 1,
    conteudo: { user_message: "a", assistant_response: "b" },
  });

  assert.equal(saved.length, 1);
  assert.equal(saved[0]?.tipo, "interaction");
});

test("memory engine retrieves memories through the Guardian contract", async () => {
  const { guardian } = stubGuardian({ searchResult: [{ id: 1, tipo: "interaction" }] });
  const engine = createMemoryEngine(guardian);

  const memories = await engine.retrieveMemory("ignored query");

  assert.equal(memories.length, 1);
  assert.equal(memories[0]?.id, 1);
});

test("memory engine returns an empty array when Guardian search fails", async () => {
  const { guardian } = stubGuardian({ searchError: new Error("boom") });
  const engine = createMemoryEngine(guardian);

  const memories = await engine.retrieveMemory("ignored query");

  assert.deepEqual(memories, []);
});

test("memory engine checkpoint persists a tipo=checkpoint record", async () => {
  const { guardian, saved } = stubGuardian();
  const engine = createMemoryEngine(guardian);

  await engine.checkpoint({ note: "consolidation pass" });

  assert.equal(saved.length, 1);
  assert.equal(saved[0]?.tipo, "checkpoint");
});

test("memory engine listCheckpoints filters by tipo=checkpoint via the Guardian contract", async () => {
  const { guardian, searchCalls } = stubGuardian({ searchResult: [{ id: 1, tipo: "checkpoint", titulo: "cp" }] });
  const engine = createMemoryEngine(guardian);

  const checkpoints = await engine.listCheckpoints(5);

  assert.equal(checkpoints.length, 1);
  assert.equal(checkpoints[0]?.titulo, "cp");
  assert.deepEqual(searchCalls[0]?.filter, { tipo: "checkpoint" });
  assert.equal(searchCalls[0]?.limit, 5);
});

test("memory engine listCheckpoints returns an empty array when Guardian search fails", async () => {
  const { guardian } = stubGuardian({ searchError: new Error("Host not in allowlist") });
  const engine = createMemoryEngine(guardian);

  const checkpoints = await engine.listCheckpoints();

  assert.deepEqual(checkpoints, []);
});

test("memory engine persistMemory never throws even when Guardian.save fails", async () => {
  const { guardian } = stubGuardian({ saveError: new Error("connection refused") });
  const engine = createMemoryEngine(guardian);

  await assert.doesNotReject(() => engine.persistMemory({ tipo: "x", contexto: "x", titulo: "x", empresa_id: 1, conteudo: {} }));
});
