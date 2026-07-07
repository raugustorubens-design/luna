import { emitAudit } from "./audit";
import { GroqAdapter } from "./adapters/groq";
import type { ProviderAdapter, ProviderExecutionInput } from "./contracts";

export class ProviderRouter {
  constructor(private readonly adapter: ProviderAdapter = new GroqAdapter()) {}

  async execute(input: ProviderExecutionInput): Promise<string> {
    const startedAt = Date.now();

    emitAudit({
      name: "provider.route.selected",
      evidence: { providerId: this.adapter.id },
    });

    try {
      const reply = await this.adapter.execute(input);
      const elapsedMs = Date.now() - startedAt;

      emitAudit({
        name: "provider.execution.succeeded",
        evidence: { providerId: this.adapter.id, elapsedMs },
      });

      return reply;
    } catch (error) {
      const elapsedMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : "Unknown provider error";

      emitAudit({
        name: "provider.execution.failed",
        evidence: { providerId: this.adapter.id, elapsedMs, message },
      });

      throw error;
    }
  }
}
