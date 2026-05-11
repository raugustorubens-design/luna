// src/luna/types.ts

export interface LunaMemory {
  id?: string;
  tipo?: string;
  contexto?: string;
  conteudo?: any;
  criado_em?: string;
  titulo?: string;
  empresa_id?: number;
}

export interface LunaContext {
  memories: LunaMemory[];
  userMessage: string;
}