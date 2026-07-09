import assert from "node:assert/strict";
import test from "node:test";
import { ProviderRouter } from "../provider-router";
import type { LunaContext, ProviderAdapter, ProviderExecutionInput } from "../contracts";

function stubContext(): LunaContext {
  return {
    memories: [],
    current_message: "hello",
    identity: { name: "LUNA", mission: "test" },
    projectState: "",
    evolutiveContext: [],
    openTasks: [],
    roadmap: [],
    cognitiveAttractors: [],
    sync: { cognitiveIndexRefs: [], checkpointRefs: [], reconstructionRefs: [] },
  };
}

class StubAdapter implements ProviderAdapter {
  calls = 0;

  constructor(
    readonly id: string,
    private readonly configured: boolean,
    private readonly behavior: (input: ProviderExecutionInput) => Promise<string>,
  ) {}

  isConfigured(): boolean {
    return this.configured;
  }

  async execute(input: ProviderExecutionInput): Promise<string> {
    this.calls += 1;
    return this.behavior(input);
  }
}

test("provider router skips unconfigured providers and uses the first configured one", async () => {
  const unconfigured = new StubAdapter("unconfigured", false, async () => "should not run");
  const configured = new StubAdapter("configured", true, async () => "real reply");

  const router = new ProviderRouter(
    new Map<string, ProviderAdapter>([
      ["unconfigured", unconfigured],
      ["configured", configured],
    ]),
  );

  const reply = await router.execute({ message: "hi", context: stubContext() });

  assert.equal(reply, "real reply");
  assert.equal(unconfigured.calls, 0);
  assert.equal(configured.calls, 1);
});

test("provider router falls back to the next configured provider when the first fails", async () => {
  const failing = new StubAdapter("failing", true, async () => {
    throw new Error("boom");
  });
  const backup = new StubAdapter("backup", true, async () => "backup reply");

  const router = new ProviderRouter(
    new Map<string, ProviderAdapter>([
      ["failing", failing],
      ["backup", backup],
    ]),
  );

  const reply = await router.execute({ message: "hi", context: stubContext() });

  assert.equal(reply, "backup reply");
  assert.equal(failing.calls, 1);
  assert.equal(backup.calls, 1);
});

test("provider router throws when no provider is configured", async () => {
  const router = new ProviderRouter(new Map());

  await assert.rejects(
    () => router.execute({ message: "hi", context: stubContext() }),
    /No configured provider is available/,
  );
});

test("provider router throws the last error when every configured provider fails", async () => {
  const first = new StubAdapter("first", true, async () => {
    throw new Error("first failed");
  });
  const second = new StubAdapter("second", true, async () => {
    throw new Error("second failed");
  });

  const router = new ProviderRouter(
    new Map<string, ProviderAdapter>([
      ["first", first],
      ["second", second],
    ]),
  );

  await assert.rejects(
    () => router.execute({ message: "hi", context: stubContext() }),
    /second failed/,
  );
});
