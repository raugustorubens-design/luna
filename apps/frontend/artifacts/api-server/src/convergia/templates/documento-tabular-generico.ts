import type { ConvergiaOutputFormat, TemplateDescriptor } from "../contracts";

/**
 * One generic, format-agnostic tabular template per output format. A
 * `TemplateDescriptor` binds to exactly one renderer (per Prompt 3's field
 * list), so "render this data as CSV or Markdown or ..." means picking the
 * matching generic template rather than one template claiming many formats.
 */
export function createGenericTabularTemplate(format: ConvergiaOutputFormat): TemplateDescriptor {
  return {
    id: `documento_tabular_generico_${format}`,
    version: 1,
    type: "tabular_report",
    renderer: format,
    layout: (document) => document,
    variables: [
      { name: "title", required: true, description: "Título do documento" },
      { name: "columns", required: true, description: "Colunas tabulares do documento" },
    ],
    metadata: {
      owner: "convergia",
      category: "generic",
      description: `Documento tabular genérico, sem regra de domínio, renderizado em ${format}.`,
      regulatoryStatus: "not_applicable",
    },
  };
}

export const genericTabularFormats: ConvergiaOutputFormat[] = ["csv", "json", "markdown", "html", "xlsx", "pptx"];
