import assert from "node:assert/strict";
import test from "node:test";
import { ReporterArchitectureReportCapability } from "../capabilities/reporter/architecture-report";
import { ReporterAuditRepositoryCapability } from "../capabilities/reporter/audit-repository";
import { ReporterCapabilityInventoryCapability } from "../capabilities/reporter/capability-inventory";
import { ReporterRepositoryMapCapability } from "../capabilities/reporter/repository-map";
import { ReporterRuntimeStateCapability } from "../capabilities/reporter/runtime-state";
import { ReporterSnapshotCapability } from "../capabilities/reporter/snapshot";
import type {
  ReporterAdapter,
  ReporterArchitectureReportInput,
  ReporterArchitectureReportOutput,
  ReporterAuditRepositoryInput,
  ReporterAuditRepositoryOutput,
  ReporterCapabilityInventoryInput,
  ReporterCapabilityInventoryOutput,
  ReporterRepositoryMapInput,
  ReporterRepositoryMapOutput,
  ReporterRuntimeStateInput,
  ReporterRuntimeStateOutput,
  ReporterSnapshotInput,
  ReporterSnapshotOutput,
} from "../contracts";
import { CapabilityRegistry } from "../registry/capability-registry";

class StubReporterAdapter implements ReporterAdapter {
  snapshotCalls = 0;

  async auditRepository(_input: ReporterAuditRepositoryInput): Promise<ReporterAuditRepositoryOutput> {
    return {
      generatedAt: new Date().toISOString(),
      applications: [{ name: "apps/frontend", type: "react_vite_typescript", status: "alive", role: "canonical_frontend" }],
      gitBranch: "main",
      gitHeadSha: "abc123",
      gitStatusClean: true,
    };
  }

  async snapshot(_input: ReporterSnapshotInput): Promise<ReporterSnapshotOutput> {
    this.snapshotCalls += 1;
    return {
      generatedAt: new Date().toISOString(),
      checkpointId: "checkpoint-test",
      cognitiveIndexRef: "luna_core",
      checkpointRefs: ["luna_checkpoint.json"],
      runtimeMemoryRef: ".luna/runtime/runtime_state.json",
      architecturalMemoryRefs: ["luna_context/ARCHITECTURE.md"],
    };
  }

  async runtimeState(_input: ReporterRuntimeStateInput): Promise<ReporterRuntimeStateOutput> {
    return {
      generatedAt: new Date().toISOString(),
      process: { uptimeSeconds: 1, nodeVersion: process.version, memoryRssBytes: 1024, pid: 1 },
      runtimeState: null,
    };
  }

  async repositoryMap(_input: ReporterRepositoryMapInput): Promise<ReporterRepositoryMapOutput> {
    return { generatedAt: new Date().toISOString(), repositoryMap: { workspace: { name: "luna" } } };
  }

  async capabilityInventory(_input: ReporterCapabilityInventoryInput): Promise<ReporterCapabilityInventoryOutput> {
    return { generatedAt: new Date().toISOString(), capabilityCount: 1, capabilities: [] };
  }

  async architectureReport(_input: ReporterArchitectureReportInput): Promise<ReporterArchitectureReportOutput> {
    return {
      generatedAt: new Date().toISOString(),
      layers: [{ name: "Registry", description: "test", locations: ["x"] }],
      capabilityCount: 1,
      documentationRefs: ["docs/architecture/luna-gateway.md"],
    };
  }
}

test("reporter capabilities never require approval", async () => {
  const registry = new CapabilityRegistry();
  const adapter = new StubReporterAdapter();
  registry.register(new ReporterAuditRepositoryCapability(adapter));
  registry.register(new ReporterSnapshotCapability(adapter));
  registry.register(new ReporterRuntimeStateCapability(adapter));
  registry.register(new ReporterRepositoryMapCapability(adapter));
  registry.register(new ReporterCapabilityInventoryCapability(adapter));
  registry.register(new ReporterArchitectureReportCapability(adapter));

  for (const manifest of registry.discover()) {
    assert.equal(manifest.requiresApproval, false, `${manifest.id} must not require approval`);
  }
});

test("reporter.audit_repository observes repository state without mutating it", async () => {
  const registry = new CapabilityRegistry();
  const adapter = new StubReporterAdapter();
  registry.register(new ReporterAuditRepositoryCapability(adapter));

  const result = await registry.execute({ capability: "reporter.audit_repository", input: {} });
  assert.equal(result.success, true);
  assert.equal((result.output as ReporterAuditRepositoryOutput).gitStatusClean, true);
});

test("reporter.snapshot synchronizes a checkpoint via the context sync port", async () => {
  const registry = new CapabilityRegistry();
  const adapter = new StubReporterAdapter();
  registry.register(new ReporterSnapshotCapability(adapter));

  const result = await registry.execute({ capability: "reporter.snapshot", input: {} });

  assert.equal(result.success, true);
  assert.equal(adapter.snapshotCalls, 1);
  const output = result.output as ReporterSnapshotOutput;
  assert.equal(output.cognitiveIndexRef, "luna_core");
  assert.ok(output.checkpointRefs.length > 0);
  assert.ok(output.architecturalMemoryRefs.length > 0);
});

test("reporter.capability_inventory reflects the registry it observes", async () => {
  const registry = new CapabilityRegistry();
  const adapter = new StubReporterAdapter();
  registry.register(new ReporterCapabilityInventoryCapability(adapter));

  const result = await registry.execute({ capability: "reporter.capability_inventory", input: {} });
  assert.equal(result.success, true);
  assert.equal((result.output as ReporterCapabilityInventoryOutput).capabilityCount, 1);
});
