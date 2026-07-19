// src/luna/planner/capabilities.ts
//
// Capabilities: validates the steps' referenced capabilities against the
// read-only inventory the Planner was given. This never touches the
// Registry - it only reasons over the discovery snapshot passed in.

import type { CapabilityManifest } from "../../gateway";
import type { PlanRisk, PlanStep } from "./contracts";

export interface CapabilityResolution {
  capabilityIds: string[];
  risks: PlanRisk[];
}

export function resolveCapabilities(steps: PlanStep[], capabilityInventory: CapabilityManifest[]): CapabilityResolution {
  const byId = new Map(capabilityInventory.map((manifest) => [manifest.id, manifest]));
  const capabilityIds: string[] = [];
  const risks: PlanRisk[] = [];

  for (const step of steps) {
    if (!step.capability) continue;

    const manifest = byId.get(step.capability);
    if (!manifest) {
      risks.push({ description: `Step "${step.id}" references unregistered capability "${step.capability}".`, severity: "high" });
      continue;
    }

    capabilityIds.push(manifest.id);

    if (manifest.status === "disabled") {
      risks.push({ description: `Capability "${manifest.id}" is disabled.`, severity: "high" });
    } else if (manifest.status === "degraded") {
      risks.push({ description: `Capability "${manifest.id}" is degraded.`, severity: "medium" });
    }
  }

  return { capabilityIds: [...new Set(capabilityIds)], risks };
}
