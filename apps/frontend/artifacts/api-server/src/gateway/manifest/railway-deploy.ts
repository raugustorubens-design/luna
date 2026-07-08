import type { CapabilityManifest } from "../contracts";

export const railwayDeployManifest: CapabilityManifest = {
  id: "railway.deploy",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Trigger a deployment for a Railway service.",
};
