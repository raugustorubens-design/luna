import { logger } from "../lib/logger";
import { createLocalGuardianAdapter } from "./guardian-local-adapter";
import type { GuardianContract } from "./guardian-contract";
import type { LunaMemoryRecord } from "./contracts";

export interface MemoryPersistInput {
  tipo: string;
  contexto: string;
  titulo: string;
  empresa_id: number;
  conteudo: Record<string, unknown>;
}

const MEMORY_TABLE = "memoria_luna";
const ORIGIN = "memory-engine";

/**
 * Memory Engine: the only cognitive module allowed to reach persistence —
 * and even it never touches a storage driver directly anymore. Every
 * physical operation goes through the Guardian's contract (Guardian MVP-01);
 * this file doesn't know which database is underneath, doesn't know
 * connection details, doesn't import a driver. Everything else (Hipocampo,
 * Cognitive Engine, Context Hub) reaches persistence through the functions
 * exported
 * here, same as before — this refactor changes what's *behind* Memory
 * Engine, not its public surface.
 */
export function createMemoryEngine(guardian: GuardianContract = createLocalGuardianAdapter()) {
  async function persistMemory(memory: MemoryPersistInput): Promise<void> {
    try {
      await guardian.save(
        {
          collection: MEMORY_TABLE,
          data: {
            tipo: memory.tipo,
            contexto: memory.contexto,
            conteudo: memory.conteudo,
            titulo: memory.titulo,
            empresa_id: memory.empresa_id,
          },
        },
        ORIGIN,
      );
    } catch (error) {
      logger.error({ err: error }, "MEMORY ENGINE PERSIST ERROR");
    }
  }

  async function retrieveMemory(_query: string): Promise<LunaMemoryRecord[]> {
    try {
      const records = await guardian.search({ collection: MEMORY_TABLE, limit: 10, orderBy: "criado_em", ascending: false }, ORIGIN);
      return records as LunaMemoryRecord[];
    } catch (error) {
      logger.error({ err: error }, "MEMORY ENGINE RETRIEVE ERROR");
      return [];
    }
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

  /**
   * Read-only — same table, filtered by `tipo="checkpoint"`. Added for the
   * Context Hub (Forge MVP-02): reconstructing "último checkpoint" needs a
   * way to read checkpoints back, which didn't exist before (`checkpoint()`
   * only wrote). No new table, no new source of truth.
   */
  async function listCheckpoints(limit = 5): Promise<LunaMemoryRecord[]> {
    try {
      const records = await guardian.search(
        { collection: MEMORY_TABLE, filter: { tipo: "checkpoint" }, limit, orderBy: "criado_em", ascending: false },
        ORIGIN,
      );
      return records as LunaMemoryRecord[];
    } catch (error) {
      logger.error({ err: error }, "MEMORY ENGINE LIST CHECKPOINTS ERROR");
      return [];
    }
  }

  return { persistMemory, retrieveMemory, checkpoint, listCheckpoints };
}

const defaultMemoryEngine = createMemoryEngine();

export const persistMemory = defaultMemoryEngine.persistMemory;
export const retrieveMemory = defaultMemoryEngine.retrieveMemory;
export const checkpoint = defaultMemoryEngine.checkpoint;
export const listCheckpoints = defaultMemoryEngine.listCheckpoints;
