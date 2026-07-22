import type { CapabilityManifest } from "../contracts";

export const railwayRestartServiceManifest: CapabilityManifest = {
  id: "railway.restart_service",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Restart a running Railway service instance.",
};
