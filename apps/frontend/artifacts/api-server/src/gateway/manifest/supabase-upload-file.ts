import type { CapabilityManifest } from "../contracts";

export const supabaseUploadFileManifest: CapabilityManifest = {
  id: "supabase.upload_file",
  version: 1,
  owner: "gateway",
  status: "healthy",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description: "Upload a file to Supabase Storage.",
};
