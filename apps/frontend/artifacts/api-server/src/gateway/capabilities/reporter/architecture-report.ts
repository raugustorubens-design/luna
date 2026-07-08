import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  ReporterAdapter,
  ReporterArchitectureReportInput,
  ReporterArchitectureReportOutput,
} from "../../contracts";
import { reporterArchitectureReportManifest } from "../../manifest/reporter-architecture-report";
import { runCapabilityLifecycle } from "../lifecycle";

export class ReporterArchitectureReportCapability implements Capability<ReporterArchitectureReportInput, ReporterArchitectureReportOutput> {
  readonly manifest = reporterArchitectureReportManifest;

  constructor(private readonly reporter: ReporterAdapter) {}

  execute(request: CapabilityRequest<ReporterArchitectureReportInput>): Promise<CapabilityResult<ReporterArchitectureReportOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.reporter.architectureReport(input);
      return {
        output,
        evidence: [
          {
            source: "reporter",
            reference: "architecture_report",
            observedAt: new Date().toISOString(),
            metadata: { layers: output.layers.length, capabilityCount: output.capabilityCount },
          },
        ],
      };
    });
  }
}
