// src/luna/planner/approval.ts
//
// Mirrors the Gateway's own authorization pattern (`GatewayAuthorizationPolicy`
// / `AllowGatewayAuthorizationPolicy`): a small injectable policy interface
// with a conservative default implementation.

import type { PlannerApprovalPolicy } from "./contracts";

export class DefaultPlannerApprovalPolicy implements PlannerApprovalPolicy {
  requiresApproval(input: Parameters<PlannerApprovalPolicy["requiresApproval"]>[0]): boolean {
    const { capabilityInventory, usedCapabilityIds, impact } = input;

    const usesApprovalGatedCapability = capabilityInventory.some(
      (manifest) => usedCapabilityIds.includes(manifest.id) && manifest.requiresApproval,
    );

    return usesApprovalGatedCapability || impact.level === "high" || !impact.reversible;
  }
}
