import type { CapabilityManifest } from "../contracts";

export const githubCompareCommitsManifest: CapabilityManifest = {
  id: "github.compare_commits",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Compare two refs (commits, branches, or tags) in a GitHub repository.",
};
