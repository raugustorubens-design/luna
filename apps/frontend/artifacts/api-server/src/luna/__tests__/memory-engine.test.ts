import assert from "node:assert/strict";
import test from "node:test";
import { createMemoryEngine, type MemoryStoreClient } from "../memory-engine";

function stubClient(overrides?: {
  insertError?: unknown;
  selectData?: unknown[];
  selectError?: unknown;
}): { client: MemoryStoreClient; inserted: Record<string, unknown>[][]; eqCalls: Array<[string, unknown]> } {
  const inserted: Record<string, unknown>[][] = [];
  const eqCalls: Array<[string, unknown]> = [];

  const terminal = () => ({
    limit(_count: number) {
      return {
        order(_column: string, _options: { ascending: boolean }) {
          return Promise.resolve({
            data: overrides?.selectData ?? [],
            error: overrides?.selectError ?? null,
          });
        },
      };
    },
  });

  const client: MemoryStoreClient = {
    from(_table: string) {
      return {
        insert(rows: Record<string, unknown>[]) {
          inserted.push(rows);
          return Promise.resolve({ error: overrides?.insertError ?? null });
        },
        select(_columns: string) {
          return {
            ...terminal(),
            eq(column: string, value: unknown) {
              eqCalls.push([column, value]);
              return terminal();
            },
          };
        },
      };
    },
  };

  return { client, inserted, eqCalls };
}

test("memory engine persists a memory record through the injected client", async () => {
  const { client, inserted } = stubClient();
  const engine = createMemoryEngine(client);

  await engine.persistMemory({
    tipo: "interaction",
    contexto: "jarvis_mode",
    titulo: "t",
    empresa_id: 1,
    conteudo: { user_message: "a", assistant_response: "b" },
  });

  assert.equal(inserted.length, 1);
  assert.equal(inserted[0]?.[0]?.tipo, "interaction");
});

test("memory engine retrieves memories from the injected client", async () => {
  const { client } = stubClient({ selectData: [{ id: 1, tipo: "interaction" }] });
  const engine = createMemoryEngine(client);

  const memories = await engine.retrieveMemory("ignored query");

  assert.equal(memories.length, 1);
  assert.equal(memories[0]?.id, 1);
});

test("memory engine returns an empty array when retrieval errors", async () => {
  const { client } = stubClient({ selectError: new Error("boom") });
  const engine = createMemoryEngine(client);

  const memories = await engine.retrieveMemory("ignored query");

  assert.deepEqual(memories, []);
});

test("memory engine checkpoint persists a tipo=checkpoint record", async () => {
  const { client, inserted } = stubClient();
  const engine = createMemoryEngine(client);

  await engine.checkpoint({ note: "consolidation pass" });

  assert.equal(inserted.length, 1);
  assert.equal(inserted[0]?.[0]?.tipo, "checkpoint");
});

test("memory engine listCheckpoints filters by tipo=checkpoint on the same table", async () => {
  const { client, eqCalls } = stubClient({ selectData: [{ id: 1, tipo: "checkpoint", titulo: "cp" }] });
  const engine = createMemoryEngine(client);

  const checkpoints = await engine.listCheckpoints(5);

  assert.equal(checkpoints.length, 1);
  assert.equal(checkpoints[0]?.titulo, "cp");
  assert.deepEqual(eqCalls, [["tipo", "checkpoint"]]);
});

test("memory engine listCheckpoints returns an empty array when the query errors", async () => {
  const { client } = stubClient({ selectError: new Error("Host not in allowlist") });
  const engine = createMemoryEngine(client);

  const checkpoints = await engine.listCheckpoints();

  assert.deepEqual(checkpoints, []);
});
