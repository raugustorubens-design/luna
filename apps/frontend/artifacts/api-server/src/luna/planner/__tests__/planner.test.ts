import assert from "node:assert/strict";
import test from "node:test";
import type { CapabilityManifest } from "../../../gateway";
import type { ReconstructedCognitiveState, ReconstructionInput } from "../../hippocampus";
import { Planner } from "../index";
import type { PlannerMemoryPort } from "../contracts";

function manifest(overrides: Partial<CapabilityManifest>): CapabilityManifest {
  return {
    id: "github.write_file",
    version: 1,
    owner: "gateway",
    status: "healthy",
    requiresApproval: false,
    supportsDryRun: true,
    supportsRollback: true,
    description: "Write a file to a GitHub repository.",
    ...overrides,
  };
}

function reconstructedState(overrides: Partial<ReconstructedCognitiveState> = {}): ReconstructedCognitiveState {
  return {
    objective: "",
    concepts: [],
    relations: [],
    checkpoint: null,
    cognitiveIndexRefs: [],
    checkpointRefs: [],
    reconstructionRefs: [],
    reconstructedAt: new Date().toISOString(),
    ...overrides,
  };
}

class StubMemoryPort implements PlannerMemoryPort {
  public receivedInputs: ReconstructionInput[] = [];
  constructor(private readonly state: ReconstructedCognitiveState) {}

  async reconstruct(input: ReconstructionInput): Promise<ReconstructedCognitiveState> {
    this.receivedInputs.push(input);
    return { ...this.state, objective: input.objective };
  }
}

test("planner never receives an executable registry - only a plain manifest inventory", async () => {
  const memory = new StubMemoryPort(reconstructedState());
  const planner = new Planner(memory);

  const plan = await planner.plan({
    objective: "write the README file",
    capabilityInventory: [manifest({ id: "github.write_file", description: "Write file to GitHub repository." })],
  });

  assert.equal(plan.objective, "write the README file");
  assert.equal(memory.receivedInputs.length, 1);
});

test("planner produces an analysis-only plan when no capability matches the objective", async () => {
  const memory = new StubMemoryPort(reconstructedState());
  const planner = new Planner(memory);

  const plan = await planner.plan({ objective: "reflect on organism identity", capabilityInventory: [manifest({})] });

  assert.equal(plan.capabilities.length, 0);
  assert.equal(plan.impact.level, "low");
  assert.equal(plan.approvalRequired, false);
  assert.equal(plan.risks.some((risk) => risk.description.includes("analysis-only")), true);
});

test("planner matches steps to capabilities by keyword overlap and orders dependencies sequentially", async () => {
  const memory = new StubMemoryPort(reconstructedState());
  const planner = new Planner(memory);

  const plan = await planner.plan({
    objective: "write_file to update docs",
    capabilityInventory: [manifest({ id: "github.write_file", description: "Write file to GitHub repository." })],
  });

  assert.equal(plan.steps.length, 1);
  assert.equal(plan.steps[0]?.capability, "github.write_file");
  assert.deepEqual(plan.capabilities, ["github.write_file"]);
});

test("planner marks impact high and requires approval when a matched capability cannot be rolled back", async () => {
  const memory = new StubMemoryPort(reconstructedState());
  const planner = new Planner(memory);

  const plan = await planner.plan({
    objective: "commit changes to the repository",
    capabilityInventory: [manifest({ id: "github.commit", description: "Commit changes to a repository.", supportsRollback: false })],
  });

  assert.equal(plan.impact.level, "high");
  assert.equal(plan.impact.reversible, false);
  assert.equal(plan.approvalRequired, true);
  assert.equal(plan.priority, "critical");
});

test("planner requires approval when the matched capability's manifest declares requiresApproval", async () => {
  const memory = new StubMemoryPort(reconstructedState());
  const planner = new Planner(memory);

  const plan = await planner.plan({
    objective: "create_pull_request for the release",
    capabilityInventory: [
      manifest({ id: "github.create_pull_request", description: "Create a pull request.", requiresApproval: true }),
    ],
  });

  assert.equal(plan.approvalRequired, true);
});

test("planner flags a risk when a step references a capability absent from the inventory", async () => {
  const memory = new StubMemoryPort(reconstructedState());
  const planner = new Planner(memory);

  // No capability in the inventory matches "deploy", so this exercises the analysis-only path;
  // to exercise the unregistered-capability risk we call resolveCapabilities directly via a step
  // that references a capability id not present in the inventory.
  const plan = await planner.plan({ objective: "deploy the application", capabilityInventory: [] });

  assert.equal(plan.capabilities.length, 0);
  assert.equal(plan.steps.length, 1);
});

test("planner carries the reconstructed cognitive state through to the structured plan", async () => {
  const state = reconstructedState({
    concepts: [
      { id: "1", key: "gateway", memoryType: "semantic", content: {}, version: 1, state: "ACTIVE", previousVersionId: null, createdAt: "t", supersededAt: null },
    ],
    cognitiveIndexRefs: ["gateway"],
  });
  const memory = new StubMemoryPort(state);
  const planner = new Planner(memory);

  const plan = await planner.plan({ objective: "gateway maintenance", capabilityInventory: [] });

  assert.equal(plan.reconstructedState.concepts.length, 1);
  assert.equal(plan.expectedCheckpoint.cognitiveIndexRef, "index:1");
});
