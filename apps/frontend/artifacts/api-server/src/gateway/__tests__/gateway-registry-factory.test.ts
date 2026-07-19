import assert from "node:assert/strict";
import test from "node:test";
import { createGatewayRegistry } from "../index";

test("createGatewayRegistry discovers the full live pack plus the two prepared-but-disabled integrations", () => {
  const registry = createGatewayRegistry();
  const manifests = registry.discover();
  const ids = manifests.map((manifest) => manifest.id);

  assert.equal(ids.length, 19);
  assert.ok(ids.includes("railway.get_deployment_status"));
  assert.ok(ids.includes("n8n.trigger_workflow"));

  const railway = manifests.find((manifest) => manifest.id === "railway.get_deployment_status");
  const n8n = manifests.find((manifest) => manifest.id === "n8n.trigger_workflow");
  assert.equal(railway?.status, "disabled");
  assert.equal(n8n?.status, "disabled");

  const liveCount = manifests.filter((manifest) => manifest.status === "healthy").length;
  assert.equal(liveCount, 17);
});

test("executing a disabled capability short-circuits without touching the adapter", async () => {
  const registry = createGatewayRegistry();

  const result = await registry.execute({
    capability: "railway.get_deployment_status",
    input: { serviceId: "any" },
  });

  assert.equal(result.success, false);
  assert.equal(result.error?.code, "CAPABILITY_DISABLED");

  const n8nResult = await registry.execute({
    capability: "n8n.trigger_workflow",
    input: { workflowId: "any" },
  });

  assert.equal(n8nResult.success, false);
  assert.equal(n8nResult.error?.code, "CAPABILITY_DISABLED");
});
