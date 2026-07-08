import type { Capability, CapabilityRequest, CapabilityResult, SupabaseAdapter, SupabaseUpdateInput, SupabaseUpdateOutput } from "../../contracts";
import { supabaseUpdateManifest } from "../../manifest/supabase-update";
import { runCapabilityLifecycle } from "../lifecycle";

export class SupabaseUpdateCapability implements Capability<SupabaseUpdateInput, SupabaseUpdateOutput> {
  readonly manifest = supabaseUpdateManifest;

  constructor(private readonly supabase: SupabaseAdapter) {}

  execute(request: CapabilityRequest<SupabaseUpdateInput>): Promise<CapabilityResult<SupabaseUpdateOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.supabase.update(input);
      return {
        output,
        evidence: [
          {
            source: "supabase",
            reference: output.table,
            observedAt: new Date().toISOString(),
            metadata: { updated: output.count },
          },
        ],
      };
    });
  }
}
