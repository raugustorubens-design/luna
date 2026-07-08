import type { CapabilityManifest } from "../contracts";

export const railwayStatusManifest: CapabilityManifest = {
  id: "railway.status",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Read the latest deployment status of a Railway service.",
};
