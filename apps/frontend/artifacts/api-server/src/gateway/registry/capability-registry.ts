import type { Capability, CapabilityManifest, CapabilityRequest, CapabilityResult } from "../contracts";
import { GatewayError } from "../errors/gateway-error";
import { GatewayAuditor } from "../audit/audit";
import { AllowGatewayAuthorizationPolicy, type GatewayAuthorizationPolicy } from "../auth/auth";

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, Map<number, Capability>>();

  constructor(
    private readonly auditor = new GatewayAuditor(),
    private readonly authorization: GatewayAuthorizationPolicy = new AllowGatewayAuthorizationPolicy(),
  ) {}

  register(capability: Capability): void {
    const versions = this.capabilities.get(capability.manifest.id) ?? new Map<number, Capability>();

    if (versions.has(capability.manifest.version)) {
      throw new GatewayError("CAPABILITY_ALREADY_REGISTERED", "Capability version is already registered", capability.manifest);
    }

    versions.set(capability.manifest.version, capability);
    this.capabilities.set(capability.manifest.id, versions);
  }

  discover(): CapabilityManifest[] {
    return [...this.capabilities.values()]
      .flatMap((versions) => [...versions.values()].map((capability) => capability.manifest))
      .sort((a, b) => a.id.localeCompare(b.id) || a.version - b.version);
  }

  async execute(request: CapabilityRequest): Promise<CapabilityResult> {
    await this.authorization.authorize(request);
    await this.auditor.requested(request);

    const capability = this.resolve(request.capability, request.version);

    if (capability.manifest.status === "disabled") {
      const result: CapabilityResult = {
        success: false,
        capability: capability.manifest.id,
        version: capability.manifest.version,
        duration: 0,
        status: capability.manifest.status,
        dryRun: request.dryRun ?? false,
        evidence: [],
        output: null,
        error: { code: "CAPABILITY_DISABLED", message: "Capability is disabled" },
      };
      await this.auditor.completed(result, request.context);
      return result;
    }

    const result = await capability.execute({ ...request, version: capability.manifest.version });
    await this.auditor.completed(result, request.context);
    return result;
  }

  private resolve(id: string, version?: number): Capability {
    const versions = this.capabilities.get(id);
    if (!versions) throw new GatewayError("CAPABILITY_NOT_FOUND", "Capability is not registered", { id, version });

    if (version) {
      const capability = versions.get(version);
      if (!capability) throw new GatewayError("CAPABILITY_VERSION_NOT_FOUND", "Capability version is not registered", { id, version });
      return capability;
    }

    return [...versions.values()].sort((a, b) => b.manifest.version - a.manifest.version)[0]!;
  }
}
