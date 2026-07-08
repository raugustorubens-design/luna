// src/luna/planner/contracts.ts
//
// The Planner plans. It never executes. It reuses the Gateway's own
// `CapabilityManifest` contract for the capability inventory it reasons
// over, and the Hippocampus's own reconstruction contract for the cognitive
// state it plans against - no parallel contracts are introduced.

import type { CapabilityManifest } from "../../gateway";
import type { ReconstructedCognitiveState, ReconstructionInput } from "../hippocampus";

/** The only thing the Planner knows about the Hippocampus: how to ask it to reconstruct state. */
export interface PlannerMemoryPort {
  reconstruct(input: ReconstructionInput): Promise<ReconstructedCognitiveState>;
}

export interface PlanRequest {
  objective: string;
  context?: Record<string, unknown>;
  /** Read-only capability inventory (e.g. `registry.discover()`). The Planner never receives an executable registry. */
  capabilityInventory: CapabilityManifest[];
}

export type PlanPriority = "low" | "medium" | "high" | "critical";
export type PlanImpactLevel = "low" | "medium" | "high";
export type PlanRiskSeverity = "low" | "medium" | "high";

export interface PlanStep {
  id: string;
  description: string;
  capability?: string;
  dependsOn: string[];
}

export interface PlanDependency {
  step: string;
  dependsOn: string;
}

export interface PlanRisk {
  description: string;
  severity: PlanRiskSeverity;
}

export interface PlanImpact {
  level: PlanImpactLevel;
  reversible: boolean;
  rationale: string;
}

export interface ExpectedCheckpoint {
  cognitiveIndexRef: string;
  metadata?: Record<string, unknown>;
}

export interface StructuredPlan {
  objective: string;
  steps: PlanStep[];
  dependencies: PlanDependency[];
  risks: PlanRisk[];
  impact: PlanImpact;
  capabilities: string[];
  priority: PlanPriority;
  approvalRequired: boolean;
  expectedCheckpoint: ExpectedCheckpoint;
  reconstructedState: ReconstructedCognitiveState;
}

export interface PlannerApprovalPolicy {
  requiresApproval(input: { capabilityInventory: CapabilityManifest[]; usedCapabilityIds: string[]; impact: PlanImpact }): boolean;
}
