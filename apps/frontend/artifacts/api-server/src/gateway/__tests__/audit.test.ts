import assert from "node:assert/strict";
import test from "node:test";
import { GatewayAuditor, InMemoryAuditSink } from "../audit/audit";
import type { CapabilityResult } from "../contracts";

test("audit records start, caller, and dry-run on request", async () => {
  const sink = new InMemoryAuditSink();
  const auditor = new GatewayAuditor(sink);

  await auditor.requested({
    capability: "supabase.query",
    dryRun: true,
    input: {},
    context: { actor: { id: "user-1", type: "user" } },
  });

  const requested = sink.events.find((event) => event.type === "capability.requested");
  const dryRun = sink.events.find((event) => event.type === "capability.dryrun");

  assert.ok(requested?.occurredAt);
  assert.equal(requested?.context?.actor?.id, "user-1");
  assert.ok(dryRun);
});

test("audit records end, duration, evidence, and error on completion", async () => {
  const sink = new InMemoryAuditSink();
  const auditor = new GatewayAuditor(sink);

  const failedResult: CapabilityResult = {
    success: false,
    capability: "supabase.delete",
    version: 1,
    duration: 42,
    status: "healthy",
    dryRun: false,
    evidence: [],
    output: null,
    error: { code: "APPROVAL_REQUIRED", message: "needs approval" },
  };

  await auditor.completed(failedResult, { actor: { id: "svc-1", type: "service" } });

  const completed = sink.events.find((event) => event.type === "capability.failed");
  assert.ok(completed?.occurredAt);
  assert.equal(completed?.context?.actor?.id, "svc-1");
  assert.equal(completed?.metadata?.duration, 42);
  assert.equal(completed?.metadata?.dryRun, false);
  assert.deepEqual(completed?.metadata?.error, { code: "APPROVAL_REQUIRED", message: "needs approval" });

  const successResult: CapabilityResult = {
    success: true,
    capability: "supabase.query",
    version: 1,
    duration: 7,
    status: "healthy",
    dryRun: false,
    evidence: [{ source: "supabase", reference: "memoria_luna", observedAt: new Date().toISOString() }],
    output: { rows: [] },
    error: null,
  };

  await auditor.completed(successResult);

  const executed = sink.events.find((event) => event.type === "capability.executed");
  assert.ok(executed);
  assert.equal((executed?.metadata?.evidence as unknown[]).length, 1);
  assert.equal(executed?.metadata?.error, null);
});
