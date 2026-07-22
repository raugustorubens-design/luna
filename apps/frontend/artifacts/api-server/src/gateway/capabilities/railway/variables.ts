import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  RailwayAdapter,
  RailwayVariablesInput,
  RailwayVariablesOutput,
} from "../../contracts";
import { railwayVariablesManifest } from "../../manifest/railway-variables";
import { runCapabilityLifecycle } from "../lifecycle";

export class RailwayVariablesCapability implements Capability<RailwayVariablesInput, RailwayVariablesOutput> {
  readonly manifest = railwayVariablesManifest;

  constructor(private readonly railway: RailwayAdapter) {}

  execute(request: CapabilityRequest<RailwayVariablesInput>): Promise<CapabilityResult<RailwayVariablesOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.railway.variables(input);
      return {
        output,
        evidence: [
          {
            source: "railway",
            reference: output.serviceId,
            observedAt: new Date().toISOString(),
            metadata: { variableCount: Object.keys(output.variables).length },
          },
        ],
      };
    });
  }
}
