// src/luna/memory-signals.ts
//
// Formal contract for the six signals the Signal Engine computes for a
// memory candidate. Every field is a real, computed number — fields that
// can't be honestly computed yet (impact, outcome) say so explicitly in
// `explanation` rather than being silently faked.
//
// Immutable by contract: no later stage (Consolidation Engine, Hipocampo)
// may mutate a signal reading once computed.

export interface MemorySignals {
  readonly relevance: number; // R — [0,1]
  readonly novelty: number; // Δ — [0,1]
  readonly recurrence: number; // ρ — [0,1]
  readonly entropy: number; // E — [0,1] (conflito da memória nova vs. base existente)
  readonly impact: number; // I — [0,1] (Utility Gain — quanto altera capacidade futura de decisão)
  readonly outcome: number; // O — [-1,1], ou 0 quando não computável (ver explanation.outcome)
  readonly explanation?: {
    readonly relevance?: string[];
    readonly novelty?: string[];
    readonly recurrence?: string[];
    readonly entropy?: string[];
    readonly impact?: string[];
    readonly outcome?: string[];
  };
}
