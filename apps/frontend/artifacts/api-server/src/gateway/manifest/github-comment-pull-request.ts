import type { CapabilityManifest } from "../contracts";

export const githubCommentPullRequestManifest: CapabilityManifest = {
  id: "github.comment_pull_request",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: true,
  description: "Post a comment on a GitHub pull request.",
};
