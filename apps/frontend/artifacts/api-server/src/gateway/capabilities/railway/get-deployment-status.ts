import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  RailwayAdapter,
  RailwayGetDeploymentStatusInput,
  RailwayGetDeploymentStatusOutput,
} from "../../contracts";
import { railwayGetDeploymentStatusManifest } from "../../manifest/railway-get-deployment-status";

export class RailwayGetDeploymentStatusCapability
  implements Capability<RailwayGetDeploymentStatusInput, RailwayGetDeploymentStatusOutput>
{
  readonly manifest = railwayGetDeploymentStatusManifest;

  constructor(private readonly railway: RailwayAdapter) {}

  async execute(
    request: CapabilityRequest<RailwayGetDeploymentStatusInput>,
  ): Promise<CapabilityResult<RailwayGetDeploymentStatusOutput>> {
    const startedAt = Date.now();
    const dryRun = request.dryRun ?? false;

    try {
      if (dryRun) {
        return {
          success: true,
          capability: this.manifest.id,
          version: this.manifest.version,
          duration: Date.now() - startedAt,
          status: this.manifest.status,
          dryRun,
          evidence: [],
          output: null,
          error: null,
        };
      }

      const output = await this.railway.getDeploymentStatus(request.input);

      return {
        success: true,
        capability: this.manifest.id,
        version: this.manifest.version,
        duration: Date.now() - startedAt,
        status: this.manifest.status,
        dryRun,
        evidence: [
          {
            source: "railway",
            reference: output.serviceId,
            observedAt: new Date().toISOString(),
            metadata: { status: output.status },
          },
        ],
        output,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        capability: this.manifest.id,
        version: this.manifest.version,
        duration: Date.now() - startedAt,
        status: "degraded",
        dryRun,
        evidence: [],
        output: null,
        error: {
          code: error instanceof Error && "code" in error ? String(error.code) : "CAPABILITY_EXECUTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown capability execution error",
          details: error instanceof Error && "details" in error ? error.details : undefined,
        },
      };
    }
  }
}
