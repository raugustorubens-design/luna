import type { Capability, CapabilityRequest, CapabilityResult, GithubAdapter, GithubListCommitsInput, GithubListCommitsOutput } from "../../contracts";
import { githubListCommitsManifest } from "../../manifest/github-list-commits";

export class GithubListCommitsCapability implements Capability<GithubListCommitsInput, GithubListCommitsOutput> {
  readonly manifest = githubListCommitsManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(request: CapabilityRequest<GithubListCommitsInput>): Promise<CapabilityResult<GithubListCommitsOutput>> {
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

      const output = await this.github.listCommits(request.input);

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
            reference: `https://github.com/${output.owner}/${output.repo}/commits`,
            observedAt: new Date().toISOString(),
            metadata: { count: output.commits.length },
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
