import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { findRepoRoot } from "./repo-root";

// Resolved by walking up to the repo's `.git` — a fixed relative depth
// breaks once this file is bundled by esbuild into dist/index.mjs (one
// directory shallower than src/lib) or run under `pnpm test` (different cwd).
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(findRepoRoot(MODULE_DIR), ".env"),
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!supabaseKey) {
  throw new Error("SUPABASE_KEY environment variable is required");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
