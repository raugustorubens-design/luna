import { XlsxParser } from "./xlsx-parser";
import { CsvParser } from "./csv-parser";
import { JsonParser } from "./json-parser";
import { PptxParser } from "./pptx-parser";
import type { ConvergiaInputFormat, Parser } from "../contracts";

/**
 * MVP input formats: XLSX, CSV, JSON, PPTX — all real, tested parsers below.
 *
 * PPTX was added after CSV uploads on the "Conhecimento" tab surfaced that
 * presentations weren't readable at all — no parser existed for that input
 * format. Unlike DOCX/PDF (still deliberately deferred, see below), a
 * presentation is already naturally segmented by slide, so it maps onto the
 * tabular Canonical Model without forcing anything (one record per slide).
 *
 * DOCX and PDF are named in the Prompt 3 spec but are NOT implemented here.
 * Both need a new, unvetted dependency (e.g. `mammoth` for DOCX, `pdf-parse`
 * for PDF), and neither format maps cleanly onto the current tabular
 * Canonical Model — a real DOCX/PDF parser needs a `sections`/tree-shaped
 * document model, which is a bigger design decision than "add a library."
 * Shipping a shallow parser just to tick the box would produce silently
 * wrong output for anything but the simplest documents, which is worse than
 * not having it. Flagged in the final report as deferred, not forgotten.
 */
export function createParserRegistry(): Map<ConvergiaInputFormat, Parser> {
  const parsers: Parser[] = [new XlsxParser(), new CsvParser(), new JsonParser(), new PptxParser()];
  return new Map(parsers.map((parser) => [parser.format, parser]));
}
