import type { CapabilityManifest } from "../contracts";

export const railwayListServicesManifest: CapabilityManifest = {
  id: "railway.list_services",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "List services in a Railway project.",
};
