// src/luna/planner/analysis.ts
//
// Analise: deterministic decomposition of the objective into candidate
// steps, informed by the reconstructed cognitive state and matched against
// the capability inventory by explicit keyword overlap. This is
// infrastructure, not intelligence - it makes no semantic judgement, only
// structural matching. Real planning intelligence is meant to be layered
// on top of this seam later.

import type { CapabilityManifest } from "../../gateway";
import type { ReconstructedCognitiveState } from "../hippocampus";
import type { PlanStep } from "./contracts";

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/i)
    .filter(Boolean);
}

function matches(manifest: CapabilityManifest, tokens: string[]): boolean {
  const haystack = `${manifest.id} ${manifest.description}`.toLowerCase();
  return tokens.some((token) => token.length > 2 && haystack.includes(token));
}

export function analyze(
  objective: string,
  reconstructedState: ReconstructedCognitiveState,
  capabilityInventory: CapabilityManifest[],
): PlanStep[] {
  const tokens = [...tokenize(objective), ...reconstructedState.concepts.map((concept) => concept.key)];
  const matchedCapabilities = capabilityInventory.filter((manifest) => matches(manifest, tokens));

  if (matchedCapabilities.length === 0) {
    return [{ id: "step-1", description: `Analyze objective: ${objective}`, dependsOn: [] }];
  }

  return matchedCapabilities.map((manifest, position) => ({
    id: `step-${position + 1}`,
    description: `Use capability "${manifest.id}" toward: ${objective}`,
    capability: manifest.id,
    dependsOn: position === 0 ? [] : [`step-${position}`],
  }));
}
