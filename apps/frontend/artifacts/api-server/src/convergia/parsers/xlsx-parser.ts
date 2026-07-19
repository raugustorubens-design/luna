import ExcelJS from "exceljs";
import type { CanonicalDocument, CanonicalRecord, ParseResult, Parser } from "../contracts";

/**
 * Evolved from the real parsing logic in `luna-convergia`'s
 * `POST /api/documents/upload-excel` (header normalization, cell-value
 * coercion for dates/formulas/rich text). That version hardcoded the four
 * expected SSMA/ASO columns (RE, Nome, CPF, Data ASO); this generalizes to
 * whatever headers the first row actually contains, and the ASO-specific
 * column expectations move to `transform/ssma-aso-transform.ts` — parsing
 * and domain rules are different responsibilities in the official pipeline.
 */

function formatCellValue(cell: ExcelJS.Cell): string | number | boolean | null {
  const value = cell.value;

  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "object") {
    if ("result" in value) {
      return (value.result as string | number | null) ?? null;
    }
    if ("text" in value) {
      return (value as { text?: string }).text ?? null;
    }
    if ("richText" in value && Array.isArray((value as { richText?: unknown[] }).richText)) {
      return (value as { richText: { text: string }[] }).richText.map((part) => part.text).join("");
    }
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") {
    return value;
  }

  return cell.text ?? null;
}

export class XlsxParser implements Parser {
  readonly format = "xlsx" as const;

  async parse(input: Buffer, sourceName: string): Promise<ParseResult> {
    const warnings: string[] = [];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(input as unknown as ExcelJS.Buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("A planilha não possui abas para leitura.");
    }

    const headerRow = worksheet.getRow(1);
    const columns: string[] = [];
    headerRow.eachCell((cell, columnNumber) => {
      const header = String(cell.text ?? "").trim();
      if (header.length === 0) {
        warnings.push(`Coluna ${columnNumber} sem cabeçalho foi ignorada.`);
        return;
      }
      columns[columnNumber - 1] = header;
    });

    const rows = worksheet.getRows(2, Math.max(worksheet.rowCount - 1, 0)) ?? [];
    const records: CanonicalRecord[] = rows
      .map((row) => ({
        fields: columns
          .map((name, index) => (name ? { name, value: formatCellValue(row.getCell(index + 1)) } : null))
          .filter((field): field is { name: string; value: string | number | boolean | null } => field !== null),
      }))
      .filter((record) => record.fields.some((field) => field.value !== null && String(field.value).trim() !== ""));

    const document: CanonicalDocument = {
      title: sourceName,
      columns: columns.filter((c): c is string => Boolean(c)),
      records,
      metadata: {
        sourceFormat: "xlsx",
        sourceName,
        parsedAt: new Date().toISOString(),
        recordCount: records.length,
      },
    };

    return { document, warnings };
  }
}
