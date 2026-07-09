import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";
import { XlsxParser } from "../parsers/xlsx-parser";

async function buildWorkbook(rows: (string | number | Date)[][]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");
  rows.forEach((row) => worksheet.addRow(row));
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

test("xlsx parser reads headers and rows into a canonical document", async () => {
  const buffer = await buildWorkbook([
    ["RE", "Nome", "CPF", "Data ASO"],
    [1, "Ana", "111", new Date("2026-01-15")],
    [2, "Bruno", "222", new Date("2026-02-20")],
  ]);

  const parser = new XlsxParser();
  const { document, warnings } = await parser.parse(buffer, "aso.xlsx");

  assert.deepEqual(document.columns, ["RE", "Nome", "CPF", "Data ASO"]);
  assert.equal(document.records.length, 2);
  assert.equal(document.records[0]?.fields.find((f) => f.name === "Nome")?.value, "Ana");
  assert.equal(document.records[0]?.fields.find((f) => f.name === "Data ASO")?.value, "2026-01-15");
  assert.deepEqual(warnings, []);
});

test("xlsx parser skips fully empty rows", async () => {
  const buffer = await buildWorkbook([
    ["RE", "Nome"],
    [1, "Ana"],
    ["", ""],
  ]);

  const parser = new XlsxParser();
  const { document } = await parser.parse(buffer, "aso.xlsx");
  assert.equal(document.records.length, 1);
});

test("xlsx parser rejects a workbook with no worksheets", async () => {
  const workbook = new ExcelJS.Workbook();
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  const parser = new XlsxParser();
  await assert.rejects(() => parser.parse(buffer, "empty.xlsx"), /abas/);
});
