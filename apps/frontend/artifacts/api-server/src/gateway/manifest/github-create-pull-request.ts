import type { CapabilityManifest } from "../contracts";

export const githubCreatePullRequestManifest: CapabilityManifest = {
  id: "github.create_pull_request",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: true,
  description: "Open a pull request in a GitHub repository.",
};
