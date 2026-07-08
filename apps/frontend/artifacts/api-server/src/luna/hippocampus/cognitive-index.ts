// src/luna/hippocampus/cognitive-index.ts
//
// The Cognitive Index is a semantic projection over the concept store: it
// represents concepts, and only concepts. It is never a file index, a
// document index, or a commit index.

import type { CognitiveConcept, CognitiveIndexEntry, CognitiveIndexSnapshot } from "./contracts";
import { isCurrent } from "./temporality";

export class CognitiveIndex implements CognitiveIndexSnapshot {
  private readonly entries = new Map<string, CognitiveIndexEntry>();

  static fromConcepts(concepts: CognitiveConcept[]): CognitiveIndex {
    const index = new CognitiveIndex();
    for (const concept of concepts) index.upsert(concept);
    return index;
  }

  upsert(concept: CognitiveConcept): void {
    if (!isCurrent(concept)) return;

    this.entries.set(concept.key, {
      key: concept.key,
      conceptId: concept.id,
      memoryType: concept.memoryType,
      version: concept.version,
      state: concept.state,
    });
  }

  hasKey(key: string): boolean {
    return this.entries.has(key);
  }

  getEntry(key: string): CognitiveIndexEntry | undefined {
    return this.entries.get(key);
  }

  keys(): string[] {
    return [...this.entries.keys()].sort();
  }

  entriesList(): CognitiveIndexEntry[] {
    return this.keys().map((key) => this.entries.get(key)!);
  }
}
