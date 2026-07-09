import type { CanonicalDocument, Renderer, RenderResult, TemplateDescriptor } from "../contracts";

export class JsonRenderer implements Renderer {
  readonly format = "json" as const;

  async render(document: CanonicalDocument, template: TemplateDescriptor): Promise<RenderResult> {
    const laidOut = template.layout(document);
    const records = laidOut.records.map((record) =>
      Object.fromEntries(record.fields.map((field) => [field.name, field.value])),
    );

    return {
      format: "json",
      filename: `${laidOut.title || "documento"}.json`,
      mimeType: "application/json; charset=utf-8",
      content: JSON.stringify({ title: laidOut.title, columns: laidOut.columns, records }, null, 2),
    };
  }
}
