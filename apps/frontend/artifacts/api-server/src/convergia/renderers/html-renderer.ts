import type { CanonicalDocument, Renderer, RenderResult, TemplateDescriptor } from "../contracts";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fieldToString(value: string | number | boolean | null): string {
  return value === null || value === undefined ? "" : escapeHtml(String(value));
}

export class HtmlRenderer implements Renderer {
  readonly format = "html" as const;

  async render(document: CanonicalDocument, template: TemplateDescriptor): Promise<RenderResult> {
    const laidOut = template.layout(document);
    const headerCells = laidOut.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
    const rows = laidOut.records
      .map((record) => {
        const cells = laidOut.columns
          .map((column) => `<td>${fieldToString(record.fields.find((f) => f.name === column)?.value ?? null)}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const content = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>${escapeHtml(laidOut.title)}</title></head>
<body>
<h1>${escapeHtml(laidOut.title)}</h1>
<table border="1" cellspacing="0" cellpadding="4">
<thead><tr>${headerCells}</tr></thead>
<tbody>${rows}</tbody>
</table>
</body>
</html>`;

    return {
      format: "html",
      filename: `${laidOut.title || "documento"}.html`,
      mimeType: "text/html; charset=utf-8",
      content,
    };
  }
}
