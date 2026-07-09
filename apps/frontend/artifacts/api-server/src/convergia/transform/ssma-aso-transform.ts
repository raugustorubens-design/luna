import type { CanonicalDocument, Transform, TransformResult } from "../contracts";

/**
 * The exact business rule `luna-convergia`'s original `upload-excel` route
 * enforced: a spreadsheet of ASO (Atestado de Saúde Ocupacional) records is
 * only meaningful once normalized to the four expected SSMA columns — RE,
 * Nome, CPF, Data ASO. That rule belonged in the parser before; it belongs
 * in the Transformação stage now, so the parser stays generic and this rule
 * stays inspectable/testable on its own.
 */
const EXPECTED_COLUMNS = ["RE", "Nome", "CPF", "Data ASO"];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(new RegExp("[\u0300-\u036f]", "g"), "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export class SsmaAsoTransform implements Transform {
  readonly id = "ssma_aso_normalize";

  async apply(document: CanonicalDocument): Promise<TransformResult> {
    const notes: string[] = [];
    const normalizedColumns = new Map(document.columns.map((column) => [normalize(column), column]));

    const columnMap = EXPECTED_COLUMNS.map((expected) => {
      const sourceColumn = normalizedColumns.get(normalize(expected));
      if (!sourceColumn) {
        notes.push(`Coluna esperada "${expected}" não encontrada na origem.`);
      }
      return { expected, sourceColumn };
    });

    const records = document.records
      .map((record) => ({
        fields: columnMap.map(({ expected, sourceColumn }) => ({
          name: expected,
          value: sourceColumn ? (record.fields.find((field) => field.name === sourceColumn)?.value ?? null) : null,
        })),
      }))
      .filter((record) => record.fields.some((field) => field.value !== null && String(field.value).trim() !== ""));

    const transformed: CanonicalDocument = {
      title: document.title,
      columns: EXPECTED_COLUMNS,
      records,
      metadata: {
        ...document.metadata,
        recordCount: records.length,
      },
    };

    return { document: transformed, notes };
  }
}
