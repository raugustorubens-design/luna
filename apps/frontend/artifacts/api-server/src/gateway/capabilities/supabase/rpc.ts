import type { Capability, CapabilityRequest, CapabilityResult, SupabaseAdapter, SupabaseRpcInput, SupabaseRpcOutput } from "../../contracts";
import { supabaseRpcManifest } from "../../manifest/supabase-rpc";
import { runCapabilityLifecycle } from "../lifecycle";

export class SupabaseRpcCapability implements Capability<SupabaseRpcInput, SupabaseRpcOutput> {
  readonly manifest = supabaseRpcManifest;

  constructor(private readonly supabase: SupabaseAdapter) {}

  execute(request: CapabilityRequest<SupabaseRpcInput>): Promise<CapabilityResult<SupabaseRpcOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.supabase.rpc(input);
      return {
        output,
        evidence: [
          {
            source: "supabase",
            reference: output.fn,
            observedAt: new Date().toISOString(),
          },
        ],
      };
    });
  }
}
