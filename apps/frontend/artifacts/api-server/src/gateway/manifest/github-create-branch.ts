import type { CapabilityManifest } from "../contracts";

export const githubCreateBranchManifest: CapabilityManifest = {
  id: "github.create_branch",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: true,
  description: "Create a branch in a GitHub repository from a base ref.",
};
