import type { CanonicalDocument, CanonicalRecord, ParseResult, Parser } from "../contracts";

type JsonPrimitive = string | number | boolean | null;
type JsonRecordShape = Record<string, JsonPrimitive>;

function isJsonRecordShape(value: unknown): value is JsonRecordShape {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCanonicalRecord(entry: JsonRecordShape, columns: string[]): CanonicalRecord {
  return {
    fields: columns.map((name) => {
      const raw = entry[name];
      const value =
        raw === undefined
          ? null
          : typeof raw === "object" && raw !== null
            ? JSON.stringify(raw)
            : (raw as JsonPrimitive);
      return { name, value };
    }),
  };
}

export class JsonParser implements Parser {
  readonly format = "json" as const;

  async parse(input: Buffer, sourceName: string): Promise<ParseResult> {
    const warnings: string[] = [];
    let parsed: unknown;

    try {
      parsed = JSON.parse(input.toString("utf8"));
    } catch (error) {
      throw new Error(`JSON inválido: ${error instanceof Error ? error.message : "erro de parsing"}`);
    }

    const entries: JsonRecordShape[] = Array.isArray(parsed)
      ? parsed.filter((item): item is JsonRecordShape => {
          if (isJsonRecordShape(item)) return true;
          warnings.push("Um item da lista não é um objeto e foi ignorado.");
          return false;
        })
      : isJsonRecordShape(parsed)
        ? [parsed]
        : [];

    if (entries.length === 0 && !Array.isArray(parsed) && !isJsonRecordShape(parsed)) {
      throw new Error("O JSON deve ser um objeto ou uma lista de objetos.");
    }

    const columns = [...new Set(entries.flatMap((entry) => Object.keys(entry)))];
    const records = entries.map((entry) => toCanonicalRecord(entry, columns));

    const document: CanonicalDocument = {
      title: sourceName,
      columns,
      records,
      metadata: {
        sourceFormat: "json",
        sourceName,
        parsedAt: new Date().toISOString(),
        recordCount: records.length,
      },
    };

    return { document, warnings };
  }
}
