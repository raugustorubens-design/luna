import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  ReporterAdapter,
  ReporterRepositoryMapInput,
  ReporterRepositoryMapOutput,
} from "../../contracts";
import { reporterRepositoryMapManifest } from "../../manifest/reporter-repository-map";
import { runCapabilityLifecycle } from "../lifecycle";

export class ReporterRepositoryMapCapability implements Capability<ReporterRepositoryMapInput, ReporterRepositoryMapOutput> {
  readonly manifest = reporterRepositoryMapManifest;

  constructor(private readonly reporter: ReporterAdapter) {}

  execute(request: CapabilityRequest<ReporterRepositoryMapInput>): Promise<CapabilityResult<ReporterRepositoryMapOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.reporter.repositoryMap(input);
      return {
        output,
        evidence: [
          {
            source: "reporter",
            reference: ".luna/runtime/repository_map.json",
            observedAt: new Date().toISOString(),
            metadata: { present: output.repositoryMap !== null },
          },
        ],
      };
    });
  }
}
