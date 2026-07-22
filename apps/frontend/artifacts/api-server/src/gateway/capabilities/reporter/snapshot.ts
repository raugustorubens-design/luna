import type { Capability, CapabilityRequest, CapabilityResult, ReporterAdapter, ReporterSnapshotInput, ReporterSnapshotOutput } from "../../contracts";
import { reporterSnapshotManifest } from "../../manifest/reporter-snapshot";
import { runCapabilityLifecycle } from "../lifecycle";

export class ReporterSnapshotCapability implements Capability<ReporterSnapshotInput, ReporterSnapshotOutput> {
  readonly manifest = reporterSnapshotManifest;

  constructor(private readonly reporter: ReporterAdapter) {}

  execute(request: CapabilityRequest<ReporterSnapshotInput>): Promise<CapabilityResult<ReporterSnapshotOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.reporter.snapshot(input);
      return {
        output,
        evidence: [
          {
            source: "reporter",
            reference: output.checkpointId,
            observedAt: new Date().toISOString(),
            metadata: { cognitiveIndexRef: output.cognitiveIndexRef },
          },
        ],
      };
    });
  }
}
