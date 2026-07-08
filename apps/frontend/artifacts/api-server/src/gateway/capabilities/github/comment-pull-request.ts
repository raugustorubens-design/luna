import type {
  CapabilityRequest,
  CapabilityResult,
  GatewayExecutionContext,
  GithubAdapter,
  GithubCommentPullRequestInput,
  GithubCommentPullRequestOutput,
  RollbackableCapability,
} from "../../contracts";
import { githubCommentPullRequestManifest } from "../../manifest/github-comment-pull-request";

export class GithubCommentPullRequestCapability
  implements RollbackableCapability<GithubCommentPullRequestInput, GithubCommentPullRequestOutput>
{
  readonly manifest = githubCommentPullRequestManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(
    request: CapabilityRequest<GithubCommentPullRequestInput>,
  ): Promise<CapabilityResult<GithubCommentPullRequestOutput>> {
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

      const output = await this.github.commentPullRequest(request.input);

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
            metadata: { commentId: output.commentId, number: output.number },
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
    output: GithubCommentPullRequestOutput,
    _context?: GatewayExecutionContext,
  ): Promise<CapabilityResult<GithubCommentPullRequestOutput>> {
    const startedAt = Date.now();

    try {
      await this.github.deleteComment({ owner: output.owner, repo: output.repo, commentId: output.commentId });

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
            metadata: { deletedCommentId: output.commentId },
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
