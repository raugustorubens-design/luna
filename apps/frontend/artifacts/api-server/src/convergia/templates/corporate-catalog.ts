/**
 * The 13 corporate document types named in Prompt 3. Cataloged here as
 * identifiers/labels so the registry, the API, and the final report all
 * point at the same list — but NONE of them has a real template
 * implementation yet. Certificados, APR, PGR, DDS, Procedimentos and the
 * SSMA/gerencial/estatístico report families are real regulated Brazilian
 * occupational-safety document formats; guessing their structure without a
 * domain specialist's sign-off would produce documents that read as
 * compliant while being wrong, which is worse than not generating them.
 *
 * `regulatoryStatus: "pending_specialist_review"` on every entry is the
 * honest signal: catalogued, not fabricated.
 */
export interface CorporateDocumentCatalogEntry {
  id: string;
  label: string;
  category: "ssma" | "gerencial" | "apresentacao";
}

export const CORPORATE_DOCUMENT_CATALOG: CorporateDocumentCatalogEntry[] = [
  { id: "certificado", label: "Certificado", category: "ssma" },
  { id: "apr", label: "Análise Preliminar de Risco (APR)", category: "ssma" },
  { id: "pgr", label: "Programa de Gerenciamento de Riscos (PGR)", category: "ssma" },
  { id: "dds", label: "Diálogo Diário de Segurança (DDS)", category: "ssma" },
  { id: "procedimento", label: "Procedimento", category: "ssma" },
  { id: "relatorio_ssma", label: "Relatório SSMA", category: "ssma" },
  { id: "relatorio_gerencial", label: "Relatório Gerencial", category: "gerencial" },
  { id: "relatorio_estatistico", label: "Relatório Estatístico", category: "gerencial" },
  { id: "plano_de_acao", label: "Plano de Ação", category: "gerencial" },
  { id: "checklist", label: "Checklist", category: "ssma" },
  { id: "investigacao_incidente", label: "Investigação de Incidente", category: "ssma" },
  { id: "indicadores", label: "Indicadores", category: "gerencial" },
  { id: "apresentacao", label: "Apresentação", category: "apresentacao" },
];
