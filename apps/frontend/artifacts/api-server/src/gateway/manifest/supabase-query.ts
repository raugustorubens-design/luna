import type { CapabilityManifest } from "../contracts";

export const supabaseQueryManifest: CapabilityManifest = {
  id: "supabase.query",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Query rows from a Supabase table.",
};
