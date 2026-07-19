import { supabase } from "../lib/supabase";
import type {
  GuardianContract,
  StorageDeleteInput,
  StorageGetInput,
  StorageRecord,
  StorageSaveInput,
  StorageSearchInput,
  StorageUpdateInput,
} from "./guardian-contract";

interface QueryResult {
  data: unknown;
  error: unknown;
}

interface QueryTerminal {
  limit(count: number): PromiseLike<QueryResult> & {
    order(column: string, options: { ascending: boolean }): PromiseLike<QueryResult>;
  };
}

interface SelectBuilder extends QueryTerminal {
  eq(column: string, value: unknown): QueryTerminal;
}

interface SupabaseLikeClient {
  from(table: string): {
    insert(rows: Record<string, unknown>[]): { select(): PromiseLike<QueryResult> };
    update(data: Record<string, unknown>): { eq(column: string, value: unknown): { select(): PromiseLike<QueryResult> } };
    delete(): { eq(column: string, value: unknown): PromiseLike<{ error: unknown }> };
    select(columns: string): SelectBuilder;
  };
}

/**
 * Implementação local e transitória do `GuardianContract`. O Guardian
 * oficial vive em `raugustorubens-design/luna-api` (repositório próprio,
 * "um órgão, um repositório") — mas esta etapa não faz deploy dele ("Não
 * realizar deploy. Preparar apenas a arquitetura."), então não existe hoje
 * um Guardian real e alcançável por HTTP para o Memory Engine chamar.
 *
 * Esta classe satisfaz o mesmo contrato usando exatamente a mesma lógica
 * que o Memory Engine já tinha antes (mesmo cliente `@supabase/supabase-js`,
 * mesmas queries) — zero mudança de comportamento observável. Quando o
 * Guardian oficial for implantado, só esta classe muda (um `HttpGuardianClient`
 * chamando `POST /guardian/*` em luna-api) — o Memory Engine e todo o resto
 * do organismo continuam depender só de `GuardianContract`, sem saber que a
 * troca aconteceu.
 */
export function createLocalGuardianAdapter(client: SupabaseLikeClient = supabase as unknown as SupabaseLikeClient): GuardianContract {
  async function save({ collection, data }: StorageSaveInput): Promise<StorageRecord | null> {
    const { data: rows, error } = await client.from(collection).insert([data]).select();
    if (error) throw new StorageError("save", collection, error);
    return ((rows as StorageRecord[]) ?? [])[0] ?? null;
  }

  async function update({ collection, id, data }: StorageUpdateInput): Promise<StorageRecord | null> {
    const { data: rows, error } = await client.from(collection).update(data).eq("id", id).select();
    if (error) throw new StorageError("update", collection, error);
    return ((rows as StorageRecord[]) ?? [])[0] ?? null;
  }

  async function del({ collection, id }: StorageDeleteInput): Promise<boolean> {
    const { error } = await client.from(collection).delete().eq("id", id);
    if (error) throw new StorageError("delete", collection, error);
    return true;
  }

  async function get({ collection, id }: StorageGetInput): Promise<StorageRecord | null> {
    const { data: rows, error } = await client.from(collection).select("*").eq("id", id).limit(1);
    if (error) throw new StorageError("get", collection, error);
    return ((rows as StorageRecord[]) ?? [])[0] ?? null;
  }

  async function search({ collection, filter, limit = 10, orderBy, ascending = false }: StorageSearchInput): Promise<StorageRecord[]> {
    let builder: QueryTerminal = client.from(collection).select("*");
    for (const [column, value] of Object.entries(filter ?? {})) {
      builder = (builder as SelectBuilder).eq(column, value);
    }
    const limited = builder.limit(limit);
    const { data: rows, error } = orderBy ? await limited.order(orderBy, { ascending }) : await limited;
    if (error) throw new StorageError("search", collection, error);
    return (rows as StorageRecord[]) ?? [];
  }

  return {
    save: (input) => save(input),
    update: (input) => update(input),
    delete: (input) => del(input),
    get: (input) => get(input),
    search: (input) => search(input),
  };
}

/** Supabase's real errors are plain `{message, code, ...}` objects, not `Error` instances — checking `.message` directly (not `instanceof Error`) matters here. */
function extractMessage(cause: unknown): string {
  if (cause instanceof Error) return cause.message;
  if (cause && typeof cause === "object" && "message" in cause) return String((cause as { message: unknown }).message);
  return String(cause);
}

class StorageError extends Error {
  constructor(operation: string, collection: string, cause: unknown) {
    super(`Guardian ${operation} failed on ${collection}: ${extractMessage(cause)}`);
    this.name = "StorageError";
  }
}
