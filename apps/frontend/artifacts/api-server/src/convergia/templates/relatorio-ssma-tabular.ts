import type { TemplateDescriptor } from "../contracts";

/**
 * The one template shipped in this pass. It is deliberately generic
 * (tabular passthrough) rather than a stand-in for any of the 13 named
 * corporate document types (Certificados, APR, PGR, DDS, etc.) — those are
 * real Brazilian occupational-safety regulatory formats, and fabricating
 * their structure without a domain specialist's input would ship
 * confidently wrong compliance documents. See the final report's
 * "pendências" section for the explicit list and why each is deferred.
 */
export const relatorioSsmaTabularTemplate: TemplateDescriptor = {
  id: "relatorio_ssma_tabular",
  version: 1,
  type: "tabular_report",
  renderer: "xlsx",
  layout: (document) => document,
  variables: [
    { name: "title", required: true, description: "Título do relatório" },
    { name: "columns", required: true, description: "Colunas tabulares do relatório" },
  ],
  metadata: {
    owner: "convergia",
    category: "ssma",
    description: "Relatório tabular genérico para dados de SSMA já normalizados (ex.: registros de ASO).",
    regulatoryStatus: "not_applicable",
  },
};
