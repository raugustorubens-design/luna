import type { Capability, CapabilityRequest, CapabilityResult, FilesystemAdapter, FilesystemDiffInput, FilesystemDiffOutput } from "../../contracts";
import { filesystemDiffManifest } from "../../manifest/filesystem-diff";

export class FilesystemDiffCapability implements Capability<FilesystemDiffInput, FilesystemDiffOutput> {
  readonly manifest = filesystemDiffManifest;

  constructor(private readonly filesystem: FilesystemAdapter) {}

  async execute(request: CapabilityRequest<FilesystemDiffInput>): Promise<CapabilityResult<FilesystemDiffOutput>> {
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

      const output = await this.filesystem.diff(request.input);

      return {
        success: true,
        capability: this.manifest.id,
        version: this.manifest.version,
        duration: Date.now() - startedAt,
        status: this.manifest.status,
        dryRun,
        evidence: [
          {
            source: "filesystem",
            reference: `${output.basePath} vs ${output.comparePath}`,
            observedAt: new Date().toISOString(),
            metadata: { identical: output.identical },
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
