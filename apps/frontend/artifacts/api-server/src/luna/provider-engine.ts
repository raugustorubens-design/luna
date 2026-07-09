import { GroqAdapter } from "./adapters/groq";
import { ChatGptAdapter } from "./adapters/chatgpt";
import { ClaudeAdapter } from "./adapters/claude";
import { GrokAdapter } from "./adapters/grok";
import { ManusAdapter } from "./adapters/manus";
import type { ProviderAdapter, ProviderProfile } from "./contracts";

/**
 * Provider Engine: integrates every model the organism can talk to.
 * Order below is also the Provider Router's default preference —
 * `groq` first because it is the only adapter with a real, tested
 * implementation today.
 */
export function createProviderEngine(): Map<string, ProviderAdapter> {
  const adapters: ProviderAdapter[] = [
    new GroqAdapter(),
    new ChatGptAdapter(),
    new ClaudeAdapter(),
    new GrokAdapter(),
    new ManusAdapter(),
  ];

  return new Map(adapters.map((adapter) => [adapter.id, adapter]));
}

export function listProviderProfiles(engine: Map<string, ProviderAdapter>): ProviderProfile[] {
  return [...engine.values()].map((adapter) => ({
    id: adapter.id,
    configured: adapter.isConfigured(),
  }));
}
