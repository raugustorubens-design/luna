import assert from "node:assert/strict";
import test from "node:test";
import { createGatewayRegistry } from "../index";

const expectedCapabilities: Record<string, boolean> = {
  "github.read_file": false,
  "supabase.query": false,
  "supabase.insert": true,
  "supabase.update": true,
  "supabase.delete": true,
  "supabase.rpc": true,
  "supabase.upload_file": true,
  "supabase.download_file": false,
  "railway.deploy": true,
  "railway.list_services": false,
  "railway.status": false,
  "railway.logs": false,
  "railway.variables": false,
  "railway.restart_service": true,
  "reporter.audit_repository": false,
  "reporter.snapshot": false,
  "reporter.runtime_state": false,
  "reporter.repository_map": false,
  "reporter.capability_inventory": false,
  "reporter.architecture_report": false,
};

test("createGatewayRegistry wires every capability pack with the expected approval gate", () => {
  const registry = createGatewayRegistry();
  const manifests = registry.discover();

  for (const [id, requiresApproval] of Object.entries(expectedCapabilities)) {
    const manifest = manifests.find((entry) => entry.id === id);
    assert.ok(manifest, `${id} should be registered`);
    assert.equal(manifest?.requiresApproval, requiresApproval, `${id} requiresApproval mismatch`);
    assert.equal(manifest?.status, "healthy");
    assert.equal(manifest?.supportsDryRun, true);
  }
});
