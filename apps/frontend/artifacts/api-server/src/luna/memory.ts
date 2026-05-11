import { supabase } from "../lib/supabase";

export async function storeMemory(memory: any) {
  const { error } = await supabase
    .from("memoria_luna")
    .insert([
      {
        tipo: memory.tipo,
        contexto: memory.contexto,
        conteudo: memory.conteudo,
        titulo: memory.titulo,
        empresa_id: memory.empresa_id,
      },
    ]);

  if (error) {
    console.error("STORE MEMORY ERROR:", error);
  }
}

export async function retrieveMemory(query: string) {
  const { data, error } = await supabase
    .from("memoria_luna")
    .select("*")
    .limit(10)
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("RETRIEVE MEMORY ERROR:", error);
    return [];
  }

  return data || [];
}