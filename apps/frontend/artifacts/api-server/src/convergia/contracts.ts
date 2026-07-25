/**
 * Convergia — the organism's transformation-of-information organ.
 *
 * Official pipeline (never skipped, never shortcut):
 *   Entrada → Parser → Modelo Canônico → Validação → Transformação →
 *   Template → Renderer → Resultado
 *
 * The Canonical Model is the one shape every input format converts into and
 * every output format converts out of. No parser is allowed to hand a
 * renderer format-specific data directly — everything crosses through here.
 */

export type ConvergiaInputFormat = "xlsx" | "csv" | "json" | "pptx";

export type ConvergiaOutputFormat = "csv" | "json" | "markdown" | "html" | "xlsx" | "pptx";

export interface CanonicalField {
  name: string;
  value: string | number | boolean | null;
}

export interface CanonicalRecord {
  fields: CanonicalField[];
}

export interface CanonicalDocumentMetadata {
  sourceFormat: ConvergiaInputFormat;
  sourceName: string;
  parsedAt: string;
  recordCount: number;
}

/**
 * The Canonical Model. Deliberately flat and tabular for the MVP input set
 * (XLSX/CSV/JSON are all naturally record-oriented) — a `sections`/tree shape
 * for document-oriented sources (DOCX/PDF) is a real future extension point,
 * not implemented here (see `docs` in the parser registry for why).
 */
export interface CanonicalDocument {
  title: string;
  columns: string[];
  records: CanonicalRecord[];
  metadata: CanonicalDocumentMetadata;
}

export interface ParseResult {
  document: CanonicalDocument;
  warnings: string[];
}

export interface Parser {
  readonly format: ConvergiaInputFormat;
  parse(input: Buffer, sourceName: string): Promise<ParseResult>;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export interface TransformResult {
  document: CanonicalDocument;
  notes: string[];
}

export interface Transform {
  readonly id: string;
  apply(document: CanonicalDocument): Promise<TransformResult>;
}

export interface TemplateVariable {
  name: string;
  required: boolean;
  description: string;
}

export type TemplateType = "tabular_report" | "certificate" | "procedure" | "presentation";

export interface TemplateMetadata {
  owner: string;
  category: string;
  description: string;
  regulatoryStatus: "validated" | "pending_specialist_review" | "not_applicable";
}

/**
 * Every template carries: identificador, versão, tipo, renderer, layout,
 * variáveis, metadados — the exact fields Prompt 3 requires.
 */
export interface TemplateDescriptor {
  id: string;
  version: number;
  type: TemplateType;
  renderer: ConvergiaOutputFormat;
  layout: (document: CanonicalDocument) => CanonicalDocument;
  variables: TemplateVariable[];
  metadata: TemplateMetadata;
}

export interface RenderResult {
  format: ConvergiaOutputFormat;
  filename: string;
  mimeType: string;
  content: Buffer | string;
}

export interface Renderer {
  readonly format: ConvergiaOutputFormat;
  render(document: CanonicalDocument, template: TemplateDescriptor): Promise<RenderResult>;
}
