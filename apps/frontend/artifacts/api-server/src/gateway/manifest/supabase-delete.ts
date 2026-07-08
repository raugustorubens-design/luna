import type { CapabilityManifest } from "../contracts";

export const supabaseDeleteManifest: CapabilityManifest = {
  id: "supabase.delete",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Delete rows from a Supabase table.",
};
