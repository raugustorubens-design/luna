import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

/**
 * Open source, local embedding generator — no API cost, no external
 * provider call.
 *
 * This fills the exact gap `indice-cognitivo.ts` documents: "the audit
 * found zero embeddings infrastructure anywhere in the runtime, and
 * building it requires an infrastructure decision (pgvector, embeddings
 * provider) out of scope for this consolidation pass." This module is that
 * infrastructure decision — a local, dependency-light model instead of a
 * paid provider, so semantic reconstruction in the Índice Cognitivo (and any
 * future embeddings-backed memory retrieval) doesn't add a per-call cost.
 *
 * Runs on @huggingface/transformers in WASM — the model weights download on
 * first call and are cached locally afterward. Multilingual model, covers
 * Portuguese.
 *
 * NOT verified running in this sandbox: downloading the model weights
 * requires reaching huggingface.co, which is outside this environment's
 * network allowlist. Needs to be exercised in an environment with full
 * network access (Railway/production, or a local machine) before anything
 * depends on it at runtime.
 */

const MODEL_ID = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
const EMBEDDING_DIMENSIONS = 384;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL_ID) as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

/**
 * Gera o embedding de um texto. Retorna um vetor de 384 dimensões.
 */
export async function gerarEmbedding(texto: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(texto, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

/**
 * Gera embeddings em lote — mais eficiente que chamar gerarEmbedding em
 * loop, já que o modelo fica carregado uma vez só.
 */
export async function gerarEmbeddingsEmLote(textos: string[]): Promise<number[][]> {
  const extractor = await getExtractor();
  const resultados: number[][] = [];
  for (const texto of textos) {
    const output = await extractor(texto, { pooling: "mean", normalize: true });
    resultados.push(Array.from(output.data as Float32Array));
  }
  return resultados;
}

export { EMBEDDING_DIMENSIONS, MODEL_ID };
