// src/luna/planner/impact.ts
//
// Impacto: classifies the blast radius of a plan using only what the
// capability manifests already declare (`supportsRollback`), the same
// signal the Gateway exposes for rollback support.

import type { CapabilityManifest } from "../../gateway";
import type { PlanImpact, PlanStep } from "./contracts";

export function assessImpact(steps: PlanStep[], capabilityInventory: CapabilityManifest[]): PlanImpact {
  const usedCapabilityIds = new Set(steps.map((step) => step.capability).filter((id): id is string => Boolean(id)));
  const usedManifests = capabilityInventory.filter((manifest) => usedCapabilityIds.has(manifest.id));

  if (usedManifests.length === 0) {
    return { level: "low", reversible: true, rationale: "No capabilities referenced; plan is analysis-only." };
  }

  const irreversible = usedManifests.some((manifest) => !manifest.supportsRollback);

  if (irreversible) {
    return {
      level: "high",
      reversible: false,
      rationale: `At least one referenced capability does not support rollback: ${usedManifests
        .filter((manifest) => !manifest.supportsRollback)
        .map((manifest) => manifest.id)
        .join(", ")}.`,
    };
  }

  return { level: "medium", reversible: true, rationale: "All referenced capabilities support rollback." };
}
