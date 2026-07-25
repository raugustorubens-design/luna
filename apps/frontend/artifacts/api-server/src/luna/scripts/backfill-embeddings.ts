/**
 * Backfill de embedding para `memoria_luna`.
 *
 * Lê as linhas sem embedding (`embedding IS NULL`), gera o vetor via modelo
 * open source local (`gerarEmbedding`, sem custo de API — ver
 * `../embeddings.ts`) e grava de volta via UPDATE. Idempotente: só processa
 * linhas ainda não preenchidas, então pode rodar de novo sem duplicar
 * trabalho.
 *
 * Reusa o cliente Supabase já existente (`../../lib/supabase.ts`), em vez de
 * criar um novo — mesmas variáveis de ambiente (SUPABASE_URL, SUPABASE_KEY)
 * já usadas pelo resto do runtime.
 *
 * NÃO EXECUTADO neste ambiente de desenvolvimento: o download dos pesos do
 * modelo (`gerarEmbedding`) precisa de acesso a huggingface.co, fora da
 * allowlist de rede do sandbox. Precisa rodar num ambiente com rede completa
 * (produção, ou máquina local) antes de ser considerado validado.
 *
 * Uso:
 *   pnpm --dir ../.. exec tsx artifacts/api-server/src/luna/scripts/backfill-embeddings.ts
 */

import { supabase } from "../../lib/supabase";
import { gerarEmbedding, MODEL_ID } from "../embeddings";

interface LinhaMemoria {
  id: string;
  tipo: string | null;
  titulo: string | null;
  contexto: string | null;
  conteudo: unknown;
}

/**
 * Constrói o texto a ser embedado a partir dos campos já existentes na
 * linha — mesmo princípio de "não fabricar dado" do resto do runtime.
 */
function construirTextoParaEmbedding(linha: LinhaMemoria): string {
  const partes: string[] = [];
  if (linha.tipo) partes.push(`Tipo: ${linha.tipo}`);
  if (linha.titulo) partes.push(`Título: ${linha.titulo}`);
  if (linha.contexto) partes.push(`Contexto: ${linha.contexto}`);
  if (linha.conteudo) {
    const conteudoTexto = typeof linha.conteudo === "string" ? linha.conteudo : JSON.stringify(linha.conteudo);
    partes.push(`Conteúdo: ${conteudoTexto}`);
  }
  return partes.join("\n");
}

async function main() {
  console.log(`Modelo de embedding: ${MODEL_ID}`);
  console.log("Buscando linhas sem embedding...");

  const { data: linhas, error: erroLeitura } = await supabase
    .from("memoria_luna")
    .select("id, tipo, titulo, contexto, conteudo")
    .is("embedding", null);

  if (erroLeitura) {
    console.error("Erro ao buscar linhas:", erroLeitura.message);
    process.exitCode = 1;
    return;
  }

  if (!linhas || linhas.length === 0) {
    console.log("Nenhuma linha pendente — todas já têm embedding.");
    return;
  }

  console.log(`${linhas.length} linhas para processar.`);

  let sucesso = 0;
  let falha = 0;

  for (const linha of linhas as LinhaMemoria[]) {
    const texto = construirTextoParaEmbedding(linha);
    if (!texto.trim()) {
      console.warn(`  [pular] id=${linha.id} — sem conteúdo textual utilizável`);
      continue;
    }

    try {
      const embedding = await gerarEmbedding(texto);
      const { error: erroUpdate } = await supabase.from("memoria_luna").update({ embedding }).eq("id", linha.id);

      if (erroUpdate) {
        console.error(`  [falha] id=${linha.id}: ${erroUpdate.message}`);
        falha++;
      } else {
        console.log(`  [ok] id=${linha.id} (tipo=${linha.tipo ?? "?"})`);
        sucesso++;
      }
    } catch (error) {
      console.error(`  [falha] id=${linha.id}: ${error instanceof Error ? error.message : "erro desconhecido"}`);
      falha++;
    }
  }

  console.log(`\nConcluído: ${sucesso} sucesso, ${falha} falha, de ${linhas.length} total.`);
  if (falha > 0) process.exitCode = 1;
}

main();
