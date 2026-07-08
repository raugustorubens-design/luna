import type { CapabilityManifest } from "../contracts";

export const githubListBranchesManifest: CapabilityManifest = {
  id: "github.list_branches",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "List branches in a GitHub repository.",
};
