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
 * Common PT/EN stopwords (articles, prepositions, conjunctions, pronouns).
 * Replaces a plain `token.length > 2` filter, which incorrectly dropped
 * short technical terms ("go", "c", "s3", "ui", "ux", "qa", "pr", "ai").
 * `TECHNICAL_TERM_ALLOWLIST` guarantees those survive even if a future edit
 * to this list accidentally overlaps with one of them.
 */
const STOPWORDS = new Set([
  // Portuguese
  "a", "o", "as", "os", "de", "da", "do", "das", "dos", "em", "um", "uma", "uns", "umas",
  "para", "por", "com", "sem", "sobre", "entre", "que", "e", "ou", "mas", "se", "não",
  "é", "são", "foi", "ser", "ao", "aos", "à", "às", "na", "no", "nas", "nos", "como",
  "mais", "muito", "também", "já", "só", "ele", "ela", "eles", "elas", "eu", "tu",
  "você", "nós", "isso", "isto", "aquilo", "esse", "essa", "este", "esta", "num", "numa",
  // English
  "a", "an", "the", "of", "in", "on", "for", "to", "with", "without", "about", "between",
  "that", "and", "or", "but", "if", "not", "is", "are", "was", "be", "at", "as", "more",
  "very", "also", "already", "only", "he", "she", "they", "we", "you", "this", "these",
  "those", "from", "by", "it", "its",
]);

const TECHNICAL_TERM_ALLOWLIST = new Set(["go", "c", "s3", "ui", "ux", "qa", "pr", "ai"]);

/**
 * Deterministic word splitter shared by the Signal Engine (relevance,
 * novelty, recurrence, entropy all key off this). Pure — no I/O.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .filter(Boolean)
    .filter((token) => TECHNICAL_TERM_ALLOWLIST.has(token) || !STOPWORDS.has(token));
}

/**
 * LexicalSimilarity: Jaccard overlap between two token sets, in [0,1].
 * This is the only relevance component implemented in v1 — see
 * `signal-engine.ts` for the components still waiting on real embeddings.
 */
export function lexicalSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

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
