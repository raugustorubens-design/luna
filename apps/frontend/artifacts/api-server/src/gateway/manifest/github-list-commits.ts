import type { CapabilityManifest } from "../contracts";

export const githubListCommitsManifest: CapabilityManifest = {
  id: "github.list_commits",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "List commits in a GitHub repository.",
};
