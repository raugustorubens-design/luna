// src/luna/hippocampus/store.ts
//
// HippocampusStore is the single boundary between the Hippocampus and
// persistence. No other organ is allowed to reach Supabase for cognitive
// data - everything routes through this port, mirroring how the Gateway's
// adapters are the single boundary for external technologies.
//
// Existing structures are reused wherever possible: episodic memory keeps
// using the `memoria_luna` table exactly as `luna/memory.ts` already did.
// Only the structures that cannot be represented there - versioned concepts
// and the concept graph - get new tables.

import { logger } from "../../lib/logger";
import { supabase } from "../../lib/supabase";
import type { CognitiveCheckpoint, CognitiveConcept, ConceptRelation, EpisodicMemoryRecord } from "./contracts";

export interface HippocampusStore {
  appendEpisodic(record: EpisodicMemoryRecord): Promise<void>;
  recentEpisodic(limit?: number): Promise<EpisodicMemoryRecord[]>;

  loadConcepts(): Promise<CognitiveConcept[]>;
  saveConcept(concept: CognitiveConcept): Promise<void>;

  loadRelations(): Promise<ConceptRelation[]>;
  saveRelation(relation: ConceptRelation): Promise<void>;

  loadCheckpoints(): Promise<CognitiveCheckpoint[]>;
  saveCheckpoint(checkpoint: CognitiveCheckpoint): Promise<void>;
}

const EPISODIC_TABLE = "memoria_luna";
const CONCEPTS_TABLE = "luna_cognitive_concepts";
const RELATIONS_TABLE = "luna_cognitive_relations";
const CHECKPOINTS_TABLE = "luna_cognitive_checkpoints";

export class SupabaseHippocampusStore implements HippocampusStore {
  async appendEpisodic(record: EpisodicMemoryRecord): Promise<void> {
    const { error } = await supabase.from(EPISODIC_TABLE).insert([
      {
        tipo: record.tipo,
        contexto: record.contexto,
        conteudo: record.conteudo,
        titulo: record.titulo,
        empresa_id: record.empresa_id,
      },
    ]);

    if (error) logger.error({ err: error }, "HIPPOCAMPUS EPISODIC APPEND ERROR");
  }

  async recentEpisodic(limit = 10): Promise<EpisodicMemoryRecord[]> {
    const { data, error } = await supabase
      .from(EPISODIC_TABLE)
      .select("*")
      .limit(limit)
      .order("criado_em", { ascending: false });

    if (error) {
      logger.error({ err: error }, "HIPPOCAMPUS EPISODIC RECALL ERROR");
      return [];
    }

    return (data ?? []) as EpisodicMemoryRecord[];
  }

  async loadConcepts(): Promise<CognitiveConcept[]> {
    const { data, error } = await supabase.from(CONCEPTS_TABLE).select("*");

    if (error) {
      logger.error({ err: error }, "HIPPOCAMPUS CONCEPT LOAD ERROR");
      return [];
    }

    return (data ?? []) as CognitiveConcept[];
  }

  async saveConcept(concept: CognitiveConcept): Promise<void> {
    const { error } = await supabase.from(CONCEPTS_TABLE).upsert([concept]);
    if (error) logger.error({ err: error }, "HIPPOCAMPUS CONCEPT SAVE ERROR");
  }

  async loadRelations(): Promise<ConceptRelation[]> {
    const { data, error } = await supabase.from(RELATIONS_TABLE).select("*");

    if (error) {
      logger.error({ err: error }, "HIPPOCAMPUS RELATION LOAD ERROR");
      return [];
    }

    return (data ?? []) as ConceptRelation[];
  }

  async saveRelation(relation: ConceptRelation): Promise<void> {
    const { error } = await supabase.from(RELATIONS_TABLE).upsert([relation]);
    if (error) logger.error({ err: error }, "HIPPOCAMPUS RELATION SAVE ERROR");
  }

  async loadCheckpoints(): Promise<CognitiveCheckpoint[]> {
    const { data, error } = await supabase
      .from(CHECKPOINTS_TABLE)
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      logger.error({ err: error }, "HIPPOCAMPUS CHECKPOINT LOAD ERROR");
      return [];
    }

    return (data ?? []) as CognitiveCheckpoint[];
  }

  async saveCheckpoint(checkpoint: CognitiveCheckpoint): Promise<void> {
    const { error } = await supabase.from(CHECKPOINTS_TABLE).upsert([checkpoint]);
    if (error) logger.error({ err: error }, "HIPPOCAMPUS CHECKPOINT SAVE ERROR");
  }
}
