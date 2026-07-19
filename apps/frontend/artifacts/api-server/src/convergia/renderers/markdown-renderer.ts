import type { CanonicalDocument, Renderer, RenderResult, TemplateDescriptor } from "../contracts";

function fieldToString(value: string | number | boolean | null): string {
  return value === null || value === undefined ? "" : String(value).replace(/\|/g, "\\|");
}

export class MarkdownRenderer implements Renderer {
  readonly format = "markdown" as const;

  async render(document: CanonicalDocument, template: TemplateDescriptor): Promise<RenderResult> {
    const laidOut = template.layout(document);
    const header = `| ${laidOut.columns.join(" | ")} |`;
    const divider = `| ${laidOut.columns.map(() => "---").join(" | ")} |`;
    const rows = laidOut.records.map(
      (record) =>
        `| ${laidOut.columns
          .map((column) => fieldToString(record.fields.find((f) => f.name === column)?.value ?? null))
          .join(" | ")} |`,
    );

    const content = [`# ${laidOut.title}`, "", header, divider, ...rows].join("\n");

    return {
      format: "markdown",
      filename: `${laidOut.title || "documento"}.md`,
      mimeType: "text/markdown; charset=utf-8",
      content,
    };
  }
}
