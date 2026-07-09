import assert from "node:assert/strict";
import test from "node:test";
import { ConvergiaPipeline } from "../pipeline";
import { ConvergiaValidationError } from "../errors";

test("full pipeline: CSV in, JSON out, via the identity transform", async () => {
  const pipeline = new ConvergiaPipeline();
  const csv = "RE,Nome\n1,Ana\n2,Bruno\n";

  const result = await pipeline.run({
    file: Buffer.from(csv),
    sourceName: "aso.csv",
    inputFormat: "csv",
    templateId: "documento_tabular_generico_json",
  });

  assert.equal(result.validation.valid, true);
  const rendered = JSON.parse(result.render.content as string);
  assert.equal(rendered.records.length, 2);
  assert.equal(result.canonicalDocument.records.length, 2);
});

test("full pipeline: XLSX-shaped source column names normalized via the SSMA transform, rendered to Markdown", async () => {
  const pipeline = new ConvergiaPipeline();
  const csv = "re,nome,cpf,data aso\n1,Ana,111,2026-01-01\n";

  const result = await pipeline.run({
    file: Buffer.from(csv),
    sourceName: "aso.csv",
    inputFormat: "csv",
    transformId: "ssma_aso_normalize",
    templateId: "documento_tabular_generico_markdown",
  });

  assert.deepEqual(result.canonicalDocument.columns, ["RE", "Nome", "CPF", "Data ASO"]);
  assert.match(result.render.content as string, /\| RE \| Nome \| CPF \| Data ASO \|/);
});

test("pipeline never skips validation: a document with no columns is rejected before transformação", async () => {
  const pipeline = new ConvergiaPipeline();
  // A JSON input whose entries are all non-objects produces zero columns.
  const badJson = JSON.stringify([1, 2, 3]);

  await assert.rejects(
    () =>
      pipeline.run({
        file: Buffer.from(badJson),
        sourceName: "bad.json",
        inputFormat: "json",
        templateId: "documento_tabular_generico_json",
      }),
    ConvergiaValidationError,
  );
});

test("pipeline rejects an unknown input format", async () => {
  const pipeline = new ConvergiaPipeline();
  await assert.rejects(
    () =>
      pipeline.run({
        file: Buffer.from("{}"),
        sourceName: "x",
        // @ts-expect-error deliberately invalid for the test
        inputFormat: "docx",
        templateId: "documento_tabular_generico_json",
      }),
    /Nenhum parser registrado/,
  );
});

test("pipeline rejects an unknown template id", async () => {
  const pipeline = new ConvergiaPipeline();
  await assert.rejects(
    () =>
      pipeline.run({
        file: Buffer.from(JSON.stringify([{ a: 1 }])),
        sourceName: "x.json",
        inputFormat: "json",
        templateId: "does_not_exist",
      }),
    /não está registrado/,
  );
});

test("parseOnly never renders a document — it stops at Validação", async () => {
  const pipeline = new ConvergiaPipeline();
  const result = await pipeline.parseOnly(Buffer.from(JSON.stringify([{ RE: "1" }])), "x.json", "json");
  assert.equal(result.validation.valid, true);
  assert.equal("render" in result, false);
});
