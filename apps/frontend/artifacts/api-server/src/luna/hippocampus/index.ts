// src/luna/hippocampus/index.ts
//
// The Hippocampus is the memory guardian of the organism. It is the only
// organ allowed to persist cognitive memory: episodic, semantic and
// procedural. Everything else - the chat pipeline, the Planner, future
// organs - asks the Hippocampus, it never reaches Supabase itself.
//
// This module implements infrastructure only. It makes no intelligent
// judgement about meaning; the Cognitive Filter's rules are deterministic
// and declared, ready for real cognition to be layered on top later.

import { randomUUID } from "node:crypto";
import { emitReport } from "../reporter";
import { applyCognitiveFilter } from "./cognitive-filter";
import { CognitiveIndex } from "./cognitive-index";
import { MemoryReconstructor } from "./reconstruction";
import { SupabaseHippocampusStore, type HippocampusStore } from "./store";
import { createInitialConcept, evolveConcept } from "./temporality";
import type {
  CognitiveCheckpoint,
  CognitiveContextSignal,
  ConceptRelation,
  MemoryCandidate,
  ReconstructedCognitiveState,
  ReconstructionInput,
  RememberResult,
  ReporterEvent,
} from "./contracts";

export class Hippocampus {
  constructor(
    private readonly store: HippocampusStore = new SupabaseHippocampusStore(),
    private readonly reconstructor: MemoryReconstructor = new MemoryReconstructor(),
  ) {}

  async remember(candidate: MemoryCandidate): Promise<RememberResult> {
    const concepts = await this.store.loadConcepts();
    const index = CognitiveIndex.fromConcepts(concepts);

    const decision = applyCognitiveFilter({
      latentState: candidate.latentState,
      context: candidate.context,
      index,
      temporality: {
        observedAt: candidate.temporality?.observedAt ?? new Date().toISOString(),
        evolutionOf: candidate.temporality?.evolutionOf,
      },
    });

    emitReport({ name: "hippocampus.filter.decided", evidence: { action: decision.action, reason: decision.reason, targetKey: decision.targetKey } });

    switch (decision.action) {
      case "discard":
        return { decision };

      case "create_concept":
        return this.handleCreateConcept(decision, candidate);

      case "update_concept":
        return this.handleUpdateConcept(decision, candidate, concepts);

      case "update_relations":
        return this.handleUpdateRelations(decision, candidate);

      case "update_checkpoint":
        return this.handleUpdateCheckpoint(decision, candidate, concepts);

      case "reconstruct_memory": {
        const objective = typeof candidate.latentState.content === "string" ? candidate.latentState.content : "";
        const reconstruction = await this.reconstruct({ objective, context: candidate.context.metadata });
        return { decision, reconstruction };
      }
    }
  }

  async reconstruct(input: ReconstructionInput): Promise<ReconstructedCognitiveState> {
    const [concepts, relations, checkpoints] = await Promise.all([
      this.store.loadConcepts(),
      this.store.loadRelations(),
      this.store.loadCheckpoints(),
    ]);

    const state = this.reconstructor.reconstruct(input, concepts, relations, checkpoints);

    emitReport({
      name: "hippocampus.reconstruction.completed",
      evidence: { objective: input.objective, conceptCount: state.concepts.length, relationCount: state.relations.length },
    });

    return state;
  }

  /** The Reporter keeps producing events; the Hippocampus is their consumer. */
  async ingestAuditEvent(event: ReporterEvent, context: CognitiveContextSignal = { source: "reporter" }): Promise<RememberResult> {
    return this.remember({
      latentState: {
        kind: "episodic",
        content: event,
        salience: 1,
      },
      context,
    });
  }

  private async handleCreateConcept(
    decision: RememberResult["decision"],
    candidate: MemoryCandidate,
  ): Promise<RememberResult> {
    if (candidate.latentState.kind === "episodic") {
      const episodic = {
        tipo: "episodic",
        contexto: candidate.context.source,
        conteudo: candidate.latentState.content,
        titulo: candidate.context.correlationId ?? "episodic memory",
      };
      await this.store.appendEpisodic(episodic);
      return { decision, episodic };
    }

    const memoryType = candidate.latentState.kind === "procedural" ? "procedural" : "semantic";
    const concept = createInitialConcept({
      id: randomUUID(),
      key: candidate.latentState.key!,
      memoryType,
      content: candidate.latentState.content,
    });

    await this.store.saveConcept(concept);
    emitReport({ name: "hippocampus.concept.created", evidence: { key: concept.key, version: concept.version } });
    return { decision, concept };
  }

  private async handleUpdateConcept(
    decision: RememberResult["decision"],
    candidate: MemoryCandidate,
    concepts: Awaited<ReturnType<HippocampusStore["loadConcepts"]>>,
  ): Promise<RememberResult> {
    const key = candidate.latentState.key ?? decision.targetKey!;
    const current = concepts
      .filter((concept) => concept.key === key && concept.state === "ACTIVE")
      .sort((a, b) => b.version - a.version)[0];

    if (!current) {
      return this.handleCreateConcept(decision, candidate);
    }

    const { next, superseded } = evolveConcept(current, { id: randomUUID(), content: candidate.latentState.content });

    await this.store.saveConcept(superseded);
    await this.store.saveConcept(next);

    emitReport({ name: "hippocampus.concept.evolved", evidence: { key: next.key, fromVersion: superseded.version, toVersion: next.version } });
    return { decision, concept: next };
  }

  private async handleUpdateRelations(decision: RememberResult["decision"], candidate: MemoryCandidate): Promise<RememberResult> {
    const relatesTo = candidate.latentState.relatesTo!;
    const relation: ConceptRelation = {
      id: randomUUID(),
      fromKey: relatesTo.fromKey,
      toKey: relatesTo.toKey,
      relationType: relatesTo.relationType,
      createdAt: new Date().toISOString(),
    };

    await this.store.saveRelation(relation);
    emitReport({ name: "hippocampus.relation.updated", evidence: { fromKey: relation.fromKey, toKey: relation.toKey, relationType: relation.relationType } });
    return { decision, relation };
  }

  private async handleUpdateCheckpoint(
    decision: RememberResult["decision"],
    candidate: MemoryCandidate,
    concepts: Awaited<ReturnType<HippocampusStore["loadConcepts"]>>,
  ): Promise<RememberResult> {
    const index = CognitiveIndex.fromConcepts(concepts);
    const checkpoint: CognitiveCheckpoint = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      cognitiveIndexRef: `index:${index.keys().length}`,
      conceptRefs: index.keys(),
      metadata: candidate.context.metadata,
    };

    await this.store.saveCheckpoint(checkpoint);
    emitReport({ name: "hippocampus.checkpoint.updated", evidence: { checkpointId: checkpoint.id, conceptCount: checkpoint.conceptRefs.length } });
    return { decision, checkpoint };
  }
}

export * from "./contracts";
export { applyCognitiveFilter } from "./cognitive-filter";
export { CognitiveIndex } from "./cognitive-index";
export { CognitiveMap } from "./cognitive-map";
export { MemoryReconstructor } from "./reconstruction";
export { SupabaseHippocampusStore, type HippocampusStore } from "./store";
export { createInitialConcept, evolveConcept, deprecateConcept, isCurrent } from "./temporality";
