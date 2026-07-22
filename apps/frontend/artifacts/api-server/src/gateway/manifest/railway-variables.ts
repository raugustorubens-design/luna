import type { CapabilityManifest } from "../contracts";

export const railwayVariablesManifest: CapabilityManifest = {
  id: "railway.variables",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Read environment variables for a Railway service.",
};
