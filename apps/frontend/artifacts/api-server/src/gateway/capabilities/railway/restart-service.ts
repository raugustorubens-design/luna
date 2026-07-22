import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  RailwayAdapter,
  RailwayRestartServiceInput,
  RailwayRestartServiceOutput,
} from "../../contracts";
import { railwayRestartServiceManifest } from "../../manifest/railway-restart-service";
import { runCapabilityLifecycle } from "../lifecycle";

export class RailwayRestartServiceCapability implements Capability<RailwayRestartServiceInput, RailwayRestartServiceOutput> {
  readonly manifest = railwayRestartServiceManifest;

  constructor(private readonly railway: RailwayAdapter) {}

  execute(request: CapabilityRequest<RailwayRestartServiceInput>): Promise<CapabilityResult<RailwayRestartServiceOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.railway.restartService(input);
      return {
        output,
        evidence: [
          {
            source: "railway",
            reference: output.serviceId,
            observedAt: new Date().toISOString(),
            metadata: { restarted: output.restarted },
          },
        ],
      };
    });
  }
}
