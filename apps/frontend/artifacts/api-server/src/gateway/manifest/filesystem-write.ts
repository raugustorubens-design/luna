import type { CapabilityManifest } from "../contracts";

export const filesystemWriteManifest: CapabilityManifest = {
  id: "filesystem.write",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: true,
  description: "Create or overwrite a file under the filesystem adapter root.",
};
