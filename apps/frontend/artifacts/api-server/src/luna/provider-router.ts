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

export class ProviderRouter {
  constructor(private readonly engine: Map<string, ProviderAdapter> = createProviderEngine()) {}

  async execute(input: ProviderExecutionInput, criteria: RoutingCriteria = {}): Promise<string> {
    let candidates = [...this.engine.values()].filter((adapter) => adapter.isConfigured());

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
