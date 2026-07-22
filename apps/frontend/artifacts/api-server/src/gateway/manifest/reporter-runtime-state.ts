import type { CapabilityManifest } from "../contracts";

export const reporterRuntimeStateManifest: CapabilityManifest = {
  id: "reporter.runtime_state",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Observe current runtime process state and persisted runtime memory.",
};
