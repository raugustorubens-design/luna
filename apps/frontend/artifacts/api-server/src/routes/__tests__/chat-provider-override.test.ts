import assert from "node:assert/strict";
import test from "node:test";
import { resolveProviderOverride } from "../chat-provider-override";

test("resolveProviderOverride ignores the provider field without the dev-mode header", () => {
  assert.equal(resolveProviderOverride({ provider: "claude" }, undefined), undefined);
  assert.equal(resolveProviderOverride({ provider: "claude" }, "false"), undefined);
});

test("resolveProviderOverride reads the provider field when the dev-mode header is set", () => {
  assert.equal(resolveProviderOverride({ provider: "claude" }, "true"), "claude");
});

test("resolveProviderOverride ignores a missing, blank or non-string provider field", () => {
  assert.equal(resolveProviderOverride({}, "true"), undefined);
  assert.equal(resolveProviderOverride({ provider: "   " }, "true"), undefined);
  assert.equal(resolveProviderOverride({ provider: 42 }, "true"), undefined);
  assert.equal(resolveProviderOverride(null, "true"), undefined);
});
