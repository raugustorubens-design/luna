import type { Capability, CapabilityRequest, CapabilityResult, RailwayAdapter, RailwayStatusInput, RailwayStatusOutput } from "../../contracts";
import { railwayStatusManifest } from "../../manifest/railway-status";
import { runCapabilityLifecycle } from "../lifecycle";

export class RailwayStatusCapability implements Capability<RailwayStatusInput, RailwayStatusOutput> {
  readonly manifest = railwayStatusManifest;

  constructor(private readonly railway: RailwayAdapter) {}

  execute(request: CapabilityRequest<RailwayStatusInput>): Promise<CapabilityResult<RailwayStatusOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.railway.status(input);
      return {
        output,
        evidence: [
          {
            source: "railway",
            reference: output.serviceId,
            observedAt: new Date().toISOString(),
            metadata: { status: output.status, latestDeploymentId: output.latestDeploymentId },
          },
        ],
      };
    });
  }
}
