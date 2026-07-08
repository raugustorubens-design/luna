import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityManifest } from "../../../gateway";
import { resolveCapabilities } from "../capabilities";
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

test("resolveCapabilities returns deduplicated ids for steps with a known, healthy capability", () => {
  const { capabilityIds, risks } = resolveCapabilities(
    [step({ capability: "github.write_file" }), step({ id: "step-2", capability: "github.write_file" })],
    [manifest({})],
  );
  assert.deepEqual(capabilityIds, ["github.write_file"]);
  assert.deepEqual(risks, []);
});

test("resolveCapabilities flags a high-severity risk for an unregistered capability", () => {
  const { capabilityIds, risks } = resolveCapabilities([step({ capability: "unknown.capability" })], []);
  assert.deepEqual(capabilityIds, []);
  assert.equal(risks.length, 1);
  assert.equal(risks[0]?.severity, "high");
});

test("resolveCapabilities flags a high-severity risk for a disabled capability and medium for degraded", () => {
  const disabled = resolveCapabilities([step({ capability: "a" })], [manifest({ id: "a", status: "disabled" })]);
  assert.equal(disabled.risks[0]?.severity, "high");

  const degraded = resolveCapabilities([step({ capability: "b" })], [manifest({ id: "b", status: "degraded" })]);
  assert.equal(degraded.risks[0]?.severity, "medium");
});

test("resolveCapabilities ignores steps without a capability reference", () => {
  const { capabilityIds, risks } = resolveCapabilities([step({ capability: undefined })], []);
  assert.deepEqual(capabilityIds, []);
  assert.deepEqual(risks, []);
});
