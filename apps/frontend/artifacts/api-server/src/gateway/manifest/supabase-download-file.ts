import type { CapabilityManifest } from "../contracts";

export const supabaseDownloadFileManifest: CapabilityManifest = {
  id: "supabase.download_file",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: false,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Download a file from Supabase Storage.",
};
