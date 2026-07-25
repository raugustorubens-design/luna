import assert from "node:assert/strict";
import test from "node:test";
import PptxGenJSImport from "pptxgenjs";
import { PptxParser } from "../parsers/pptx-parser";

// Same CJS/ESM interop shape resolution as pptx-renderer.ts — needed here
// because this test also has to instantiate PptxGenJS to build a fixture.
const PptxGenJS = (
  typeof PptxGenJSImport === "function" ? PptxGenJSImport : (PptxGenJSImport as unknown as { default: typeof PptxGenJSImport }).default
) as typeof PptxGenJSImport;

async function buildPresentation(): Promise<Buffer> {
  const presentation = new PptxGenJS();

  const slide1 = presentation.addSlide();
  slide1.addText("Treinamento de Operador de Empilhadeira", { x: 0.5, y: 0.5, w: "90%", h: 1, fontSize: 28 });
  slide1.addText("Módulo 1 — Introdução e Objetivos", { x: 0.5, y: 2, w: "90%", h: 0.5, fontSize: 18 });

  const slide2 = presentation.addSlide();
  slide2.addText("Regras Gerais de Operação", { x: 0.5, y: 0.5, w: "90%", h: 0.5, fontSize: 24 });
  slide2.addText("Não sobrecarregue a empilhadeira.", { x: 0.5, y: 1.5, w: "90%", h: 0.5, fontSize: 14 });

  const slide3 = presentation.addSlide();
  // Slide with a shape only, no text — confirms the parser doesn't choke on it.
  slide3.addShape("rect", { x: 1, y: 1, w: 2, h: 2, fill: { color: "FF0000" } });

  return (await presentation.write({ outputType: "nodebuffer" })) as Buffer;
}

test("pptx parser extracts one record per slide, in order", async () => {
  const buffer = await buildPresentation();
  const parser = new PptxParser();
  const { document, warnings } = await parser.parse(buffer, "treinamento-empilhadeira.pptx");

  assert.deepEqual(document.columns, ["slide", "texto"]);
  assert.equal(document.records.length, 3);

  const slideNumbers = document.records.map((r) => r.fields.find((f) => f.name === "slide")?.value);
  assert.deepEqual(slideNumbers, [1, 2, 3]);

  const slide1Texto = document.records[0]?.fields.find((f) => f.name === "texto")?.value;
  assert.ok(typeof slide1Texto === "string" && slide1Texto.includes("Treinamento de Operador de Empilhadeira"));
  assert.ok(typeof slide1Texto === "string" && slide1Texto.includes("Módulo 1"));

  const slide2Texto = document.records[1]?.fields.find((f) => f.name === "texto")?.value;
  assert.ok(typeof slide2Texto === "string" && slide2Texto.includes("Regras Gerais de Operação"));
  assert.ok(typeof slide2Texto === "string" && slide2Texto.includes("Não sobrecarregue"));

  const slide3Texto = document.records[2]?.fields.find((f) => f.name === "texto")?.value;
  assert.equal(slide3Texto, null);
  assert.equal(warnings.length, 1);
});

test("pptx parser rejects a file that isn't a valid zip", async () => {
  const parser = new PptxParser();
  await assert.rejects(() => parser.parse(Buffer.from("isto não é um pptx"), "invalido.pptx"), /zip inválido/);
});
