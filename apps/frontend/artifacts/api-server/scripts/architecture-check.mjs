import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

function listFilesRecursive(relativeDir) {
  const absoluteDir = join(root, relativeDir);
  const entries = readdirSync(absoluteDir);
  const files = [];

  for (const entry of entries) {
    const entryRelativePath = join(relativeDir, entry);
    const absoluteEntryPath = join(root, entryRelativePath);

    if (statSync(absoluteEntryPath).isDirectory()) {
      files.push(...listFilesRecursive(entryRelativePath));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      files.push(entryRelativePath);
    }
  }

  return files;
}

// ---- Provider Router: must route through the adapter contract only ----
const providerRouterSource = read("src/luna/provider-router.ts");
assert.match(providerRouterSource, /ProviderAdapter/, "Provider Router must depend on the adapter contract");
assert.doesNotMatch(providerRouterSource, /fetch\(/, "Provider Router must not call provider APIs directly");
assert.doesNotMatch(providerRouterSource, /https:\/\//, "Provider Router must not know provider endpoints");

// ---- Contracts: must stay implementation-agnostic ----
const contractsSource = read("src/luna/contracts.ts");
assert.doesNotMatch(contractsSource, /Groq|supabase|drizzle|fetch\(/i, "Contracts must not depend on implementation details");

// ---- Context Hub: must keep the cognitive-index/checkpoint/reconstruction seams ----
const contextHubSource = read("src/luna/context-hub.ts");
assert.match(contextHubSource, /cognitiveIndexRefs/, "Context Hub must expose the cognitive index sync seam");
assert.match(contextHubSource, /checkpointRefs/, "Context Hub must expose the checkpoint sync seam");
assert.match(contextHubSource, /reconstructionRefs/, "Context Hub must expose the reconstruction sync seam");

// ---- Context Hub (Forge MVP-02): reconstructs, never persists, never decides, never touches Supabase ----
assert.doesNotMatch(
  contextHubSource,
  /supabase|drizzle/i,
  "Context Hub must never access the database directly — reads go through Memory Engine's read functions",
);
assert.doesNotMatch(
  contextHubSource,
  /\bpersistMemory\s*\(|\bcheckpoint\s*\(\s*[{\w]|decideAndConsolidate/,
  "Context Hub must never persist or decide — it only reconstructs and reads (listCheckpoints, readProjectContext)",
);

// ---- Gateway must not expose Context Hub as a capability ----
// (Reason: the "Gateway remains cognition-free" rule below already forbids
// `../luna/` imports in gateway/index.ts — this assertion just names the
// specific consequence for Context Hub explicitly, so a future edit that
// tries to register a `context.*` capability fails loudly with a clear
// message instead of the generic cognition-free one.)
assert.doesNotMatch(
  read("src/gateway/index.ts"),
  /context-hub|buildOrganismContext/,
  "Context Hub must be exposed as a sibling route (see routes/context.ts), never as a Gateway capability",
);

// ---- Cognitive Engine: never persists, never calls a provider or DB directly ----
const cognitiveEngineSource = read("src/luna/cognitive-engine.ts");
assert.doesNotMatch(
  cognitiveEngineSource,
  /supabase|drizzle/i,
  "Cognitive Engine must never access the database directly",
);
assert.doesNotMatch(
  cognitiveEngineSource,
  /GroqAdapter|ChatGptAdapter|ClaudeAdapter|GrokAdapter|ManusAdapter|fetch\(/,
  "Cognitive Engine must never call a provider directly",
);
assert.match(
  cognitiveEngineSource,
  /decideAndConsolidate/,
  "Cognitive Engine must delegate consolidation to Hipocampo instead of persisting itself",
);

// ---- Hipocampo: decides, never persists directly ----
const hipocampoSource = read("src/luna/hipocampo.ts");
assert.doesNotMatch(
  hipocampoSource,
  /supabase|drizzle/i,
  "Hipocampo must never persist directly — persistence must go through the Memory Engine",
);
assert.match(
  hipocampoSource,
  /persistMemory/,
  "Hipocampo must delegate persistence to the Memory Engine",
);

// ---- Memory Engine (Guardian MVP-01): depends on the Guardian contract only ----
// The "Guardian" deferred in Forge MVP-02 now exists — official home is
// raugustorubens-design/luna-api, but no deploy happened this round ("Não
// realizar deploy. Preparar apenas a arquitetura."), so Memory Engine
// depends on `guardian-local-adapter.ts`, a transitional local
// implementation of the exact same `GuardianContract` that will be swapped
// for an HTTP client once the real Guardian is reachable. Memory Engine
// itself must no longer know it's Supabase underneath.
const memoryEngineSource = read("src/luna/memory-engine.ts");
assert.doesNotMatch(
  memoryEngineSource,
  /supabase|drizzle/i,
  "Memory Engine must never access the database directly anymore — it depends on the Guardian contract (guardian-local-adapter.ts)",
);
assert.match(
  memoryEngineSource,
  /GuardianContract|createLocalGuardianAdapter/,
  "Memory Engine must depend on the Guardian contract",
);

// ---- Guardian: only guardian-local-adapter.ts may know a storage driver ----
// (guardian-contract.ts is pure types; guardian-local-adapter.ts is the one
// permitted exception, exactly like adapters/supabase-adapter.js is the one
// exception in the official Guardian repo, luna-api.)
const lunaOrganFiles = listFilesRecursive("src/luna");
const driverImporters = lunaOrganFiles.filter(
  (path) => /supabase|drizzle/i.test(read(path)) && !path.endsWith("guardian-local-adapter.ts"),
);
assert.deepEqual(
  driverImporters,
  [],
  `Only guardian-local-adapter.ts may know a storage driver — found direct access in: ${driverImporters.join(", ")}`,
);

// ---- Reporter (internal audit log): never persists to the database ----
const reporterSource = read("src/luna/reporter.ts");
assert.doesNotMatch(
  reporterSource,
  /supabase|drizzle/i,
  "Reporter must never access the database directly",
);

// ---- Gateway remains cognition-free ----
const gatewayIndexSource = read("src/gateway/index.ts");
assert.doesNotMatch(
  gatewayIndexSource,
  /\.\.\/luna\//,
  "Gateway must not depend on the cognitive core (luna/*)",
);

// ---- Convergia: never persists directly, never calls a provider directly ----
// (Prompt 3: "O Convergia nunca poderá persistir diretamente" /
// "O Convergia nunca chamará providers diretamente" — checked across every
// file in the organ, not just one entry point, since the pipeline is
// deliberately split across many small modules.)
const convergiaFiles = listFilesRecursive("src/convergia");
assert.ok(convergiaFiles.length > 0, "Convergia organ must exist");

for (const relativePath of convergiaFiles) {
  const source = read(relativePath);

  assert.doesNotMatch(
    source,
    /supabase|drizzle/i,
    `Convergia must never access the database directly (found in ${relativePath})`,
  );
  assert.doesNotMatch(
    source,
    /GroqAdapter|ChatGptAdapter|ClaudeAdapter|GrokAdapter|ManusAdapter/,
    `Convergia must never call a provider adapter directly — route through the Provider Engine (found in ${relativePath})`,
  );
}

// Only the knowledge gate may reach into Hipocampo; every other Convergia
// module must go through it rather than calling Hipocampo ad hoc.
const hipocampoCallers = convergiaFiles.filter(
  (path) => /decideAndConsolidate/.test(read(path)) && !path.endsWith("knowledge-gate.ts"),
);
assert.deepEqual(
  hipocampoCallers,
  [],
  `Only knowledge-gate.ts may call Hipocampo directly — found direct calls in: ${hipocampoCallers.join(", ")}`,
);

// The knowledge gate itself must delegate to Hipocampo, not persist.
const knowledgeGateSource = read("src/convergia/knowledge/knowledge-gate.ts");
assert.match(
  knowledgeGateSource,
  /decideAndConsolidate/,
  "Convergia's knowledge gate must delegate consolidation to Hipocampo",
);

console.log("Architecture checks passed");
