import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  SupabaseAdapter,
  SupabaseDownloadFileInput,
  SupabaseDownloadFileOutput,
} from "../../contracts";
import { supabaseDownloadFileManifest } from "../../manifest/supabase-download-file";
import { runCapabilityLifecycle } from "../lifecycle";

export class SupabaseDownloadFileCapability implements Capability<SupabaseDownloadFileInput, SupabaseDownloadFileOutput> {
  readonly manifest = supabaseDownloadFileManifest;

  constructor(private readonly supabase: SupabaseAdapter) {}

  execute(request: CapabilityRequest<SupabaseDownloadFileInput>): Promise<CapabilityResult<SupabaseDownloadFileOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.supabase.downloadFile(input);
      return {
        output,
        evidence: [
          {
            source: "supabase",
            reference: `${output.bucket}/${output.path}`,
            observedAt: new Date().toISOString(),
            metadata: { size: output.size, contentType: output.contentType },
          },
        ],
      };
    });
  }
}
