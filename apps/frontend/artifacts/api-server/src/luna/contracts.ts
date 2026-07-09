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
