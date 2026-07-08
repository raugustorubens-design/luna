import type { CapabilityManifest } from "../contracts";

export const githubCommitManifest: CapabilityManifest = {
  id: "github.commit",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Create a multi-file commit in a GitHub repository via the Git Data API. Not rollback-able: git history is immutable, reverting requires a new commit.",
};
