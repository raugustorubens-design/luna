import type { CapabilityManifest } from "../contracts";

export const supabaseInsertManifest: CapabilityManifest = {
  id: "supabase.insert",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Insert rows into a Supabase table.",
};
