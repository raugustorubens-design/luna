import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");

const providerSource = read("src/luna/provider.ts");
assert.match(providerSource, /ProviderAdapter/, "ProviderRouter must depend on the adapter contract");
assert.doesNotMatch(providerSource, /fetch\(/, "ProviderRouter must not call provider APIs directly");
assert.doesNotMatch(providerSource, /https:\/\//, "ProviderRouter must not know provider endpoints");

const contractsSource = read("src/luna/contracts.ts");
assert.doesNotMatch(contractsSource, /Groq|supabase|drizzle|fetch\(/i, "Contracts must not depend on implementation details");

const contextSource = read("src/luna/context.ts");
assert.match(contextSource, /cognitiveIndexRefs/, "Context must expose future cognitive index sync seam");
assert.match(contextSource, /checkpointRefs/, "Context must expose future checkpoint sync seam");
assert.match(contextSource, /reconstructionRefs/, "Context must expose future reconstruction sync seam");

console.log("Architecture checks passed");
