import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  GithubAdapter,
  GithubListPullRequestsInput,
  GithubListPullRequestsOutput,
} from "../../contracts";
import { githubListPullRequestsManifest } from "../../manifest/github-list-pull-requests";

export class GithubListPullRequestsCapability implements Capability<GithubListPullRequestsInput, GithubListPullRequestsOutput> {
  readonly manifest = githubListPullRequestsManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(request: CapabilityRequest<GithubListPullRequestsInput>): Promise<CapabilityResult<GithubListPullRequestsOutput>> {
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

      const output = await this.github.listPullRequests(request.input);

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
            reference: `https://github.com/${output.owner}/${output.repo}/pulls`,
            observedAt: new Date().toISOString(),
            metadata: { count: output.pullRequests.length },
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
