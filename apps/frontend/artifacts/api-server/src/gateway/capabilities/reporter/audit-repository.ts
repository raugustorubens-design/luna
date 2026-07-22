import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  ReporterAdapter,
  ReporterAuditRepositoryInput,
  ReporterAuditRepositoryOutput,
} from "../../contracts";
import { reporterAuditRepositoryManifest } from "../../manifest/reporter-audit-repository";
import { runCapabilityLifecycle } from "../lifecycle";

export class ReporterAuditRepositoryCapability implements Capability<ReporterAuditRepositoryInput, ReporterAuditRepositoryOutput> {
  readonly manifest = reporterAuditRepositoryManifest;

  constructor(private readonly reporter: ReporterAdapter) {}

  execute(request: CapabilityRequest<ReporterAuditRepositoryInput>): Promise<CapabilityResult<ReporterAuditRepositoryOutput>> {
    return runCapabilityLifecycle(this.manifest, request, async (input) => {
      const output = await this.reporter.auditRepository(input);
      return {
        output,
        evidence: [
          {
            source: "reporter",
            reference: "repository_map",
            observedAt: new Date().toISOString(),
            metadata: { applications: output.applications.length, gitBranch: output.gitBranch },
          },
        ],
      };
    });
  }
}
