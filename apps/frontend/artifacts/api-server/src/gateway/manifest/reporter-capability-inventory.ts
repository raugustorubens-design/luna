import type { CapabilityManifest } from "../contracts";

export const reporterCapabilityInventoryManifest: CapabilityManifest = {
  id: "reporter.capability_inventory",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Observe the set of capabilities currently registered in the gateway.",
};
