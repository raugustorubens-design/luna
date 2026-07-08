import type { CapabilityManifest } from "../contracts";

export const reporterArchitectureReportManifest: CapabilityManifest = {
  id: "reporter.architecture_report",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Observe and summarize the gateway architecture layers and capability surface.",
};
