import type { Capability, CapabilityRequest, CapabilityResult, RailwayAdapter, RailwayLogsInput, RailwayLogsOutput } from "../../contracts";
import { railwayLogsManifest } from "../../manifest/railway-logs";
import { runCapabilityLifecycle } from "../lifecycle";

export class RailwayLogsCapability implements Capability<RailwayLogsInput, RailwayLogsOutput> {
  readonly manifest = railwayLogsManifest;

  constructor(private readonly railway: RailwayAdapter) {}

  execute(request: CapabilityRequest<RailwayLogsInput>): Promise<CapabilityResult<RailwayLogsOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.railway.logs(input);
      return {
        output,
        evidence: [
          {
            source: "railway",
            reference: output.deploymentId,
            observedAt: new Date().toISOString(),
            metadata: { entries: output.logs.length },
          },
        ],
      };
    });
  }
}
