import type { Capability, CapabilityRequest, CapabilityResult, FilesystemAdapter, FilesystemReadInput, FilesystemReadOutput } from "../../contracts";
import { filesystemReadManifest } from "../../manifest/filesystem-read";

export class FilesystemReadCapability implements Capability<FilesystemReadInput, FilesystemReadOutput> {
  readonly manifest = filesystemReadManifest;

  constructor(private readonly filesystem: FilesystemAdapter) {}

  async execute(request: CapabilityRequest<FilesystemReadInput>): Promise<CapabilityResult<FilesystemReadOutput>> {
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

      const output = await this.filesystem.read(request.input);

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
            reference: output.path,
            observedAt: new Date().toISOString(),
            metadata: { size: output.size, encoding: output.encoding },
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
