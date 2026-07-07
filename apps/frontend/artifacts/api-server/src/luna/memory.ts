import { logger } from "../lib/logger";
import { supabase } from "../lib/supabase";
import type { LunaMemoryRecord } from "./contracts";

export async function storeMemory(memory: LunaMemoryRecord): Promise<void> {
  const { error } = await supabase.from("memoria_luna").insert([
    {
      tipo: memory.tipo,
      contexto: memory.contexto,
      conteudo: memory.conteudo,
      titulo: memory.titulo,
      empresa_id: memory.empresa_id,
    },
  ]);

  if (error) {
    logger.error({ err: error }, "STORE MEMORY ERROR");
  }
}

export async function retrieveMemory(_query: string): Promise<LunaMemoryRecord[]> {
  const { data, error } = await supabase
    .from("memoria_luna")
    .select("*")
    .limit(10)
    .order("criado_em", { ascending: false });

  if (error) {
    logger.error({ err: error }, "RETRIEVE MEMORY ERROR");
    return [];
  }

  return (data || []) as LunaMemoryRecord[];
}
