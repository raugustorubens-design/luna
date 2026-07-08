import type { Capability, CapabilityRequest, CapabilityResult, RailwayAdapter, RailwayDeployInput, RailwayDeployOutput } from "../../contracts";
import { railwayDeployManifest } from "../../manifest/railway-deploy";
import { runCapabilityLifecycle } from "../lifecycle";

export class RailwayDeployCapability implements Capability<RailwayDeployInput, RailwayDeployOutput> {
  readonly manifest = railwayDeployManifest;

  constructor(private readonly railway: RailwayAdapter) {}

  execute(request: CapabilityRequest<RailwayDeployInput>): Promise<CapabilityResult<RailwayDeployOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.railway.deploy(input);
      return {
        output,
        evidence: [
          {
            source: "railway",
            reference: output.deploymentId,
            observedAt: new Date().toISOString(),
            metadata: { serviceId: output.serviceId, status: output.status },
          },
        ],
      };
    });
  }
}
