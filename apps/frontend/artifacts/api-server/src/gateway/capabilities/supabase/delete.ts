import type { Capability, CapabilityRequest, CapabilityResult, SupabaseAdapter, SupabaseDeleteInput, SupabaseDeleteOutput } from "../../contracts";
import { supabaseDeleteManifest } from "../../manifest/supabase-delete";
import { runCapabilityLifecycle } from "../lifecycle";

export class SupabaseDeleteCapability implements Capability<SupabaseDeleteInput, SupabaseDeleteOutput> {
  readonly manifest = supabaseDeleteManifest;

  constructor(private readonly supabase: SupabaseAdapter) {}

  execute(request: CapabilityRequest<SupabaseDeleteInput>): Promise<CapabilityResult<SupabaseDeleteOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.supabase.delete(input);
      return {
        output,
        evidence: [
          {
            source: "supabase",
            reference: output.table,
            observedAt: new Date().toISOString(),
            metadata: { deleted: output.count },
          },
        ],
      };
    });
  }
}
