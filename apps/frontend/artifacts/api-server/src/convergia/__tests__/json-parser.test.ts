import assert from "node:assert/strict";
import test from "node:test";
import { JsonParser } from "../parsers/json-parser";

test("json parser reads an array of objects into a canonical document", async () => {
  const parser = new JsonParser();
  const input = JSON.stringify([
    { RE: "1", Nome: "Ana" },
    { RE: "2", Nome: "Bruno" },
  ]);

  const { document } = await parser.parse(Buffer.from(input), "aso.json");

  assert.deepEqual(document.columns.sort(), ["Nome", "RE"]);
  assert.equal(document.records.length, 2);
});

test("json parser wraps a single object into a one-record document", async () => {
  const parser = new JsonParser();
  const { document } = await parser.parse(Buffer.from(JSON.stringify({ a: 1 })), "single.json");
  assert.equal(document.records.length, 1);
});

test("json parser rejects invalid JSON", async () => {
  const parser = new JsonParser();
  await assert.rejects(() => parser.parse(Buffer.from("{not json"), "bad.json"), /inválido/);
});

test("json parser rejects a JSON scalar (neither object nor array)", async () => {
  const parser = new JsonParser();
  await assert.rejects(() => parser.parse(Buffer.from("42"), "scalar.json"), /objeto ou uma lista/);
});
