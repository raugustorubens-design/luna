import type { CapabilityManifest } from "../contracts";

export const githubWriteFileManifest: CapabilityManifest = {
  id: "github.write_file",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: true,
  description: "Create or update a file in a GitHub repository.",
};
