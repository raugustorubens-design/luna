import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  SupabaseAdapter,
  SupabaseUploadFileInput,
  SupabaseUploadFileOutput,
} from "../../contracts";
import { supabaseUploadFileManifest } from "../../manifest/supabase-upload-file";
import { runCapabilityLifecycle } from "../lifecycle";

export class SupabaseUploadFileCapability implements Capability<SupabaseUploadFileInput, SupabaseUploadFileOutput> {
  readonly manifest = supabaseUploadFileManifest;

  constructor(private readonly supabase: SupabaseAdapter) {}

  execute(request: CapabilityRequest<SupabaseUploadFileInput>): Promise<CapabilityResult<SupabaseUploadFileOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.supabase.uploadFile(input);
      return {
        output,
        evidence: [
          {
            source: "supabase",
            reference: output.fullPath,
            observedAt: new Date().toISOString(),
            metadata: { bucket: output.bucket },
          },
        ],
      };
    });
  }
}
