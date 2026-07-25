/**
 * Teste manual do backfill usando um embedding MOCKADO (vetor determinístico
 * derivado do texto), não o modelo real.
 *
 * Objetivo: provar que a lógica de leitura/escrita no Supabase está correta,
 * isolando a única parte que não pôde ser exercitada neste ambiente — o
 * download real do modelo via huggingface.co, bloqueado pela allowlist de
 * rede do sandbox (ver `../embeddings.ts` e `backfill-embeddings.ts`).
 *
 * Não é um teste de `node:test` porque escreve e reverte dados reais em
 * `memoria_luna` — roda como script manual, contra um projeto Supabase real,
 * não em CI.
 *
 * Uso:
 *   pnpm --dir ../.. exec tsx artifacts/api-server/src/luna/scripts/test-backfill-embeddings.ts
 */

import { supabase } from "../../lib/supabase";

function embeddingFalsoDeterministico(texto: string): number[] {
  const v = new Array(384).fill(0);
  for (let i = 0; i < texto.length; i++) {
    v[i % 384] += texto.charCodeAt(i) / 1000;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

async function main() {
  const { data: linhas, error } = await supabase
    .from("memoria_luna")
    .select("id, tipo, titulo")
    .is("embedding", null)
    .limit(3);

  if (error) throw new Error(error.message);
  console.log(`Testando com ${linhas?.length ?? 0} linhas reais (embedding falso).`);

  for (const linha of linhas ?? []) {
    const embedding = embeddingFalsoDeterministico(`${linha.tipo ?? ""} ${linha.titulo ?? ""}`);
    const { error: erroUpdate } = await supabase.from("memoria_luna").update({ embedding }).eq("id", linha.id);
    if (erroUpdate) throw new Error(erroUpdate.message);
    console.log(`  [ok] id=${linha.id} atualizado com embedding falso`);
  }

  const ids = (linhas ?? []).map((l) => l.id);
  const { data: confirmacao, error: erroConf } = await supabase.from("memoria_luna").select("id, embedding").in("id", ids);
  if (erroConf) throw new Error(erroConf.message);
  const todasComEmbedding = confirmacao?.every((l) => l.embedding !== null);
  console.log(
    todasComEmbedding
      ? "PASS — todas as linhas testadas foram gravadas com embedding"
      : "FAIL — alguma linha ficou sem embedding",
  );

  const { error: erroRevert } = await supabase.from("memoria_luna").update({ embedding: null }).in("id", ids);
  if (erroRevert) throw new Error(erroRevert.message);
  console.log("Revertido — embeddings falsos removidos, linhas voltaram a NULL.");
}

main().catch((error) => {
  console.error("FALHOU:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
