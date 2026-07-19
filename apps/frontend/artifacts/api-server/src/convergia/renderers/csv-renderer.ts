import type { CanonicalDocument, Renderer, RenderResult, TemplateDescriptor } from "../contracts";

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function fieldToString(value: string | number | boolean | null): string {
  return value === null || value === undefined ? "" : String(value);
}

export class CsvRenderer implements Renderer {
  readonly format = "csv" as const;

  async render(document: CanonicalDocument, template: TemplateDescriptor): Promise<RenderResult> {
    const laidOut = template.layout(document);
    const lines = [
      laidOut.columns.map(escapeCsvField).join(","),
      ...laidOut.records.map((record) =>
        laidOut.columns
          .map((column) => escapeCsvField(fieldToString(record.fields.find((f) => f.name === column)?.value ?? null)))
          .join(","),
      ),
    ];

    return {
      format: "csv",
      filename: `${laidOut.title || "documento"}.csv`,
      mimeType: "text/csv; charset=utf-8",
      content: lines.join("\n"),
    };
  }
}
