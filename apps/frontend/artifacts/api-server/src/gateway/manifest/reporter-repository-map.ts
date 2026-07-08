import type { CapabilityManifest } from "../contracts";

export const reporterRepositoryMapManifest: CapabilityManifest = {
  id: "reporter.repository_map",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Observe the current organism repository map.",
};
