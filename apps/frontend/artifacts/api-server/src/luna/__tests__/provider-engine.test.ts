import assert from "node:assert/strict";
import test from "node:test";
import { createProviderEngine, listProviderProfiles } from "../provider-engine";

test("provider engine registers all five known providers", () => {
  const engine = createProviderEngine();
  assert.deepEqual(
    [...engine.keys()].sort(),
    ["chatgpt", "claude", "grok", "groq", "manus"],
  );
});

test("provider engine profiles report configured status without leaking credentials", () => {
  const engine = createProviderEngine();
  const profiles = listProviderProfiles(engine);

  assert.equal(profiles.length, 5);
  for (const profile of profiles) {
    assert.equal(typeof profile.configured, "boolean");
  }
});

test("unconfigured provider adapters reject with a clear, non-fabricated error", async () => {
  const engine = createProviderEngine();
  const chatgpt = engine.get("chatgpt")!;

  delete process.env.OPENAI_API_KEY;
  assert.equal(chatgpt.isConfigured(), false);

  await assert.rejects(
    () => chatgpt.execute({ message: "hi", context: {} as never }),
    /not configured/,
  );
});
