import { emitReport } from "./reporter";
import { createProviderEngine } from "./provider-engine";
import { checkBudget, recordUsage } from "./budget-manager";
import type { ProviderAdapter, ProviderExecutionInput } from "./contracts";

/**
 * Provider Router: picks a provider and falls back to the next configured
 * one when the preferred choice is over budget or fails at execution time.
 *
 * v1 selection is availability-order only (the Provider Engine's
 * registration order doubles as preference). Cost, historical quality and
 * latency-based scoring are real target criteria that need actual usage
 * data from more than one configured provider to mean anything — today only
 * `groq` has a working implementation, so building a scoring model now would
 * be tuning against a single data point. The hook (`RoutingCriteria`) exists
 * so that logic has somewhere to land once it does.
 */
export interface RoutingCriteria {
  taskType?: string;
  /**
   * Dev-mode-only override (see `POST /api/chat`'s `X-Luna-Dev-Mode` gate).
   * Moves the named provider to the front of the candidate list; the normal
   * fallback chain still runs behind it if it fails or isn't configured.
   */
  preferredProviderId?: string;
}

/**
 * ProviderHealth: a recent-error-rate counter per provider, over the last
 * `HEALTH_WINDOW_SIZE` calls. It *weights* the existing static fallback
 * order, it doesn't replace it — a provider that's been failing a lot
 * recently sinks to later in the attempt order via a stable sort, but a
 * provider with no recent history (or a good one) keeps its static
 * position. No `DecisionPlan`/`Policy`/`Goal`/`Task` machinery here — that's
 * documented future direction, not this round's scope.
 */
const HEALTH_WINDOW_SIZE = 20;

const healthState = new Map<string, boolean[]>();

export function recordProviderHealth(providerId: string, success: boolean): void {
  const recent = healthState.get(providerId) ?? [];
  recent.push(success);
  if (recent.length > HEALTH_WINDOW_SIZE) {
    recent.shift();
  }
  healthState.set(providerId, recent);
}

export function getProviderErrorRate(providerId: string): number {
  const recent = healthState.get(providerId);
  if (!recent || recent.length === 0) return 0;
  const failures = recent.filter((success) => !success).length;
  return failures / recent.length;
}

export function resetProviderHealth(providerId?: string): void {
  if (providerId) {
    healthState.delete(providerId);
  } else {
    healthState.clear();
  }
}

/** Stable sort by ascending recent error rate — ties keep the static order. */
function orderByHealth(candidates: ProviderAdapter[]): ProviderAdapter[] {
  return [...candidates].sort((a, b) => getProviderErrorRate(a.id) - getProviderErrorRate(b.id));
}

export class ProviderRouter {
  constructor(private readonly engine: Map<string, ProviderAdapter> = createProviderEngine()) {}

  async execute(input: ProviderExecutionInput, criteria: RoutingCriteria = {}): Promise<string> {
    let candidates = [...this.engine.values()].filter((adapter) => adapter.isConfigured());

    candidates = orderByHealth(candidates);

    if (criteria.preferredProviderId) {
      const preferred = candidates.find((adapter) => adapter.id === criteria.preferredProviderId);
      if (preferred) {
        candidates = [preferred, ...candidates.filter((adapter) => adapter !== preferred)];
      }
    }

    if (candidates.length === 0) {
      throw new Error("No configured provider is available");
    }

    let lastError: unknown;

    for (const adapter of candidates) {
      const budget = await checkBudget(adapter.id);

      if (!budget.allowed) {
        emitReport({
          name: "provider.route.budget_blocked",
          evidence: { providerId: adapter.id, reason: budget.reason },
        });
        continue;
      }

      const startedAt = Date.now();
      emitReport({ name: "provider.route.selected", evidence: { providerId: adapter.id } });

      try {
        const reply = await adapter.execute(input);
        const elapsedMs = Date.now() - startedAt;

        await recordUsage(adapter.id, { elapsedMs, success: true });
        recordProviderHealth(adapter.id, true);
        emitReport({
          name: "provider.execution.succeeded",
          evidence: { providerId: adapter.id, elapsedMs },
        });

        return reply;
      } catch (error) {
        const elapsedMs = Date.now() - startedAt;
        const message = error instanceof Error ? error.message : "Unknown provider error";

        lastError = error;
        await recordUsage(adapter.id, { elapsedMs, success: false });
        recordProviderHealth(adapter.id, false);
        emitReport({
          name: "provider.execution.failed",
          evidence: { providerId: adapter.id, elapsedMs, message },
        });
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("All configured providers were over budget or failed");
  }
}
