// src/luna/memory-signals.ts
//
// Formal contract for the six signals the Signal Engine computes for a
// memory candidate. Every field is a real, computed number — fields that
// can't be honestly computed yet (impact, outcome) say so explicitly in
// `explanation` rather than being silently faked.

export interface MemorySignals {
  relevance: number; // R — [0,1]
  novelty: number; // Δ — [0,1]
  recurrence: number; // ρ — [0,1]
  entropy: number; // E — [0,1] (conflito da memória nova vs. base existente)
  impact: number; // I — [0,1] (Utility Gain — quanto altera capacidade futura de decisão)
  outcome: number; // O — [-1,1], ou 0 quando não computável (ver explanation.outcome)
  explanation?: {
    relevance?: string;
    novelty?: string;
    recurrence?: string;
    entropy?: string;
    impact?: string;
    outcome?: string;
  };
}
