export type LunaRole = "system" | "user" | "assistant";

export interface LunaMemoryRecord {
  id?: string | number;
  tipo?: string;
  contexto?: string;
  conteudo?: unknown;
  titulo?: string;
  empresa_id?: string | number;
  criado_em?: string;
}

export interface LunaIdentity {
  name: string;
  mission: string;
}

export interface LunaContext {
  memories: LunaMemoryRecord[];
  current_message: string;
  identity: LunaIdentity;
  projectState: string;
  evolutiveContext: string[];
  openTasks: string[];
  roadmap: string[];
  cognitiveAttractors: string[];
  sync: {
    cognitiveIndexRefs: string[];
    checkpointRefs: string[];
    reconstructionRefs: string[];
  };
}

export interface ProviderExecutionInput {
  message: string;
  context: LunaContext;
}

export interface ProviderAdapter {
  readonly id: string;
  isConfigured(): boolean;
  execute(input: ProviderExecutionInput): Promise<string>;
}

export interface ProviderProfile {
  id: string;
  configured: boolean;
}

export interface AuditEvent {
  name: string;
  at: string;
  evidence?: Record<string, unknown>;
}

/**
 * Public shape returned by the Context Hub (`GET /api/context`) — the single
 * object any authorized consumer (Forge, Convergia, Reporter, future
 * clients) reconstructs the organism's current context from. Deliberately a
 * *different* type from `LunaContext` above: `LunaContext` is the internal
 * shape `assembleContext` builds per-request for a specific provider
 * execution (tied to one message + its retrieved memories); `OrganismContext`
 * is the organism-wide snapshot with no notion of "the current message".
 * Reusing `LunaContext`'s name for this would have papered over that they
 * answer different questions — see LUNA_CONTEXT.md for the recorded decision.
 */
export interface OrganismContext {
  project: string;
  mission: string;
  currentMvp: string;
  architecturalState: string;
  organismState: string;
  cognitiveIndex: string[];
  checkpoints: Array<{ id?: string | number; summary: string; at?: string }>;
  inferences: string[];
  roadmap: string[];
  activeRepositories: string[];
  activeSystems: string[];
  providers: ProviderProfile[];
}
