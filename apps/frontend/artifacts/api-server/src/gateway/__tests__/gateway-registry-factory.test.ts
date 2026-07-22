import assert from "node:assert/strict";
import test from "node:test";
import { createGatewayRegistry } from "../index";

test("createGatewayRegistry discovers the full live pack plus the one prepared-but-disabled integration", () => {
  const registry = createGatewayRegistry();
  const manifests = registry.discover();
  const ids = manifests.map((manifest) => manifest.id);

  assert.equal(ids.length, 37);
  assert.ok(ids.includes("n8n.trigger_workflow"));

  const n8n = manifests.find((manifest) => manifest.id === "n8n.trigger_workflow");
  assert.equal(n8n?.status, "disabled");

  const liveCount = manifests.filter((manifest) => manifest.status === "healthy").length;
  assert.equal(liveCount, 36);
});

test("executing a disabled capability short-circuits without touching the adapter", async () => {
  const registry = createGatewayRegistry();

  const n8nResult = await registry.execute({
    capability: "n8n.trigger_workflow",
    input: { workflowId: "any" },
  });

  assert.equal(n8nResult.success, false);
  assert.equal(n8nResult.error?.code, "CAPABILITY_DISABLED");
});
