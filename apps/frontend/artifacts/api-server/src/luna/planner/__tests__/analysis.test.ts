import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityManifest } from "../../../gateway";
import type { ReconstructedCognitiveState } from "../../hippocampus";
import { analyze } from "../analysis";

function manifest(overrides: Partial<CapabilityManifest>): CapabilityManifest {
  return {
    id: "filesystem.read",
    version: 1,
    owner: "gateway",
    status: "healthy",
    requiresApproval: false,
    supportsDryRun: true,
    supportsRollback: false,
    description: "Read file from local filesystem.",
    ...overrides,
  };
}

const emptyState: ReconstructedCognitiveState = {
  objective: "",
  concepts: [],
  relations: [],
  checkpoint: null,
  cognitiveIndexRefs: [],
  checkpointRefs: [],
  reconstructionRefs: [],
  reconstructedAt: new Date().toISOString(),
};

test("analyze falls back to a single analysis-only step when nothing matches", () => {
  const steps = analyze("reflect on identity", emptyState, [manifest({})]);
  assert.equal(steps.length, 1);
  assert.equal(steps[0]?.capability, undefined);
});

test("analyze matches capabilities whose id or description overlaps the objective's tokens", () => {
  const steps = analyze("read the filesystem notes", emptyState, [manifest({ id: "filesystem.read", description: "Read file from local filesystem." })]);
  assert.equal(steps.length, 1);
  assert.equal(steps[0]?.capability, "filesystem.read");
});

test("analyze also matches using reconstructed concept keys, not just the raw objective text", () => {
  const state: ReconstructedCognitiveState = {
    ...emptyState,
    concepts: [
      { id: "1", key: "filesystem", memoryType: "semantic", content: {}, version: 1, state: "ACTIVE", previousVersionId: null, createdAt: "t", supersededAt: null },
    ],
  };
  const steps = analyze("do the usual thing", state, [manifest({ id: "filesystem.read", description: "Read file from local filesystem." })]);
  assert.equal(steps[0]?.capability, "filesystem.read");
});

test("analyze chains dependencies sequentially across multiple matched capabilities", () => {
  const steps = analyze("read and write file", emptyState, [
    manifest({ id: "filesystem.read", description: "Read file." }),
    manifest({ id: "filesystem.write", description: "Write file." }),
  ]);
  assert.equal(steps.length, 2);
  assert.deepEqual(steps[0]?.dependsOn, []);
  assert.deepEqual(steps[1]?.dependsOn, [steps[0]?.id]);
});
