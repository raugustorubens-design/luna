import type { CapabilityManifest } from "../contracts";

export const reporterSnapshotManifest: CapabilityManifest = {
  id: "reporter.snapshot",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Synchronize a checkpoint referencing Cognitive Index, Checkpoints, Runtime Memory, and Architectural Memory.",
};
