import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ContextSyncCheckpoint, ContextSyncPort } from "../contracts";
import { repoRoot } from "../../lib/repo-root";

export class NoopContextSync implements ContextSyncPort {
  readonly checkpoints: ContextSyncCheckpoint[] = [];

  async syncCheckpoint(checkpoint: ContextSyncCheckpoint): Promise<void> {
    this.checkpoints.push(checkpoint);
  }
}

/**
 * Persists checkpoints to the existing .luna/runtime observability directory
 * so Cognitive Index, Checkpoints, Runtime Memory, and Architectural Memory
 * references stay longitudinally traceable. Uses only the ContextSyncPort /
 * ContextSyncCheckpoint contract - no new memory model or architecture.
 */
export class RepositoryContextSync implements ContextSyncPort {
  constructor(private readonly checkpointsFile = join(repoRoot, ".luna", "runtime", "context_sync_checkpoints.json")) {}

  async syncCheckpoint(checkpoint: ContextSyncCheckpoint): Promise<void> {
    const checkpoints = await this.readCheckpoints();
    checkpoints.push(checkpoint);
    await mkdir(dirname(this.checkpointsFile), { recursive: true });
    await writeFile(this.checkpointsFile, JSON.stringify(checkpoints, null, 2), "utf8");
  }

  private async readCheckpoints(): Promise<ContextSyncCheckpoint[]> {
    try {
      const raw = await readFile(this.checkpointsFile, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
