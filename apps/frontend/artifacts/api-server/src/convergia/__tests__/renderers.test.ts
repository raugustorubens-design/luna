import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { CsvRenderer } from "../renderers/csv-renderer";
import { JsonRenderer } from "../renderers/json-renderer";
import { MarkdownRenderer } from "../renderers/markdown-renderer";
import { HtmlRenderer } from "../renderers/html-renderer";
import { XlsxRenderer } from "../renderers/xlsx-renderer";
import { PptxRenderer } from "../renderers/pptx-renderer";
import { createGenericTabularTemplate } from "../templates/documento-tabular-generico";
import type { CanonicalDocument } from "../contracts";

const document: CanonicalDocument = {
  title: "Relatório Teste",
  columns: ["RE", "Nome"],
  records: [
    { fields: [{ name: "RE", value: 1 }, { name: "Nome", value: "Ana" }] },
    { fields: [{ name: "RE", value: 2 }, { name: "Nome", value: "Bruno, Jr" }] },
  ],
  metadata: { sourceFormat: "csv", sourceName: "t.csv", parsedAt: new Date().toISOString(), recordCount: 2 },
};

test("csv renderer quotes fields containing commas", async () => {
  const result = await new CsvRenderer().render(document, createGenericTabularTemplate("csv"));
  const text = result.content as string;
  assert.match(text, /"Bruno, Jr"/);
  assert.equal(result.mimeType, "text/csv; charset=utf-8");
});

test("json renderer produces parseable JSON with the right record count", async () => {
  const result = await new JsonRenderer().render(document, createGenericTabularTemplate("json"));
  const parsed = JSON.parse(result.content as string);
  assert.equal(parsed.records.length, 2);
  assert.equal(parsed.records[0].RE, 1);
});

test("markdown renderer produces a table with a header divider row", async () => {
  const result = await new MarkdownRenderer().render(document, createGenericTabularTemplate("markdown"));
  const text = result.content as string;
  assert.match(text, /\| RE \| Nome \|/);
  assert.match(text, /\| --- \| --- \|/);
});

test("html renderer escapes unsafe characters", async () => {
  const withUnsafe: CanonicalDocument = {
    ...document,
    records: [{ fields: [{ name: "RE", value: 1 }, { name: "Nome", value: "<script>" }] }],
  };
  const result = await new HtmlRenderer().render(withUnsafe, createGenericTabularTemplate("html"));
  assert.doesNotMatch(result.content as string, /<script>/);
  assert.match(result.content as string, /&lt;script&gt;/);
});

test("xlsx renderer produces a real, re-parseable workbook", async () => {
  const result = await new XlsxRenderer().render(document, createGenericTabularTemplate("xlsx"));
  assert.ok(Buffer.isBuffer(result.content));

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(result.content as Buffer);
  const worksheet = workbook.worksheets[0]!;
  assert.equal(worksheet.getRow(1).getCell(1).text, "RE");
  assert.equal(worksheet.getRow(2).getCell(2).text, "Ana");
});

test("pptx renderer produces a non-empty buffer", async () => {
  const result = await new PptxRenderer().render(document, createGenericTabularTemplate("pptx"));
  assert.ok(Buffer.isBuffer(result.content));
  assert.ok((result.content as Buffer).length > 0);
  assert.equal(result.mimeType, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
});
