import type { CapabilityManifest } from "../contracts";

export const reporterAuditRepositoryManifest: CapabilityManifest = {
  id: "reporter.audit_repository",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Observe repository structure, applications, and git status.",
};
