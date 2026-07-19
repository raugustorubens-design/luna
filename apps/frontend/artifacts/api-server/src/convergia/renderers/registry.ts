import { CsvRenderer } from "./csv-renderer";
import { JsonRenderer } from "./json-renderer";
import { MarkdownRenderer } from "./markdown-renderer";
import { HtmlRenderer } from "./html-renderer";
import { XlsxRenderer } from "./xlsx-renderer";
import { PptxRenderer } from "./pptx-renderer";
import type { ConvergiaOutputFormat, Renderer } from "../contracts";

/**
 * MVP output formats: CSV, JSON, Markdown, HTML, XLSX, PPTX — all real.
 *
 * DOCX and PDF output are named in Prompt 3 but NOT implemented here, for
 * the same reason as DOCX/PDF input: they need a new, unvetted dependency
 * (`docx` for Word generation, `pdfkit`/a headless-browser print pipeline
 * for PDF) and real layout work that a rushed pass would get wrong.
 */
export function createRendererRegistry(): Map<ConvergiaOutputFormat, Renderer> {
  const renderers: Renderer[] = [
    new CsvRenderer(),
    new JsonRenderer(),
    new MarkdownRenderer(),
    new HtmlRenderer(),
    new XlsxRenderer(),
    new PptxRenderer(),
  ];
  return new Map(renderers.map((renderer) => [renderer.format, renderer]));
}
