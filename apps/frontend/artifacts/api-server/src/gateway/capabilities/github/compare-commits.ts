import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  GithubAdapter,
  GithubCompareCommitsInput,
  GithubCompareCommitsOutput,
} from "../../contracts";
import { githubCompareCommitsManifest } from "../../manifest/github-compare-commits";

export class GithubCompareCommitsCapability implements Capability<GithubCompareCommitsInput, GithubCompareCommitsOutput> {
  readonly manifest = githubCompareCommitsManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(request: CapabilityRequest<GithubCompareCommitsInput>): Promise<CapabilityResult<GithubCompareCommitsOutput>> {
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

      const output = await this.github.compareCommits(request.input);

      return {
        success: true,
        capability: this.manifest.id,
        version: this.manifest.version,
        duration: Date.now() - startedAt,
        status: this.manifest.status,
        dryRun,
        evidence: [
          {
            source: "github",
            reference: output.htmlUrl,
            observedAt: new Date().toISOString(),
            metadata: { status: output.status, aheadBy: output.aheadBy, behindBy: output.behindBy },
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
