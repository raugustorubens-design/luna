import type { CapabilityManifest } from "../contracts";

export const supabaseUpdateManifest: CapabilityManifest = {
  id: "supabase.update",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Update rows in a Supabase table.",
};
