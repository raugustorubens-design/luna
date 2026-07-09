import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

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

// ---- Memory Engine: the only module allowed to own persistence ----
const memoryEngineSource = read("src/luna/memory-engine.ts");
assert.match(memoryEngineSource, /supabase/i, "Memory Engine must own persistence");

// ---- Gateway remains cognition-free ----
const gatewayIndexSource = read("src/gateway/index.ts");
assert.doesNotMatch(
  gatewayIndexSource,
  /\.\.\/luna\//,
  "Gateway must not depend on the cognitive core (luna/*)",
);

console.log("Architecture checks passed");
