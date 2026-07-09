export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
}

export interface UsageRecord {
  elapsedMs: number;
  success: boolean;
}

interface ProviderUsageState {
  callsToday: number;
  callsThisMonth: number;
  lastResetDay: string;
  lastResetMonth: string;
}

const usage = new Map<string, ProviderUsageState>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

function getState(providerId: string): ProviderUsageState {
  const day = todayKey();
  const month = monthKey();
  const existing = usage.get(providerId);

  if (existing && existing.lastResetDay === day) {
    return existing;
  }

  const state: ProviderUsageState = {
    callsToday: 0,
    callsThisMonth: existing?.lastResetMonth === month ? existing.callsThisMonth : 0,
    lastResetDay: day,
    lastResetMonth: month,
  };
  usage.set(providerId, state);
  return state;
}

/**
 * Daily call-count limit per provider, read from env (`LUNA_BUDGET_DAILY_CALLS_<PROVIDER>`,
 * falling back to `LUNA_BUDGET_DAILY_CALLS_DEFAULT`). Defaults to unlimited.
 *
 * There is no real per-token/per-dollar pricing data available anywhere in
 * the project for any of the five providers, so this v1 controls *call
 * volume*, not cost in currency — implementing a $ budget here would mean
 * inventing pricing numbers that don't exist. This is a documented gap, not
 * an oversight.
 */
function dailyLimit(providerId: string): number {
  const raw =
    process.env[`LUNA_BUDGET_DAILY_CALLS_${providerId.toUpperCase()}`] ??
    process.env.LUNA_BUDGET_DAILY_CALLS_DEFAULT;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
}

export async function checkBudget(providerId: string): Promise<BudgetCheckResult> {
  const state = getState(providerId);
  const limit = dailyLimit(providerId);

  if (state.callsToday >= limit) {
    return { allowed: false, reason: `daily_call_limit_reached(${limit})` };
  }

  return { allowed: true };
}

export async function recordUsage(providerId: string, _record: UsageRecord): Promise<void> {
  const state = getState(providerId);
  state.callsToday += 1;
  state.callsThisMonth += 1;
}

export function getUsageSnapshot(providerId: string): Readonly<ProviderUsageState> {
  return { ...getState(providerId) };
}
