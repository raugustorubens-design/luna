import type { CapabilityEvidence, CapabilityManifest, CapabilityRequest, CapabilityResult } from "../contracts";

export interface CapabilityOutcome<TOutput> {
  output: TOutput;
  evidence: CapabilityEvidence[];
}

/**
 * Shared execution lifecycle for gateway capabilities: dry-run short circuit,
 * approval gate for capabilities with requiresApproval, duration timing, and
 * standardized error shaping. Every capability delegates to this instead of
 * re-implementing the same try/catch/timing boilerplate.
 */
export async function runCapabilityLifecycle<TInput, TOutput>(
  manifest: CapabilityManifest,
  request: CapabilityRequest<TInput>,
  execute: (input: TInput) => Promise<CapabilityOutcome<TOutput>>,
): Promise<CapabilityResult<TOutput>> {
  const startedAt = Date.now();
  const dryRun = request.dryRun ?? false;

  if (dryRun) {
    return {
      success: true,
      capability: manifest.id,
      version: manifest.version,
      duration: Date.now() - startedAt,
      status: manifest.status,
      dryRun,
      evidence: [],
      output: null,
      error: null,
    };
  }

  if (manifest.requiresApproval && request.context?.metadata?.approval !== true) {
    return {
      success: false,
      capability: manifest.id,
      version: manifest.version,
      duration: Date.now() - startedAt,
      status: manifest.status,
      dryRun,
      evidence: [],
      output: null,
      error: {
        code: "APPROVAL_REQUIRED",
        message: `Capability ${manifest.id} requires explicit approval before execution`,
      },
    };
  }

  try {
    const { output, evidence } = await execute(request.input);

    return {
      success: true,
      capability: manifest.id,
      version: manifest.version,
      duration: Date.now() - startedAt,
      status: manifest.status,
      dryRun,
      evidence,
      output,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      capability: manifest.id,
      version: manifest.version,
      duration: Date.now() - startedAt,
      status: "degraded",
      dryRun,
      evidence: [],
      output: null,
      error: {
        code: error instanceof Error && "code" in error ? String((error as { code: unknown }).code) : "CAPABILITY_EXECUTION_FAILED",
        message: error instanceof Error ? error.message : "Unknown capability execution error",
        details: error instanceof Error && "details" in error ? (error as { details: unknown }).details : undefined,
      },
    };
  }
}
