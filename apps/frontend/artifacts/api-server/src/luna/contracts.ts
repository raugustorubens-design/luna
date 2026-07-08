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

export interface LunaContext {
  memories: LunaMemoryRecord[];
  current_message: string;
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
  execute(input: ProviderExecutionInput): Promise<string>;
}

export interface AuditEvent {
  name: string;
  at: string;
  evidence?: Record<string, unknown>;
}
