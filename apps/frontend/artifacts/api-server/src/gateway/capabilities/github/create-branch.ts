import type {
  CapabilityRequest,
  CapabilityResult,
  GatewayExecutionContext,
  GithubAdapter,
  GithubCreateBranchInput,
  GithubCreateBranchOutput,
  RollbackableCapability,
} from "../../contracts";
import { githubCreateBranchManifest } from "../../manifest/github-create-branch";

export class GithubCreateBranchCapability implements RollbackableCapability<GithubCreateBranchInput, GithubCreateBranchOutput> {
  readonly manifest = githubCreateBranchManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(request: CapabilityRequest<GithubCreateBranchInput>): Promise<CapabilityResult<GithubCreateBranchOutput>> {
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

      const output = await this.github.createBranch(request.input);

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
            metadata: { sha: output.sha, branch: output.branch },
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

  async rollback(output: GithubCreateBranchOutput, _context?: GatewayExecutionContext): Promise<CapabilityResult<GithubCreateBranchOutput>> {
    const startedAt = Date.now();

    try {
      await this.github.deleteBranch({ owner: output.owner, repo: output.repo, branch: output.branch });

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
            metadata: { deletedBranch: output.branch },
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
