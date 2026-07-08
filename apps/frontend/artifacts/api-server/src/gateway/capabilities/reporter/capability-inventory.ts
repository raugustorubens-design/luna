import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  ReporterAdapter,
  ReporterCapabilityInventoryInput,
  ReporterCapabilityInventoryOutput,
} from "../../contracts";
import { reporterCapabilityInventoryManifest } from "../../manifest/reporter-capability-inventory";
import { runCapabilityLifecycle } from "../lifecycle";

export class ReporterCapabilityInventoryCapability implements Capability<ReporterCapabilityInventoryInput, ReporterCapabilityInventoryOutput> {
  readonly manifest = reporterCapabilityInventoryManifest;

  constructor(private readonly reporter: ReporterAdapter) {}

  execute(request: CapabilityRequest<ReporterCapabilityInventoryInput>): Promise<CapabilityResult<ReporterCapabilityInventoryOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.reporter.capabilityInventory(input);
      return {
        output,
        evidence: [
          {
            source: "reporter",
            reference: "capability_registry",
            observedAt: new Date().toISOString(),
            metadata: { capabilityCount: output.capabilityCount },
          },
        ],
      };
    });
  }
}
