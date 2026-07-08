import type { CapabilityManifest } from "../contracts";

export const filesystemListManifest: CapabilityManifest = {
  id: "filesystem.list",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "List directory entries under the filesystem adapter root.",
};
