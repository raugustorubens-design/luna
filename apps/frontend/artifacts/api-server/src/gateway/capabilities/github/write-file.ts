import type {
  CapabilityRequest,
  CapabilityResult,
  GatewayExecutionContext,
  GithubAdapter,
  GithubWriteFileInput,
  GithubWriteFileOutput,
  RollbackableCapability,
} from "../../contracts";
import { githubWriteFileManifest } from "../../manifest/github-write-file";

export class GithubWriteFileCapability implements RollbackableCapability<GithubWriteFileInput, GithubWriteFileOutput> {
  readonly manifest = githubWriteFileManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(request: CapabilityRequest<GithubWriteFileInput>): Promise<CapabilityResult<GithubWriteFileOutput>> {
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

      const output = await this.github.writeFile(request.input);

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
            metadata: { sha: output.sha, previousSha: output.previousSha, branch: output.branch, commitSha: output.commitSha },
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

  async rollback(output: GithubWriteFileOutput, _context?: GatewayExecutionContext): Promise<CapabilityResult<GithubWriteFileOutput>> {
    const startedAt = Date.now();

    try {
      if (output.previousContent === null) {
        await this.github.deleteFile({
          owner: output.owner,
          repo: output.repo,
          path: output.path,
          branch: output.branch,
          sha: output.sha,
          message: `luna-gateway: rollback github.write_file for ${output.path}`,
        });
      } else {
        await this.github.writeFile({
          owner: output.owner,
          repo: output.repo,
          path: output.path,
          branch: output.branch,
          sha: output.sha,
          content: output.previousContent,
          message: `luna-gateway: rollback github.write_file for ${output.path}`,
        });
      }

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
            metadata: { restored: output.previousContent !== null, path: output.path, branch: output.branch },
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
