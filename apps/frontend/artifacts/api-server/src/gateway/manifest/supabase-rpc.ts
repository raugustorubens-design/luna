import type { CapabilityManifest } from "../contracts";

export const supabaseRpcManifest: CapabilityManifest = {
  id: "supabase.rpc",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Invoke a Supabase remote procedure.",
};
