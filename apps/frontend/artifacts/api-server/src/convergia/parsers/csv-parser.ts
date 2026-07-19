import type { CanonicalDocument, CanonicalRecord, ParseResult, Parser } from "../contracts";

/**
 * Minimal RFC-4180-ish CSV parser (quoted fields, escaped quotes, comma
 * delimiter). No new dependency: the format is simple enough that a small
 * hand-rolled parser is both correct and easy to audit end to end — pulling
 * in a CSV library for this would be reaching for a dependency where a
 * deterministic ~30-line function fully solves the problem.
 */
function parseCsvLines(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export class CsvParser implements Parser {
  readonly format = "csv" as const;

  async parse(input: Buffer, sourceName: string): Promise<ParseResult> {
    const warnings: string[] = [];
    const lines = parseCsvLines(input.toString("utf8"));

    if (lines.length === 0) {
      throw new Error("O arquivo CSV está vazio.");
    }

    const columns = lines[0]!.map((header) => header.trim()).filter((header) => header.length > 0);

    const records: CanonicalRecord[] = lines.slice(1).map((line) => ({
      fields: columns.map((name, index) => ({
        name,
        value: line[index] !== undefined && line[index] !== "" ? line[index]! : null,
      })),
    }));

    if (records.some((record) => record.fields.length !== columns.length)) {
      warnings.push("Uma ou mais linhas têm número de colunas diferente do cabeçalho.");
    }

    const document: CanonicalDocument = {
      title: sourceName,
      columns,
      records,
      metadata: {
        sourceFormat: "csv",
        sourceName,
        parsedAt: new Date().toISOString(),
        recordCount: records.length,
      },
    };

    return { document, warnings };
  }
}
