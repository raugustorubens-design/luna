import assert from "node:assert/strict";
import test from "node:test";
import { validateCanonicalDocument } from "../validation";
import type { CanonicalDocument } from "../contracts";

function baseDocument(): CanonicalDocument {
  return {
    title: "doc",
    columns: ["a", "b"],
    records: [{ fields: [{ name: "a", value: 1 }, { name: "b", value: "x" }] }],
    metadata: { sourceFormat: "csv", sourceName: "doc.csv", parsedAt: new Date().toISOString(), recordCount: 1 },
  };
}

test("validates a well-formed canonical document", () => {
  const result = validateCanonicalDocument(baseDocument());
  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("rejects a document with no columns", () => {
  const document = baseDocument();
  document.columns = [];
  const result = validateCanonicalDocument(document);
  assert.equal(result.valid, false);
  assert.ok(result.issues.length > 0);
});

test("rejects a document whose recordCount metadata disagrees with the real record count", () => {
  const document = baseDocument();
  document.metadata.recordCount = 99;
  const result = validateCanonicalDocument(document);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.path === "metadata.recordCount"));
});

test("rejects a record field not declared in columns", () => {
  const document = baseDocument();
  document.records[0]!.fields.push({ name: "unexpected", value: "?" });
  const result = validateCanonicalDocument(document);
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.message.includes("unexpected")));
});
