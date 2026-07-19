// src/luna/planner/index.ts
//
// The Planner plans. It never executes GitHub, Railway, Supabase, the
// filesystem, the Reporter, or any capability - all execution continues to
// belong exclusively to the Gateway. The Planner's only dependencies are:
// a memory port (satisfied by the Hippocampus) and a read-only capability
// inventory (satisfied by `registry.discover()`).

import { DefaultPlannerApprovalPolicy } from "./approval";
import { runPlannerPipeline } from "./pipeline";
import type { PlanRequest, PlannerApprovalPolicy, PlannerMemoryPort, StructuredPlan } from "./contracts";

export class Planner {
  constructor(
    private readonly memory: PlannerMemoryPort,
    private readonly approvalPolicy: PlannerApprovalPolicy = new DefaultPlannerApprovalPolicy(),
  ) {}

  async plan(request: PlanRequest): Promise<StructuredPlan> {
    return runPlannerPipeline(request, this.memory, this.approvalPolicy);
  }
}

export * from "./contracts";
export { DefaultPlannerApprovalPolicy } from "./approval";
export { analyze } from "./analysis";
export { assessImpact } from "./impact";
export { resolveCapabilities } from "./capabilities";
export { runPlannerPipeline } from "./pipeline";
