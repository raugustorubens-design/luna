import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  RailwayAdapter,
  RailwayListServicesInput,
  RailwayListServicesOutput,
} from "../../contracts";
import { railwayListServicesManifest } from "../../manifest/railway-list-services";
import { runCapabilityLifecycle } from "../lifecycle";

export class RailwayListServicesCapability implements Capability<RailwayListServicesInput, RailwayListServicesOutput> {
  readonly manifest = railwayListServicesManifest;

  constructor(private readonly railway: RailwayAdapter) {}

  execute(request: CapabilityRequest<RailwayListServicesInput>): Promise<CapabilityResult<RailwayListServicesOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.railway.listServices(input);
      return {
        output,
        evidence: [
          {
            source: "railway",
            reference: output.projectId,
            observedAt: new Date().toISOString(),
            metadata: { services: output.services.length },
          },
        ],
      };
    });
  }
}
