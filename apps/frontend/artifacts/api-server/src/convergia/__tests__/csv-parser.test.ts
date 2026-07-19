import assert from "node:assert/strict";
import test from "node:test";
import { CsvParser } from "../parsers/csv-parser";

test("csv parser reads a well-formed CSV into a canonical document", async () => {
  const csv = "RE,Nome,CPF\n1,Ana,111\n2,\"Bruno, Jr\",222\n";
  const parser = new CsvParser();
  const { document, warnings } = await parser.parse(Buffer.from(csv, "utf8"), "aso.csv");

  assert.deepEqual(document.columns, ["RE", "Nome", "CPF"]);
  assert.equal(document.records.length, 2);
  assert.equal(document.records[1]?.fields.find((f) => f.name === "Nome")?.value, "Bruno, Jr");
  assert.equal(document.metadata.sourceFormat, "csv");
  assert.equal(document.metadata.recordCount, 2);
  assert.deepEqual(warnings, []);
});

test("csv parser rejects an empty file", async () => {
  const parser = new CsvParser();
  await assert.rejects(() => parser.parse(Buffer.from(""), "empty.csv"), /vazio/);
});
