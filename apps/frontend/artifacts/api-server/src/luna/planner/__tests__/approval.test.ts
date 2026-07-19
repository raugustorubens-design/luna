import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityManifest } from "../../../gateway";
import { DefaultPlannerApprovalPolicy } from "../approval";
import type { PlanImpact } from "../contracts";

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

const lowImpact: PlanImpact = { level: "low", reversible: true, rationale: "" };
const highImpact: PlanImpact = { level: "high", reversible: false, rationale: "" };

test("does not require approval for low impact plans using non-gated capabilities", () => {
  const policy = new DefaultPlannerApprovalPolicy();
  const result = policy.requiresApproval({ capabilityInventory: [manifest({})], usedCapabilityIds: ["github.write_file"], impact: lowImpact });
  assert.equal(result, false);
});

test("requires approval when a used capability's manifest declares requiresApproval", () => {
  const policy = new DefaultPlannerApprovalPolicy();
  const result = policy.requiresApproval({
    capabilityInventory: [manifest({ requiresApproval: true })],
    usedCapabilityIds: ["github.write_file"],
    impact: lowImpact,
  });
  assert.equal(result, true);
});

test("requires approval when impact is high, even if no capability is approval-gated", () => {
  const policy = new DefaultPlannerApprovalPolicy();
  const result = policy.requiresApproval({ capabilityInventory: [manifest({})], usedCapabilityIds: [], impact: highImpact });
  assert.equal(result, true);
});
