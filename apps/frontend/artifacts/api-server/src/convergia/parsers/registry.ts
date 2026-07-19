import { XlsxParser } from "./xlsx-parser";
import { CsvParser } from "./csv-parser";
import { JsonParser } from "./json-parser";
import type { ConvergiaInputFormat, Parser } from "../contracts";

/**
 * MVP input formats: XLSX, CSV, JSON — all real, tested parsers below.
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
  const parsers: Parser[] = [new XlsxParser(), new CsvParser(), new JsonParser()];
  return new Map(parsers.map((parser) => [parser.format, parser]));
}
