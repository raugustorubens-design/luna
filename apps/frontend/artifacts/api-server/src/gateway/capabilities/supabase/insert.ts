import type { Capability, CapabilityRequest, CapabilityResult, SupabaseAdapter, SupabaseInsertInput, SupabaseInsertOutput } from "../../contracts";
import { supabaseInsertManifest } from "../../manifest/supabase-insert";
import { runCapabilityLifecycle } from "../lifecycle";

export class SupabaseInsertCapability implements Capability<SupabaseInsertInput, SupabaseInsertOutput> {
  readonly manifest = supabaseInsertManifest;

  constructor(private readonly supabase: SupabaseAdapter) {}

  execute(request: CapabilityRequest<SupabaseInsertInput>): Promise<CapabilityResult<SupabaseInsertOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.supabase.insert(input);
      return {
        output,
        evidence: [
          {
            source: "supabase",
            reference: output.table,
            observedAt: new Date().toISOString(),
            metadata: { inserted: output.count },
          },
        ],
      };
    });
  }
}
