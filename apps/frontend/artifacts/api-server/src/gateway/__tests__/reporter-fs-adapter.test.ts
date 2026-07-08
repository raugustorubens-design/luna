import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { ReporterFsAdapter } from "../adapters/reporter-adapter";
import { RepositoryContextSync } from "../context/context-sync";
import { CapabilityRegistry } from "../registry/capability-registry";

test("ReporterFsAdapter observes the real repository without mutating it", async () => {
  const registry = new CapabilityRegistry();
  const checkpointsDir = await mkdtemp(join(tmpdir(), "luna-context-sync-"));
  const checkpointsFile = join(checkpointsDir, "context_sync_checkpoints.json");

  try {
    const contextSync = new RepositoryContextSync(checkpointsFile);
    const adapter = new ReporterFsAdapter(registry, contextSync);

    const repositoryMap = await adapter.repositoryMap({});
    assert.ok(repositoryMap.repositoryMap, "repository_map.json should be readable from the real repo");

    const audit = await adapter.auditRepository({});
    assert.ok(audit.applications.length > 0);
    assert.notEqual(audit.gitBranch, "");

    const snapshot = await adapter.snapshot({});
    assert.equal(snapshot.cognitiveIndexRef, "luna_core");

    const persisted = JSON.parse(await readFile(checkpointsFile, "utf8"));
    assert.equal(persisted.length, 1);
    assert.equal(persisted[0].id, snapshot.checkpointId);

    const inventory = await adapter.capabilityInventory({});
    assert.equal(inventory.capabilityCount, registry.discover().length);
  } finally {
    await rm(checkpointsDir, { recursive: true, force: true });
  }
});
