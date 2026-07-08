import type { ContextSyncCheckpoint, ContextSyncPort } from "../contracts";

export class NoopContextSync implements ContextSyncPort {
  readonly checkpoints: ContextSyncCheckpoint[] = [];

  async syncCheckpoint(checkpoint: ContextSyncCheckpoint): Promise<void> {
    this.checkpoints.push(checkpoint);
  }
}
