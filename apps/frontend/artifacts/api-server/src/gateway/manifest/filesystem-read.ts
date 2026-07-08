import type { CapabilityManifest } from "../contracts";

export const filesystemReadManifest: CapabilityManifest = {
  id: "filesystem.read",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Read a file from the filesystem adapter root.",
};
