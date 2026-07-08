import type { CapabilityManifest } from "../contracts";

export const filesystemDiffManifest: CapabilityManifest = {
  id: "filesystem.diff",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Compare two files under the filesystem adapter root and return a unified diff.",
};
