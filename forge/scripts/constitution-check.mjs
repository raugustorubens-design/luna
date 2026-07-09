import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

function listFiles(relativeDir, extensions) {
  const absoluteDir = join(root, relativeDir);
  let entries;
  try {
    entries = readdirSync(absoluteDir);
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
    const entryRelativePath = join(relativeDir, entry);
    const absoluteEntryPath = join(root, entryRelativePath);
    if (statSync(absoluteEntryPath).isDirectory()) {
      files.push(...listFiles(entryRelativePath, extensions));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      files.push(entryRelativePath);
    }
  }
  return files;
}

const sourceFiles = [
  ...listFiles("apps/web/src", [".ts", ".tsx"]),
  ...listFiles("apps/server/src", [".ts", ".tsx"]),
];

assert.ok(sourceFiles.length > 0, "Forge source files must exist for this check to mean anything");

const DATABASE_TOKENS = /supabase|drizzle|@supabase\/supabase-js|['"]pg['"]/i;
const PROVIDER_TOKENS =
  /GroqAdapter|ChatGptAdapter|ClaudeAdapter|GrokAdapter|ManusAdapter|api\.groq\.com|api\.openai\.com|api\.anthropic\.com/;
const INTERNAL_ORGAN_IMPORT = /from\s+["']\.{2,}\/(.*\/)?apps\/frontend\/artifacts\/api-server\/src\//;

for (const relativePath of sourceFiles) {
  const source = readFileSync(join(root, relativePath), "utf8");

  assert.doesNotMatch(
    source,
    DATABASE_TOKENS,
    `Forge must never access a database directly (found in ${relativePath})`,
  );
  assert.doesNotMatch(
    source,
    PROVIDER_TOKENS,
    `Forge must never call an AI provider directly — route through /api/chat (found in ${relativePath})`,
  );
  assert.doesNotMatch(
    source,
    INTERNAL_ORGAN_IMPORT,
    `Forge must stay decoupled from internal organs — only HTTP contracts are allowed (found in ${relativePath})`,
  );
}

console.log(`Constitution checks passed (${sourceFiles.length} files scanned).`);
