import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findRepoRoot } from "../lib/repo-root";

export interface ProjectContextSnapshot {
  state: string;
  evolutiveContext: string[];
  openTasks: string[];
  roadmap: string[];
  cognitiveIndexRefs: string[];
}

// Resolved by walking up to the repo's `.git` — a fixed relative depth
// breaks once this file is bundled by esbuild into dist/index.mjs (one
// directory shallower than src/luna) or run under `pnpm test` (different cwd).
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONTEXT_DIR = path.join(findRepoRoot(MODULE_DIR), "luna_context");
const STATE_SUMMARY_LENGTH = 400;
const MAX_EXTRACTED_LINES = 20;

async function readIfExists(baseDir: string, fileName: string): Promise<string> {
  try {
    const content = await readFile(path.join(baseDir, fileName), "utf8");
    return content.trim();
  } catch {
    return "";
  }
}

function extractListItems(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("*"))
    .slice(0, MAX_EXTRACTED_LINES);
}

/**
 * Índice Cognitivo v1 — logical reconstruction only.
 *
 * Reads the existing `luna_context/` longitudinal-memory files and turns them
 * into a structured snapshot (deterministic rules: file presence + list-item
 * extraction). This evolves the empty `sync.cognitiveIndexRefs` scaffolding
 * that already existed in `context.ts` instead of replacing it.
 *
 * Semantic reconstruction (embeddings-based concept/relation linking) is
 * explicitly NOT implemented here — the audit found zero embeddings
 * infrastructure anywhere in the runtime, and building it requires an
 * infrastructure decision (pgvector, embeddings provider) out of scope for
 * this consolidation pass.
 */
export async function readProjectContext(
  contextDir: string = DEFAULT_CONTEXT_DIR,
): Promise<ProjectContextSnapshot> {
  const [runtimeState, roadmap, decisions] = await Promise.all([
    readIfExists(contextDir, "RUNTIME_STATE.md"),
    readIfExists(contextDir, "ROADMAP.md"),
    readIfExists(contextDir, "DECISIONS.md"),
  ]);

  const cognitiveIndexRefs = [
    ["RUNTIME_STATE.md", runtimeState],
    ["ROADMAP.md", roadmap],
    ["DECISIONS.md", decisions],
  ]
    .filter(([, content]) => content.length > 0)
    .map(([fileName]) => `luna_context/${fileName}`);

  return {
    state: runtimeState ? runtimeState.slice(0, STATE_SUMMARY_LENGTH) : "estado do projeto não disponível",
    evolutiveContext: extractListItems(decisions),
    openTasks: extractListItems(roadmap),
    roadmap: extractListItems(roadmap),
    cognitiveIndexRefs,
  };
}
