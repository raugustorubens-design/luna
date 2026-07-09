import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Walks up from `startDir` until it finds the repo's `.git` directory and
 * returns that directory. A fixed relative depth (e.g. `../../../../.env`)
 * breaks the moment esbuild bundles this code into `dist/index.mjs` — the
 * bundled file sits one directory shallower than the original `src/**`
 * source, and `pnpm test` runs with yet another cwd. Searching for `.git`
 * gives a path that is correct in every one of those contexts.
 */
export function findRepoRoot(startDir: string): string {
  let dir = startDir;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (existsSync(path.join(dir, ".git"))) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      // Reached the filesystem root without finding `.git` — fall back to
      // the original start directory rather than looping forever.
      return startDir;
    }

    dir = parent;
  }
}
