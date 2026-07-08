import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { RepositoryContextSync } from "../context/context-sync";

test("RepositoryContextSync appends checkpoints referencing the four memory domains", async () => {
  const dir = await mkdtemp(join(tmpdir(), "luna-context-sync-"));
  const checkpointsFile = join(dir, "context_sync_checkpoints.json");

  try {
    const contextSync = new RepositoryContextSync(checkpointsFile);

    await contextSync.syncCheckpoint({
      id: "checkpoint-1",
      createdAt: new Date().toISOString(),
      cognitiveIndexRef: "luna_core",
      metadata: {
        checkpointRefs: ["luna_checkpoint.json"],
        runtimeMemoryRef: ".luna/runtime/runtime_state.json",
        architecturalMemoryRefs: ["luna_context/ARCHITECTURE.md"],
      },
    });

    await contextSync.syncCheckpoint({
      id: "checkpoint-2",
      createdAt: new Date().toISOString(),
      cognitiveIndexRef: "luna_core",
    });

    const persisted = JSON.parse(await readFile(checkpointsFile, "utf8"));
    assert.equal(persisted.length, 2);
    assert.equal(persisted[0].id, "checkpoint-1");
    assert.equal(persisted[1].id, "checkpoint-2");
    assert.deepEqual(persisted[0].metadata.checkpointRefs, ["luna_checkpoint.json"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
