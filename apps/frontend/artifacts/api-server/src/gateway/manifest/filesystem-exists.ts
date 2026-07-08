import type { CapabilityManifest } from "../contracts";

export const filesystemExistsManifest: CapabilityManifest = {
  id: "filesystem.exists",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Check whether a path exists under the filesystem adapter root.",
};
