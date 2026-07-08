import type { CapabilityManifest } from "../contracts";

export const railwayLogsManifest: CapabilityManifest = {
  id: "railway.logs",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Read deployment logs for a Railway service.",
};
