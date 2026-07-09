import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findRepoRoot } from "../lib/repo-root";
import type { LunaContext, LunaIdentity, LunaMemoryRecord, OrganismContext } from "./contracts";
import { readProjectContext } from "./indice-cognitivo";
import { listCheckpoints } from "./memory-engine";
import { createProviderEngine, listProviderProfiles } from "./provider-engine";

const LUNA_IDENTITY: LunaIdentity = {
  name: "LUNA",
  mission:
    "Organismo cognitivo soberano: continuidade, memória reconstrutiva e execução via Provider Engine e Gateway de capacidades.",
};

/**
 * Context Hub: the single shared context every provider execution consumes.
 * No provider may run without this — `provider-router.ts` always builds its
 * `ProviderExecutionInput.context` from here.
 */
export async function assembleContext(memories: LunaMemoryRecord[], message: string): Promise<LunaContext> {
  const projectContext = await readProjectContext();

  return {
    memories,
    current_message: message,
    identity: LUNA_IDENTITY,
    projectState: projectContext.state,
    evolutiveContext: projectContext.evolutiveContext,
    openTasks: projectContext.openTasks,
    roadmap: projectContext.roadmap,
    // "Atratores cognitivos" não tem definição de produto em nenhum documento
    // do projeto — mantido vazio até haver especificação real.
    cognitiveAttractors: [],
    sync: {
      cognitiveIndexRefs: projectContext.cognitiveIndexRefs,
      checkpointRefs: [],
      reconstructionRefs: [],
    },
  };
}

// ---- buildOrganismContext (Forge MVP-02) ----------------------------------
//
// Reconstructs `OrganismContext` for any authorized external consumer
// (Forge's Contexto panel today; Convergia/Reporter/future clients are the
// same shape tomorrow). Never persists, never decides, never touches the
// database directly — read-only composition over sources that already
// exist: Índice Cognitivo (readProjectContext), LUNA_CONTEXT.md (the real,
// maintained continuity log — RUNTIME_STATE.md/ROADMAP.md/DECISIONS.md at
// the repo root are known-empty scaffolds, see indice-cognitivo tests),
// forge/ROADMAP.md (the real MVP roadmap), ADR-004 (the real discovered-repo
// list), the Provider Engine's own registry, and Memory Engine's checkpoints.
//
// No new source of truth is created — every field below is parsed from a
// document or organ that already exists, not concatenated wholesale.

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = findRepoRoot(MODULE_DIR);

async function readIfExists(absolutePath: string): Promise<string> {
  try {
    return (await readFile(absolutePath, "utf8")).trim();
  } catch {
    return "";
  }
}

/** Same extraction Forge's Contexto panel used to do client-side — moved here so Forge stops reading markdown itself. */
function extractMission(content: string): string {
  if (!content) return "";
  const withoutHeading = content.replace(/^#.*\n/, "").trim();
  const firstParagraph = withoutHeading.split(/\n\s*\n/)[0] ?? "";
  return firstParagraph.slice(0, 400);
}

/** Last top-level numbered section heading ("## 13. Consolidação..."), i.e. the most recent logged step. */
function extractCurrentMvp(content: string): string {
  const matches = [...content.matchAll(/^##\s+\d+\.\s*(.+)$/gm)];
  return matches.at(-1)?.[1]?.trim() ?? "";
}

/** Content of a markdown section from a heading match to the next heading of the same or higher level. */
function extractSection(content: string, headingPattern: RegExp): string {
  const matches = [...content.matchAll(new RegExp(headingPattern.source, `${headingPattern.flags}gm`))];
  const last = matches.at(-1);
  if (!last || last.index === undefined) return "";

  const headingLevel = (last[0].match(/^#+/) ?? ["##"])[0].length;
  const rest = content.slice(last.index + last[0].length);
  const nextHeading = rest.match(new RegExp(`^#{1,${headingLevel}}\\s`, "m"));
  return nextHeading?.index !== undefined ? rest.slice(0, nextHeading.index) : rest;
}

function extractListItems(content: string, max = 20): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-") || line.startsWith("*"))
    .slice(0, max);
}

/** `## Forge MVP-02 — Context Hub` -> "Forge MVP-02 — Context Hub"; skips non-MVP headings like "Pendências técnicas". */
function extractRoadmapHeadings(content: string): string[] {
  return [...content.matchAll(/^##\s+(Forge MVP-\d+.*)$/gm)].map((match) => match[1]!.trim());
}

/** Deduped `owner/repo` slugs mentioned in a doc — used against ADR-004's prose, not a bullet list. */
function extractRepoSlugs(content: string): string[] {
  const matches = content.match(/raugustorubens-design\/[\w.-]+/g) ?? [];
  return [...new Set(matches)];
}

/** Bolded names at the start of a bullet ("- **Gateway** — ...") — how §1 of LUNA_CONTEXT.md lists the 12 organs. */
function extractBoldedNames(content: string): string[] {
  return [...content.matchAll(/^- \*\*([^*]+)\*\*/gm)].map((match) => match[1]!.trim());
}

export async function buildOrganismContext(): Promise<OrganismContext> {
  const [projectContext, lunaContextMd, forgeRoadmapMd, adr004] = await Promise.all([
    readProjectContext(),
    readIfExists(path.join(REPO_ROOT, "luna_context", "LUNA_CONTEXT.md")),
    readIfExists(path.join(REPO_ROOT, "forge", "ROADMAP.md")),
    readIfExists(path.join(REPO_ROOT, "docs", "architecture", "adr-004-organs-as-independent-mvps.md")),
  ]);

  const providers = listProviderProfiles(createProviderEngine());

  // Memory Engine (and, through it, its persistence layer) may legitimately
  // be unreachable — checkpoints must degrade to an empty list, never throw,
  // same contract `readProjectContext` already honors for missing files.
  const rawCheckpoints = await listCheckpoints(5).catch(() => [] as LunaMemoryRecord[]);
  const checkpoints = rawCheckpoints.map((record) => ({
    id: record.id,
    summary: typeof record.titulo === "string" && record.titulo ? record.titulo : "checkpoint",
    at: record.criado_em,
  }));

  const inferencesSection = extractSection(lunaContextMd, /^#{2,3}\s*(?:\d+\.\s*)?Inferências consolidadas/);
  // Scoped to the "12 órgãos" subsection specifically (### under §1), not
  // all of §1 — §1 also has a Convergia subsection whose bolded bullets are
  // feature descriptions, not organ names, and would otherwise leak in.
  const organsSection = extractSection(lunaContextMd, /^###\s+Prompt 2.*órgãos/);
  const roadmapHeadings = extractRoadmapHeadings(forgeRoadmapMd);

  const providersConfigured = providers.filter((provider) => provider.configured).length;

  return {
    project: LUNA_IDENTITY.name,
    mission: extractMission(lunaContextMd) || LUNA_IDENTITY.mission,
    currentMvp: extractCurrentMvp(lunaContextMd),
    architecturalState: projectContext.state,
    organismState: `${providersConfigured}/${providers.length} providers configurados; ${projectContext.cognitiveIndexRefs.length} arquivo(s) do Índice Cognitivo encontrados`,
    cognitiveIndex: projectContext.cognitiveIndexRefs,
    checkpoints,
    inferences: extractListItems(inferencesSection),
    // luna_context/ROADMAP.md na raiz é um scaffold vazio (0 bytes) — o
    // roadmap real e mantido é forge/ROADMAP.md; se algum dia ficar vazio
    // também, cai para o (também real, mas hoje vazio) projectContext.roadmap
    // em vez de inventar conteúdo.
    roadmap: roadmapHeadings.length > 0 ? roadmapHeadings : projectContext.roadmap,
    activeRepositories: extractRepoSlugs(adr004),
    activeSystems: extractBoldedNames(organsSection),
    providers,
  };
}
