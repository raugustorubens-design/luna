// src/luna/planner/pipeline.ts
//
// Objetivo -> Hipocampo -> Reconstrucao -> Analise -> Plano -> Impacto ->
// Capabilities -> Approval -> Plano Estruturado.
//
// Every stage is a small, testable function. The pipeline only assembles
// their outputs - it holds no cognition of its own.

import { emitReport } from "../reporter";
import { analyze } from "./analysis";
import { assessImpact } from "./impact";
import { resolveCapabilities } from "./capabilities";
import { DefaultPlannerApprovalPolicy } from "./approval";
import type { PlanRequest, PlannerApprovalPolicy, PlannerMemoryPort, PlanPriority, PlanRisk, StructuredPlan } from "./contracts";

function derivePriority(approvalRequired: boolean, impactLevel: StructuredPlan["impact"]["level"]): PlanPriority {
  if (approvalRequired && impactLevel === "high") return "critical";
  return impactLevel;
}

export async function runPlannerPipeline(
  request: PlanRequest,
  memory: PlannerMemoryPort,
  approvalPolicy: PlannerApprovalPolicy = new DefaultPlannerApprovalPolicy(),
): Promise<StructuredPlan> {
  emitReport({ name: "planner.pipeline.started", evidence: { objective: request.objective } });

  emitReport({ name: "planner.reconstruction.started" });
  const reconstructedState = await memory.reconstruct({ objective: request.objective, context: request.context });
  emitReport({ name: "planner.reconstruction.completed", evidence: { conceptCount: reconstructedState.concepts.length } });

  const steps = analyze(request.objective, reconstructedState, request.capabilityInventory);
  emitReport({ name: "planner.analysis.completed", evidence: { stepCount: steps.length } });

  const dependencies = steps.flatMap((step) => step.dependsOn.map((dependsOn) => ({ step: step.id, dependsOn })));

  const impact = assessImpact(steps, request.capabilityInventory);
  emitReport({ name: "planner.impact.assessed", evidence: { level: impact.level, reversible: impact.reversible } });

  const { capabilityIds, risks: capabilityRisks } = resolveCapabilities(steps, request.capabilityInventory);

  const risks: PlanRisk[] = [...capabilityRisks];
  if (capabilityIds.length === 0) {
    risks.push({ description: "No capability matched the objective; plan is analysis-only.", severity: "low" });
  }

  const approvalRequired = approvalPolicy.requiresApproval({ capabilityInventory: request.capabilityInventory, usedCapabilityIds: capabilityIds, impact });
  emitReport({ name: "planner.approval.evaluated", evidence: { approvalRequired } });

  const priority = derivePriority(approvalRequired, impact.level);

  const plan: StructuredPlan = {
    objective: request.objective,
    steps,
    dependencies,
    risks,
    impact,
    capabilities: capabilityIds,
    priority,
    approvalRequired,
    expectedCheckpoint: {
      cognitiveIndexRef: `index:${reconstructedState.cognitiveIndexRefs.length}`,
      metadata: { reconstructionRefs: reconstructedState.reconstructionRefs },
    },
    reconstructedState,
  };

  emitReport({ name: "planner.plan.assembled", evidence: { priority: plan.priority, approvalRequired: plan.approvalRequired, stepCount: plan.steps.length } });

  return plan;
}
