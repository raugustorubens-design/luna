import type { Capability, CapabilityRequest, CapabilityResult, SupabaseAdapter, SupabaseQueryInput, SupabaseQueryOutput } from "../../contracts";
import { supabaseQueryManifest } from "../../manifest/supabase-query";
import { runCapabilityLifecycle } from "../lifecycle";

export class SupabaseQueryCapability implements Capability<SupabaseQueryInput, SupabaseQueryOutput> {
  readonly manifest = supabaseQueryManifest;

  constructor(private readonly supabase: SupabaseAdapter) {}

  execute(request: CapabilityRequest<SupabaseQueryInput>): Promise<CapabilityResult<SupabaseQueryOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.supabase.query(input);
      return {
        output,
        evidence: [
          {
            source: "supabase",
            reference: output.table,
            observedAt: new Date().toISOString(),
            metadata: { rows: output.rows.length, count: output.count },
          },
        ],
      };
    });
  }
}
