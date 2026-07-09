import { logger } from "../lib/logger";
import { supabase } from "../lib/supabase";
import type { LunaMemoryRecord } from "./contracts";

export interface MemoryPersistInput {
  tipo: string;
  contexto: string;
  titulo: string;
  empresa_id: number;
  conteudo: Record<string, unknown>;
}

export interface MemoryStoreClient {
  from(table: string): {
    insert(rows: Record<string, unknown>[]): PromiseLike<{ error: unknown }>;
    select(columns: string): {
      limit(count: number): {
        order(
          column: string,
          options: { ascending: boolean },
        ): PromiseLike<{ data: unknown; error: unknown }>;
      };
    };
  };
}

const MEMORY_TABLE = "memoria_luna";

/**
 * Memory Engine: the only module allowed to touch `memoria_luna`.
 * Everything else (Hipocampo, Cognitive Engine) reaches persistence through
 * the functions exported here.
 */
export function createMemoryEngine(client: MemoryStoreClient = supabase) {
  async function persistMemory(memory: MemoryPersistInput): Promise<void> {
    const { error } = await client.from(MEMORY_TABLE).insert([
      {
        tipo: memory.tipo,
        contexto: memory.contexto,
        conteudo: memory.conteudo,
        titulo: memory.titulo,
        empresa_id: memory.empresa_id,
      },
    ]);

    if (error) {
      logger.error({ err: error }, "MEMORY ENGINE PERSIST ERROR");
    }
  }

  async function retrieveMemory(_query: string): Promise<LunaMemoryRecord[]> {
    const { data, error } = await client
      .from(MEMORY_TABLE)
      .select("*")
      .limit(10)
      .order("criado_em", { ascending: false });

    if (error) {
      logger.error({ err: error }, "MEMORY ENGINE RETRIEVE ERROR");
      return [];
    }

    return (data || []) as LunaMemoryRecord[];
  }

  /**
   * Checkpoints reuse the same `memoria_luna` table (tipo="checkpoint")
   * instead of a new table, so this ships without a schema migration.
   */
  async function checkpoint(summary: Record<string, unknown>): Promise<void> {
    await persistMemory({
      tipo: "checkpoint",
      contexto: "memory_engine_checkpoint",
      titulo: "Memory checkpoint",
      empresa_id: 1,
      conteudo: { ...summary, at: new Date().toISOString() },
    });
  }

  return { persistMemory, retrieveMemory, checkpoint };
}

const defaultMemoryEngine = createMemoryEngine();

export const persistMemory = defaultMemoryEngine.persistMemory;
export const retrieveMemory = defaultMemoryEngine.retrieveMemory;
export const checkpoint = defaultMemoryEngine.checkpoint;
