import type {
  CapabilityRequest,
  CapabilityResult,
  GatewayExecutionContext,
  GithubAdapter,
  GithubCreatePullRequestInput,
  GithubCreatePullRequestOutput,
  RollbackableCapability,
} from "../../contracts";
import { githubCreatePullRequestManifest } from "../../manifest/github-create-pull-request";

export class GithubCreatePullRequestCapability
  implements RollbackableCapability<GithubCreatePullRequestInput, GithubCreatePullRequestOutput>
{
  readonly manifest = githubCreatePullRequestManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(request: CapabilityRequest<GithubCreatePullRequestInput>): Promise<CapabilityResult<GithubCreatePullRequestOutput>> {
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

      const output = await this.github.createPullRequest(request.input);

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
            metadata: { number: output.number, state: output.state },
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

  async rollback(
    output: GithubCreatePullRequestOutput,
    _context?: GatewayExecutionContext,
  ): Promise<CapabilityResult<GithubCreatePullRequestOutput>> {
    const startedAt = Date.now();

    try {
      await this.github.closePullRequest({ owner: output.owner, repo: output.repo, number: output.number });

      return {
        success: true,
        capability: this.manifest.id,
        version: this.manifest.version,
        duration: Date.now() - startedAt,
        status: this.manifest.status,
        dryRun: false,
        evidence: [
          {
            source: "github",
            reference: output.htmlUrl,
            observedAt: new Date().toISOString(),
            metadata: { closedNumber: output.number },
          },
        ],
        output: null,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        capability: this.manifest.id,
        version: this.manifest.version,
        duration: Date.now() - startedAt,
        status: "degraded",
        dryRun: false,
        evidence: [],
        output: null,
        error: {
          code: error instanceof Error && "code" in error ? String(error.code) : "CAPABILITY_ROLLBACK_FAILED",
          message: error instanceof Error ? error.message : "Unknown capability rollback error",
          details: error instanceof Error && "details" in error ? error.details : undefined,
        },
      };
    }
  }
}
