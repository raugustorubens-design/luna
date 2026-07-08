import type { CapabilityManifest } from "./manifest";
import type { GatewayExecutionContext } from "./context";
import type { CapabilityHealth } from "./health";

export interface CapabilityRequest<TInput = unknown> {
  capability: string;
  version?: number;
  dryRun?: boolean;
  input: TInput;
  context?: GatewayExecutionContext;
}

export interface CapabilityEvidence {
  source: string;
  reference: string;
  observedAt: string;
  metadata?: Record<string, unknown>;
}

export interface CapabilityError {
  code: string;
  message: string;
  details?: unknown;
}

export interface CapabilityResult<TOutput = unknown> {
  success: boolean;
  capability: string;
  version: number;
  duration: number;
  status: CapabilityHealth;
  dryRun: boolean;
  evidence: CapabilityEvidence[];
  output: TOutput | null;
  error: CapabilityError | null;
}

export interface Capability<TInput = unknown, TOutput = unknown> {
  manifest: CapabilityManifest;
  execute(request: CapabilityRequest<TInput>): Promise<CapabilityResult<TOutput>>;
}
