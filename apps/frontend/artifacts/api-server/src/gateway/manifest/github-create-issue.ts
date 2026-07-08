import type { CapabilityManifest } from "../contracts";

export const githubCreateIssueManifest: CapabilityManifest = {
  id: "github.create_issue",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: true,
  description: "Create an issue in a GitHub repository.",
};
