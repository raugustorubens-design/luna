import assert from "node:assert/strict";
import test from "node:test";
import { createInitialConcept, deprecateConcept, evolveConcept, isCurrent } from "../temporality";

test("createInitialConcept starts at version 1 in the ACTIVE state", () => {
  const concept = createInitialConcept({ id: "1", key: "gateway", memoryType: "semantic", content: { a: 1 } });
  assert.equal(concept.version, 1);
  assert.equal(concept.state, "ACTIVE");
  assert.equal(concept.previousVersionId, null);
  assert.ok(isCurrent(concept));
});

test("evolveConcept produces a new ACTIVE version and marks the previous one SUPERSEDED, never deleting it", () => {
  const v1 = createInitialConcept({ id: "1", key: "gateway", memoryType: "semantic", content: { a: 1 } });
  const { next, superseded } = evolveConcept(v1, { id: "2", content: { a: 2 } });

  assert.equal(next.version, 2);
  assert.equal(next.state, "ACTIVE");
  assert.equal(next.previousVersionId, "1");
  assert.equal(next.key, v1.key);

  assert.equal(superseded.id, "1");
  assert.equal(superseded.state, "SUPERSEDED");
  assert.ok(superseded.supersededAt);
  assert.equal(isCurrent(superseded), false);
});

test("evolveConcept can be chained across many versions, preserving the full lineage", () => {
  const v1 = createInitialConcept({ id: "1", key: "gateway", memoryType: "semantic", content: {} });
  const { next: v2, superseded: s1 } = evolveConcept(v1, { id: "2", content: {} });
  const { next: v3, superseded: s2 } = evolveConcept(v2, { id: "3", content: {} });

  assert.equal(v3.version, 3);
  assert.equal(v3.previousVersionId, "2");
  assert.equal(s2.id, "2");
  assert.equal(s1.id, "1");
  assert.equal(s1.state, "SUPERSEDED");
  assert.equal(s2.state, "SUPERSEDED");
});

test("deprecateConcept marks a concept DEPRECATED without touching its version or lineage", () => {
  const v1 = createInitialConcept({ id: "1", key: "legacy-provider", memoryType: "semantic", content: {} });
  const deprecated = deprecateConcept(v1);

  assert.equal(deprecated.state, "DEPRECATED");
  assert.equal(deprecated.version, 1);
  assert.ok(deprecated.supersededAt);
  assert.equal(isCurrent(deprecated), false);
});
