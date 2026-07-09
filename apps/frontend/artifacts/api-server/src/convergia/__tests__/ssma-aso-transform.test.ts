import assert from "node:assert/strict";
import test from "node:test";
import { SsmaAsoTransform } from "../transform/ssma-aso-transform";
import type { CanonicalDocument } from "../contracts";

test("normalizes columns regardless of accents/case and reorders to the expected shape", async () => {
  const document: CanonicalDocument = {
    title: "planilha",
    columns: ["re", "NOME", "cpf", "data aso"],
    records: [
      {
        fields: [
          { name: "re", value: "1" },
          { name: "NOME", value: "Ana" },
          { name: "cpf", value: "111" },
          { name: "data aso", value: "2026-01-01" },
        ],
      },
    ],
    metadata: { sourceFormat: "xlsx", sourceName: "planilha.xlsx", parsedAt: new Date().toISOString(), recordCount: 1 },
  };

  const transform = new SsmaAsoTransform();
  const { document: transformed, notes } = await transform.apply(document);

  assert.deepEqual(transformed.columns, ["RE", "Nome", "CPF", "Data ASO"]);
  assert.equal(transformed.records[0]?.fields.find((f) => f.name === "Nome")?.value, "Ana");
  assert.deepEqual(notes, []);
});

test("reports missing expected columns as notes instead of failing silently", async () => {
  const document: CanonicalDocument = {
    title: "planilha",
    columns: ["RE", "Nome"],
    records: [{ fields: [{ name: "RE", value: "1" }, { name: "Nome", value: "Ana" }] }],
    metadata: { sourceFormat: "xlsx", sourceName: "planilha.xlsx", parsedAt: new Date().toISOString(), recordCount: 1 },
  };

  const transform = new SsmaAsoTransform();
  const { notes } = await transform.apply(document);

  assert.ok(notes.some((note) => note.includes("CPF")));
  assert.ok(notes.some((note) => note.includes("Data ASO")));
});
