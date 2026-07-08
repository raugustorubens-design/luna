import type { CapabilityManifest } from "../contracts";

export const githubReadFileManifest: CapabilityManifest = {
  id: "github.read_file",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Read file from GitHub repository.",
};
