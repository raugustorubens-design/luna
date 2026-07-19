import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityManifest } from "../../../gateway";
import { assessImpact } from "../impact";
import type { PlanStep } from "../contracts";

function manifest(overrides: Partial<CapabilityManifest>): CapabilityManifest {
  return {
    id: "github.write_file",
    version: 1,
    owner: "gateway",
    status: "healthy",
    requiresApproval: false,
    supportsDryRun: true,
    supportsRollback: true,
    description: "",
    ...overrides,
  };
}

function step(overrides: Partial<PlanStep>): PlanStep {
  return { id: "step-1", description: "", dependsOn: [], ...overrides };
}

test("impact is low and reversible when no step references a capability", () => {
  const impact = assessImpact([step({ capability: undefined })], []);
  assert.equal(impact.level, "low");
  assert.equal(impact.reversible, true);
});

test("impact is medium and reversible when every referenced capability supports rollback", () => {
  const impact = assessImpact([step({ capability: "github.write_file" })], [manifest({ supportsRollback: true })]);
  assert.equal(impact.level, "medium");
  assert.equal(impact.reversible, true);
});

test("impact is high and irreversible when any referenced capability lacks rollback support", () => {
  const impact = assessImpact(
    [step({ capability: "github.write_file" }), step({ id: "step-2", capability: "github.commit" })],
    [manifest({ id: "github.write_file", supportsRollback: true }), manifest({ id: "github.commit", supportsRollback: false })],
  );
  assert.equal(impact.level, "high");
  assert.equal(impact.reversible, false);
  assert.match(impact.rationale, /github.commit/);
});
