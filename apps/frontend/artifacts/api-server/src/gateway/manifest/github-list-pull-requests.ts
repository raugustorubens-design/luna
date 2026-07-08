import type { CapabilityManifest } from "../contracts";

export const githubListPullRequestsManifest: CapabilityManifest = {
  id: "github.list_pull_requests",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "List pull requests in a GitHub repository.",
};
