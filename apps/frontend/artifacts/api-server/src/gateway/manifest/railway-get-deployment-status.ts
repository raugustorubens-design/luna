import type { CapabilityManifest } from "../contracts";

export const railwayGetDeploymentStatusManifest: CapabilityManifest = {
  id: "railway.get_deployment_status",
  version: 1,
  owner: "gateway",
  status: "disabled",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description:
    "Prepared contract for reading a Railway service's deployment status. Disabled: no RAILWAY_TOKEN or adapter implementation exists yet.",
};
