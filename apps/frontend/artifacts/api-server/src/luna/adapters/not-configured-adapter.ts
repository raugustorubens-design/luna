import type { ProviderAdapter, ProviderExecutionInput } from "../contracts";

/**
 * Base for providers the organism knows about but has no working
 * implementation or credentials for yet (ChatGPT, Claude, Grok, Manus).
 * Registering them makes the Provider Engine's roster honest and
 * extensible without pretending any of them can actually answer a request.
 */
export abstract class NotConfiguredAdapter implements ProviderAdapter {
  abstract readonly id: string;
  protected abstract readonly envVar: string;

  isConfigured(): boolean {
    return Boolean(process.env[this.envVar]);
  }

  async execute(_input: ProviderExecutionInput): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error(`${this.id} provider is not configured (missing ${this.envVar})`);
    }

    throw new Error(`${this.id} provider adapter has no implementation yet`);
  }
}
