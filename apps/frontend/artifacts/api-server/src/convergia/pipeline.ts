import { createParserRegistry } from "./parsers/registry";
import { createTransformRegistry } from "./transform/registry";
import { createTemplateRegistry, TemplateRegistry } from "./templates/registry";
import { createRendererRegistry } from "./renderers/registry";
import { validateCanonicalDocument } from "./validation";
import { ConvergiaValidationError } from "./errors";
import type {
  CanonicalDocument,
  ConvergiaInputFormat,
  Parser,
  Renderer,
  RenderResult,
  Transform,
  ValidationResult,
} from "./contracts";

export interface ConvergiaPipelineInput {
  file: Buffer;
  sourceName: string;
  inputFormat: ConvergiaInputFormat;
  templateId: string;
  templateVersion?: number;
  transformId?: string;
}

export interface ConvergiaPipelineResult {
  canonicalDocument: CanonicalDocument;
  validation: ValidationResult;
  transformNotes: string[];
  parseWarnings: string[];
  render: RenderResult;
}

/**
 * The official pipeline, and only entry point for turning raw input into a
 * rendered artifact:
 *
 *   Entrada → Parser → Modelo Canônico → Validação → Transformação →
 *   Template → Renderer → Resultado
 *
 * There is deliberately no shortcut from Parser straight to Renderer — every
 * call to `run()` walks every stage in order.
 */
export class ConvergiaPipeline {
  constructor(
    private readonly parsers: Map<ConvergiaInputFormat, Parser> = createParserRegistry(),
    private readonly transforms: Map<string, Transform> = createTransformRegistry(),
    private readonly templates: TemplateRegistry = createTemplateRegistry(),
    private readonly renderers: Map<string, Renderer> = createRendererRegistry(),
  ) {}

  async run(input: ConvergiaPipelineInput): Promise<ConvergiaPipelineResult> {
    // Parser
    const parser = this.parsers.get(input.inputFormat);
    if (!parser) {
      throw new Error(`Nenhum parser registrado para o formato de entrada "${input.inputFormat}".`);
    }
    const { document: canonicalDocument, warnings: parseWarnings } = await parser.parse(
      input.file,
      input.sourceName,
    );

    // Validação (of the Modelo Canônico, before any transformação is applied)
    const validation = validateCanonicalDocument(canonicalDocument);
    if (!validation.valid) {
      throw new ConvergiaValidationError(validation.issues);
    }

    // Transformação
    const transformId = input.transformId ?? "identity";
    const transform = this.transforms.get(transformId);
    if (!transform) {
      throw new Error(`Transformação "${transformId}" não está registrada.`);
    }
    const { document: transformedDocument, notes: transformNotes } = await transform.apply(canonicalDocument);

    // Template
    const template = this.templates.resolve(input.templateId, input.templateVersion);

    // Renderer
    const renderer = this.renderers.get(template.renderer);
    if (!renderer) {
      throw new Error(`Nenhum renderer registrado para o formato "${template.renderer}".`);
    }

    // Resultado
    const render = await renderer.render(transformedDocument, template);

    return { canonicalDocument: transformedDocument, validation, transformNotes, parseWarnings, render };
  }

  /** Parser → Modelo Canônico → Validação only — never renders a document. */
  async parseOnly(
    file: Buffer,
    sourceName: string,
    inputFormat: ConvergiaInputFormat,
  ): Promise<{ document: CanonicalDocument; validation: ValidationResult; warnings: string[] }> {
    const parser = this.parsers.get(inputFormat);
    if (!parser) {
      throw new Error(`Nenhum parser registrado para o formato de entrada "${inputFormat}".`);
    }
    const { document, warnings } = await parser.parse(file, sourceName);
    const validation = validateCanonicalDocument(document);
    return { document, validation, warnings };
  }

  listTemplates() {
    return this.templates.list();
  }
}
