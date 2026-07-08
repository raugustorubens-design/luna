import type {
  CapabilityRequest,
  CapabilityResult,
  FilesystemAdapter,
  FilesystemWriteInput,
  FilesystemWriteOutput,
  GatewayExecutionContext,
  RollbackableCapability,
} from "../../contracts";
import { filesystemWriteManifest } from "../../manifest/filesystem-write";

export class FilesystemWriteCapability implements RollbackableCapability<FilesystemWriteInput, FilesystemWriteOutput> {
  readonly manifest = filesystemWriteManifest;

  constructor(private readonly filesystem: FilesystemAdapter) {}

  async execute(request: CapabilityRequest<FilesystemWriteInput>): Promise<CapabilityResult<FilesystemWriteOutput>> {
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

      const output = await this.filesystem.write(request.input);

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
            metadata: { size: output.size, created: output.created },
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

  async rollback(output: FilesystemWriteOutput, _context?: GatewayExecutionContext): Promise<CapabilityResult<FilesystemWriteOutput>> {
    const startedAt = Date.now();

    try {
      if (output.created) {
        await this.filesystem.delete({ path: output.path });
      } else {
        await this.filesystem.write({ path: output.path, content: output.previousContent ?? "" });
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
            source: "filesystem",
            reference: output.path,
            observedAt: new Date().toISOString(),
            metadata: { restored: !output.created, deleted: output.created },
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
