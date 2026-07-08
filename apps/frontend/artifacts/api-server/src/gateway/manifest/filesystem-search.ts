import type { CapabilityManifest } from "../contracts";

export const filesystemSearchManifest: CapabilityManifest = {
  id: "filesystem.search",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Search file contents by pattern under the filesystem adapter root.",
};
