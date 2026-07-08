import type { CapabilityRequest, CapabilityResult, GatewayExecutionContext } from "../contracts";

export type GatewayAuditEventType =
  | "capability.requested"
  | "capability.executed"
  | "capability.failed"
  | "capability.dryrun"
  | "context.synced";

export interface GatewayAuditEvent {
  type: GatewayAuditEventType;
  capability?: string;
  version?: number;
  occurredAt: string;
  context?: GatewayExecutionContext;
  metadata?: Record<string, unknown>;
}

export interface AuditSink {
  record(event: GatewayAuditEvent): void | Promise<void>;
}

export class InMemoryAuditSink implements AuditSink {
  readonly events: GatewayAuditEvent[] = [];

  record(event: GatewayAuditEvent): void {
    this.events.push(event);
  }
}

export class GatewayAuditor {
  constructor(private readonly sink: AuditSink = new InMemoryAuditSink()) {}

  async requested(request: CapabilityRequest): Promise<void> {
    await this.record({ type: "capability.requested", capability: request.capability, version: request.version, context: request.context });
    if (request.dryRun) await this.record({ type: "capability.dryrun", capability: request.capability, version: request.version, context: request.context });
  }

  async completed(result: CapabilityResult, context?: GatewayExecutionContext): Promise<void> {
    await this.record({
      type: result.success ? "capability.executed" : "capability.failed",
      capability: result.capability,
      version: result.version,
      context,
      metadata: {
        duration: result.duration,
        status: result.status,
        dryRun: result.dryRun,
        success: result.success,
        evidence: result.evidence,
        error: result.error,
      },
    });
  }

  async contextSynced(context?: GatewayExecutionContext, metadata?: Record<string, unknown>): Promise<void> {
    await this.record({ type: "context.synced", context, metadata });
  }

  private async record(event: Omit<GatewayAuditEvent, "occurredAt">): Promise<void> {
    await this.sink.record({ ...event, occurredAt: new Date().toISOString() });
  }
}
