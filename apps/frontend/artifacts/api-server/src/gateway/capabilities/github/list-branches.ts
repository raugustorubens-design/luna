import type {
  Capability,
  CapabilityRequest,
  CapabilityResult,
  GithubAdapter,
  GithubListBranchesInput,
  GithubListBranchesOutput,
} from "../../contracts";
import { githubListBranchesManifest } from "../../manifest/github-list-branches";

export class GithubListBranchesCapability implements Capability<GithubListBranchesInput, GithubListBranchesOutput> {
  readonly manifest = githubListBranchesManifest;

  constructor(private readonly github: GithubAdapter) {}

  async execute(request: CapabilityRequest<GithubListBranchesInput>): Promise<CapabilityResult<GithubListBranchesOutput>> {
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

      const output = await this.github.listBranches(request.input);

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
            reference: `https://github.com/${output.owner}/${output.repo}/branches`,
            observedAt: new Date().toISOString(),
            metadata: { count: output.branches.length },
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
