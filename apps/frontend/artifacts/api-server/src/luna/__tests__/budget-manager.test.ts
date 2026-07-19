import assert from "node:assert/strict";
import test from "node:test";
import { checkBudget, getUsageSnapshot, recordUsage } from "../budget-manager";

test("budget manager allows unlimited calls by default", async () => {
  const providerId = "test-provider-unlimited";

  for (let i = 0; i < 5; i += 1) {
    const result = await checkBudget(providerId);
    assert.equal(result.allowed, true);
    await recordUsage(providerId, { elapsedMs: 1, success: true });
  }

  assert.equal(getUsageSnapshot(providerId).callsToday, 5);
});

test("budget manager blocks a provider once its configured daily limit is reached", async () => {
  const providerId = "test-provider-limited";
  const envVar = `LUNA_BUDGET_DAILY_CALLS_${providerId.toUpperCase()}`;
  process.env[envVar] = "2";

  try {
    assert.equal((await checkBudget(providerId)).allowed, true);
    await recordUsage(providerId, { elapsedMs: 1, success: true });

    assert.equal((await checkBudget(providerId)).allowed, true);
    await recordUsage(providerId, { elapsedMs: 1, success: true });

    const blocked = await checkBudget(providerId);
    assert.equal(blocked.allowed, false);
    assert.match(blocked.reason ?? "", /daily_call_limit_reached/);
  } finally {
    delete process.env[envVar];
  }
});
