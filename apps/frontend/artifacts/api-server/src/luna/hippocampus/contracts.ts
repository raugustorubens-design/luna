// src/luna/hippocampus/contracts.ts
//
// The Hippocampus is the only organ allowed to persist LUNA's cognitive
// memory. Nothing here executes anything and nothing here talks to a
// provider - it only organizes knowledge so that identity survives across
// sessions through continuity, not replacement.

/** Temporal evolution state of a concept. Concepts are never deleted, only evolved. */
export const temporalityStates = ["ACTIVE", "DEPRECATED", "SUPERSEDED"] as const;
export type TemporalityState = (typeof temporalityStates)[number];

export function isTemporalityState(value: unknown): value is TemporalityState {
  return typeof value === "string" && (temporalityStates as readonly string[]).includes(value);
}

/** Distinguishes semantic knowledge from procedural knowledge. Both live as concepts. */
export type ConceptMemoryType = "semantic" | "procedural";

/**
 * A node in the Cognitive Index/Map. Always a concept - never a file, a
 * document, or a commit. `version` and `state` are the concept's
 * temporality: v1 -> v2 -> v3 -> ACTIVE | DEPRECATED | SUPERSEDED.
 */
export interface CognitiveConcept {
  id: string;
  key: string;
  memoryType: ConceptMemoryType;
  content: unknown;
  version: number;
  state: TemporalityState;
  previousVersionId: string | null;
  createdAt: string;
  supersededAt: string | null;
}

/** A directed edge of the Cognitive Map between two concepts, identified by key. */
export interface ConceptRelation {
  id: string;
  fromKey: string;
  toKey: string;
  relationType: string;
  createdAt: string;
}

/** A raw, chronological, append-only episode. The substrate concepts are consolidated from. */
export interface EpisodicMemoryRecord {
  id?: string | number;
  tipo?: string;
  contexto?: string;
  conteudo?: unknown;
  titulo?: string;
  empresa_id?: string | number;
  criado_em?: string;
}

/** A snapshot of cognitive continuity: what the organism can point back to and resume from. */
export interface CognitiveCheckpoint {
  id: string;
  createdAt: string;
  cognitiveIndexRef: string;
  conceptRefs: string[];
  metadata?: Record<string, unknown>;
}

/** Lightweight, queryable projection over the concept store. This IS the Cognitive Index. */
export interface CognitiveIndexEntry {
  key: string;
  conceptId: string;
  memoryType: ConceptMemoryType;
  version: number;
  state: TemporalityState;
}

export interface CognitiveIndexSnapshot {
  hasKey(key: string): boolean;
  getEntry(key: string): CognitiveIndexEntry | undefined;
  keys(): string[];
}

// ---------------------------------------------------------------------------
// Cognitive Filter: K(t) = f(L, C, I, T)
// ---------------------------------------------------------------------------

/** L - Estado Latente: the raw candidate information competing for persistence. */
export interface LatentState {
  /** Semantic identity of the candidate. Absent for pure episodic entries. */
  key?: string;
  kind: "episodic" | "semantic" | "procedural" | "relation" | "checkpoint" | "reconstruction_request";
  content: unknown;
  relatesTo?: { fromKey: string; toKey: string; relationType: string };
  /** Explicit persistence signal in [0, 1]. Never inferred - only declared by the caller. */
  salience?: number;
}

/** C - Contexto: where the candidate came from. */
export interface CognitiveContextSignal {
  source: string;
  actor?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

/** T - Temporalidade: evolution of knowledge, not just a wall-clock timestamp. */
export interface TemporalitySignal {
  observedAt: string;
  /** Key this candidate explicitly declares itself to evolve. */
  evolutionOf?: string;
}

export interface CognitiveFilterInput {
  latentState: LatentState;
  context: CognitiveContextSignal;
  index: CognitiveIndexSnapshot;
  temporality: TemporalitySignal;
}

export type CognitiveFilterAction =
  | "discard"
  | "create_concept"
  | "update_concept"
  | "update_relations"
  | "update_checkpoint"
  | "reconstruct_memory";

export interface CognitiveFilterDecision {
  action: CognitiveFilterAction;
  reason: string;
  targetKey?: string;
  evaluatedAt: string;
}

// ---------------------------------------------------------------------------
// Reconstruction
// ---------------------------------------------------------------------------

export interface ReconstructionInput {
  objective: string;
  context?: Record<string, unknown>;
}

export interface ReconstructedCognitiveState {
  objective: string;
  concepts: CognitiveConcept[];
  relations: ConceptRelation[];
  checkpoint: CognitiveCheckpoint | null;
  cognitiveIndexRefs: string[];
  checkpointRefs: string[];
  reconstructionRefs: string[];
  reconstructedAt: string;
}

// ---------------------------------------------------------------------------
// Memory candidates offered to the Hippocampus
// ---------------------------------------------------------------------------

export interface MemoryCandidate {
  latentState: LatentState;
  context: CognitiveContextSignal;
  temporality?: Partial<TemporalitySignal>;
}

export interface RememberResult {
  decision: CognitiveFilterDecision;
  concept?: CognitiveConcept;
  relation?: ConceptRelation;
  checkpoint?: CognitiveCheckpoint;
  reconstruction?: ReconstructedCognitiveState;
  episodic?: EpisodicMemoryRecord;
}

/**
 * Structural shape shared by the Reporter's event types (`AuditEvent` from
 * `luna/audit.ts` and `GatewayAuditEvent` from `gateway/audit/audit.ts`).
 * The Hippocampus consumes events through this shape so it never needs to
 * import the Reporter's concrete types - it only depends on what an event
 * looks like.
 */
export interface ReporterEvent {
  name?: string;
  type?: string;
  at?: string;
  occurredAt?: string;
  evidence?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
