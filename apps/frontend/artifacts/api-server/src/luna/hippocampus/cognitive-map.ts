// src/luna/hippocampus/cognitive-map.ts
//
// The Cognitive Map holds the relations between concepts - the graph that
// the Cognitive Index's entries are embedded in.

import type { ConceptRelation } from "./contracts";

export class CognitiveMap {
  private readonly relations: ConceptRelation[] = [];

  static fromRelations(relations: ConceptRelation[]): CognitiveMap {
    const map = new CognitiveMap();
    for (const relation of relations) map.add(relation);
    return map;
  }

  add(relation: ConceptRelation): void {
    this.relations.push(relation);
  }

  all(): ConceptRelation[] {
    return [...this.relations];
  }

  relationsOf(key: string): ConceptRelation[] {
    return this.relations.filter((relation) => relation.fromKey === key || relation.toKey === key);
  }

  /** Breadth-first traversal of related concept keys, bounded by depth. */
  neighborsOf(key: string, depth = 1): string[] {
    const visited = new Set<string>([key]);
    let frontier = [key];

    for (let hop = 0; hop < depth; hop++) {
      const next: string[] = [];
      for (const current of frontier) {
        for (const relation of this.relationsOf(current)) {
          const other = relation.fromKey === current ? relation.toKey : relation.fromKey;
          if (!visited.has(other)) {
            visited.add(other);
            next.push(other);
          }
        }
      }
      frontier = next;
      if (frontier.length === 0) break;
    }

    visited.delete(key);
    return [...visited].sort();
  }
}
