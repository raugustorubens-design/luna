import assert from "node:assert/strict";
import test from "node:test";
import { createLocalGuardianAdapter } from "../guardian-local-adapter";

function fakeSupabaseClient(overrides: { insertResult?: unknown; selectResult?: unknown; deleteResult?: unknown } = {}) {
  const calls: unknown[] = [];
  const terminal = (result: unknown) => ({
    order: (_col: string, _opts: unknown) => Promise.resolve(result),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  });

  return {
    calls,
    from(table: string) {
      calls.push(["from", table]);
      return {
        insert(rows: unknown[]) {
          calls.push(["insert", rows]);
          return { select: () => Promise.resolve(overrides.insertResult ?? { data: (rows as Record<string, unknown>[]).map((r) => ({ id: "1", ...r })), error: null }) };
        },
        delete() {
          return { eq: (_c: string, _v: unknown) => Promise.resolve(overrides.deleteResult ?? { error: null }) };
        },
        select(_columns: string) {
          const builder = {
            eq: (col: string, value: unknown) => {
              calls.push(["eq", col, value]);
              return builder;
            },
            limit: (n: number) => {
              calls.push(["limit", n]);
              return terminal(overrides.selectResult ?? { data: [], error: null });
            },
          };
          return builder;
        },
      };
    },
  };
}

test("local guardian adapter save inserts into the given collection", async () => {
  const client = fakeSupabaseClient();
  const adapter = createLocalGuardianAdapter(client as never);

  const record = await adapter.save({ collection: "memoria_luna", data: { titulo: "t" } }, "test");

  assert.equal(record?.id, "1");
  assert.deepEqual(client.calls[0], ["from", "memoria_luna"]);
});

test("local guardian adapter search applies filter, limit, and order", async () => {
  const client = fakeSupabaseClient({ selectResult: { data: [{ id: "1", tipo: "checkpoint" }], error: null } });
  const adapter = createLocalGuardianAdapter(client as never);

  const records = await adapter.search({ collection: "memoria_luna", filter: { tipo: "checkpoint" }, limit: 5, orderBy: "criado_em", ascending: false }, "test");

  assert.equal(records.length, 1);
  assert.deepEqual(
    client.calls.filter((c) => Array.isArray(c) && c[0] === "eq"),
    [["eq", "tipo", "checkpoint"]],
  );
});

test("local guardian adapter throws a StorageError (not a silent swallow) when the driver errors", async () => {
  const client = fakeSupabaseClient({ insertResult: { data: null, error: { message: "insert failed" } } });
  const adapter = createLocalGuardianAdapter(client as never);

  await assert.rejects(() => adapter.save({ collection: "memoria_luna", data: {} }, "test"), /insert failed/);
});
