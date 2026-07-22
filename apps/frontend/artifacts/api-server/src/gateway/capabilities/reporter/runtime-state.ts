import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  ReporterAdapter,
  ReporterRuntimeStateInput,
  ReporterRuntimeStateOutput,
} from "../../contracts";
import { reporterRuntimeStateManifest } from "../../manifest/reporter-runtime-state";
import { runCapabilityLifecycle } from "../lifecycle";

export class ReporterRuntimeStateCapability implements Capability<ReporterRuntimeStateInput, ReporterRuntimeStateOutput> {
  readonly manifest = reporterRuntimeStateManifest;

  constructor(private readonly reporter: ReporterAdapter) {}

  execute(request: CapabilityRequest<ReporterRuntimeStateInput>): Promise<CapabilityResult<ReporterRuntimeStateOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.reporter.runtimeState(input);
      return {
        output,
        evidence: [
          {
            source: "reporter",
            reference: "runtime_state",
            observedAt: new Date().toISOString(),
            metadata: { pid: output.process.pid, uptimeSeconds: output.process.uptimeSeconds },
          },
        ],
      };
    });
  }
}
