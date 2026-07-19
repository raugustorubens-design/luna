import PptxGenJSImport from "pptxgenjs";
import type { CanonicalDocument, Renderer, RenderResult, TemplateDescriptor } from "../contracts";

/**
 * pptxgenjs's CJS build double-wraps its default export under some
 * ESM/CJS interop paths (tsx's dev/test runtime hits this; esbuild's
 * production bundle does not) — `PptxGenJSImport` can come through as
 * either the class itself or `{ default: <class> }`. Resolving both shapes
 * here keeps the renderer correct in every runtime this project actually
 * uses, instead of only the one that happened to be tested manually.
 */
const PptxGenJS = (
  typeof PptxGenJSImport === "function" ? PptxGenJSImport : (PptxGenJSImport as unknown as { default: typeof PptxGenJSImport }).default
) as typeof PptxGenJSImport;

const ROWS_PER_SLIDE = 18;

function fieldToString(value: string | number | boolean | null): string {
  return value === null || value === undefined ? "" : String(value);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks.length > 0 ? chunks : [[]];
}

export class PptxRenderer implements Renderer {
  readonly format = "pptx" as const;

  async render(document: CanonicalDocument, template: TemplateDescriptor): Promise<RenderResult> {
    const laidOut = template.layout(document);
    const presentation = new PptxGenJS();

    const titleSlide = presentation.addSlide();
    titleSlide.addText(laidOut.title || "Documento", { x: 0.5, y: 2, w: "90%", h: 1, fontSize: 32, bold: true });
    titleSlide.addText(`${laidOut.records.length} registro(s)`, { x: 0.5, y: 3, w: "90%", h: 0.5, fontSize: 14 });

    const header = laidOut.columns.map((column) => ({ text: column, options: { bold: true } }));

    for (const page of chunk(laidOut.records, ROWS_PER_SLIDE)) {
      const slide = presentation.addSlide();
      const tableRows = [
        header,
        ...page.map((record) =>
          laidOut.columns.map((column) => ({
            text: fieldToString(record.fields.find((f) => f.name === column)?.value ?? null),
          })),
        ),
      ];
      slide.addTable(tableRows, { x: 0.3, y: 0.3, w: 9.4, fontSize: 10, autoPage: false });
    }

    const buffer = (await presentation.write({ outputType: "nodebuffer" })) as Buffer;

    return {
      format: "pptx",
      filename: `${laidOut.title || "documento"}.pptx`,
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      content: buffer,
    };
  }
}
