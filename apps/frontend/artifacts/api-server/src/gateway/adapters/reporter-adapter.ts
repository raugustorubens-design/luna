import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import type { CapabilityManifest, ContextSyncPort } from "../contracts";
import type {
  ReporterAdapter,
  ReporterArchitectureReportInput,
  ReporterArchitectureReportOutput,
  ReporterAuditRepositoryInput,
  ReporterAuditRepositoryOutput,
  ReporterCapabilityInventoryInput,
  ReporterCapabilityInventoryOutput,
  ReporterRepositoryMapInput,
  ReporterRepositoryMapOutput,
  ReporterRuntimeStateInput,
  ReporterRuntimeStateOutput,
  ReporterSnapshotInput,
  ReporterSnapshotOutput,
  RepositoryApplicationEntry,
} from "../contracts";
import { repoRoot } from "../../lib/repo-root";

const execFileAsync = promisify(execFile);

export interface CapabilityDiscovery {
  discover(): CapabilityManifest[];
}

async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function readGit(root: string): Promise<{ branch: string; headSha: string; clean: boolean }> {
  try {
    const [branch, headSha, status] = await Promise.all([
      execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root }),
      execFileAsync("git", ["rev-parse", "HEAD"], { cwd: root }),
      execFileAsync("git", ["status", "--porcelain"], { cwd: root }),
    ]);

    return {
      branch: branch.stdout.trim(),
      headSha: headSha.stdout.trim(),
      clean: status.stdout.trim().length === 0,
    };
  } catch {
    return { branch: "unknown", headSha: "unknown", clean: true };
  }
}

interface RepositoryMapFile {
  applications?: RepositoryApplicationEntry[];
}

export class ReporterFsAdapter implements ReporterAdapter {
  constructor(
    private readonly registry: CapabilityDiscovery,
    private readonly contextSync: ContextSyncPort,
    private readonly root = repoRoot,
  ) {}

  private runtimeStatePath(): string {
    return join(this.root, ".luna", "runtime", "runtime_state.json");
  }

  private repositoryMapPath(): string {
    return join(this.root, ".luna", "runtime", "repository_map.json");
  }

  async auditRepository(_input: ReporterAuditRepositoryInput): Promise<ReporterAuditRepositoryOutput> {
    const [repositoryMap, git] = await Promise.all([
      readJsonFile<RepositoryMapFile>(this.repositoryMapPath()),
      readGit(this.root),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      applications: repositoryMap?.applications ?? [],
      gitBranch: git.branch,
      gitHeadSha: git.headSha,
      gitStatusClean: git.clean,
    };
  }

  async snapshot(_input: ReporterSnapshotInput): Promise<ReporterSnapshotOutput> {
    const generatedAt = new Date().toISOString();
    const checkpointId = `checkpoint-${Date.now()}`;
    const cognitiveIndexRef = "luna_core";
    const checkpointRefs = ["luna_checkpoint.json", "docs/checkpoints/LUNA_LONGITUDINAL_MEMORY.md"];
    const runtimeMemoryRef = ".luna/runtime/runtime_state.json";
    const architecturalMemoryRefs = ["luna_context/ARCHITECTURE.md", "docs/architecture/luna-gateway.md"];

    await this.contextSync.syncCheckpoint({
      id: checkpointId,
      createdAt: generatedAt,
      cognitiveIndexRef,
      metadata: { checkpointRefs, runtimeMemoryRef, architecturalMemoryRefs },
    });

    return { generatedAt, checkpointId, cognitiveIndexRef, checkpointRefs, runtimeMemoryRef, architecturalMemoryRefs };
  }

  async runtimeState(_input: ReporterRuntimeStateInput): Promise<ReporterRuntimeStateOutput> {
    const runtimeState = await readJsonFile<Record<string, unknown>>(this.runtimeStatePath());

    return {
      generatedAt: new Date().toISOString(),
      process: {
        uptimeSeconds: process.uptime(),
        nodeVersion: process.version,
        memoryRssBytes: process.memoryUsage().rss,
        pid: process.pid,
      },
      runtimeState,
    };
  }

  async repositoryMap(_input: ReporterRepositoryMapInput): Promise<ReporterRepositoryMapOutput> {
    const repositoryMap = await readJsonFile<Record<string, unknown>>(this.repositoryMapPath());
    return { generatedAt: new Date().toISOString(), repositoryMap };
  }

  async capabilityInventory(_input: ReporterCapabilityInventoryInput): Promise<ReporterCapabilityInventoryOutput> {
    const capabilities = this.registry.discover();
    return { generatedAt: new Date().toISOString(), capabilityCount: capabilities.length, capabilities };
  }

  async architectureReport(_input: ReporterArchitectureReportInput): Promise<ReporterArchitectureReportOutput> {
    const capabilities = this.registry.discover();

    const layers = [
      { name: "Registry", description: "Capability discovery and execution routing.", locations: ["src/gateway/registry/capability-registry.ts"] },
      { name: "Contracts", description: "Shared request/result/manifest lifecycle types.", locations: ["src/gateway/contracts"] },
      { name: "Capabilities", description: "One class per capability id, delegating to an adapter.", locations: ["src/gateway/capabilities"] },
      { name: "Adapters", description: "Single boundary to each external technology (GitHub, Supabase, Railway) or observation surface (Reporter).", locations: ["src/gateway/adapters"] },
      { name: "Audit", description: "Records requested/executed/failed/dryrun/context.synced events.", locations: ["src/gateway/audit/audit.ts"] },
      { name: "Context Sync", description: "Persists checkpoints referencing Cognitive Index, Checkpoints, Runtime Memory, and Architectural Memory.", locations: ["src/gateway/context/context-sync.ts"] },
    ];

    return {
      generatedAt: new Date().toISOString(),
      layers,
      capabilityCount: capabilities.length,
      documentationRefs: ["docs/architecture/luna-gateway.md", "luna_context/ARCHITECTURE.md"],
    };
  }
}
