import type { Capability, CapabilityRequest, CapabilityResult, FilesystemAdapter, FilesystemListInput, FilesystemListOutput } from "../../contracts";
import { filesystemListManifest } from "../../manifest/filesystem-list";

export class FilesystemListCapability implements Capability<FilesystemListInput, FilesystemListOutput> {
  readonly manifest = filesystemListManifest;

  constructor(private readonly filesystem: FilesystemAdapter) {}

  async execute(request: CapabilityRequest<FilesystemListInput>): Promise<CapabilityResult<FilesystemListOutput>> {
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

      const output = await this.filesystem.list(request.input);

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
            metadata: { count: output.entries.length },
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
