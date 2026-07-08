import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// Resolved relative to this file rather than process.cwd() so it finds the
// repo-root .env regardless of the invoking working directory (e.g. `pnpm
// dev` runs with cwd at this package's root, while the test runner's cwd is
// the workspace root two levels up).
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..", "..", ".env"),
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
