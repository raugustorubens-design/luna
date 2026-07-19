import { z } from "zod";
import type { CanonicalDocument, ValidationIssue, ValidationResult } from "./contracts";

const canonicalFieldSchema = z.object({
  name: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

const canonicalDocumentSchema = z.object({
  title: z.string().min(1, "título não pode ser vazio"),
  columns: z.array(z.string().min(1)).min(1, "documento sem colunas"),
  records: z.array(z.object({ fields: z.array(canonicalFieldSchema) })),
  metadata: z.object({
    sourceFormat: z.enum(["xlsx", "csv", "json"]),
    sourceName: z.string().min(1),
    parsedAt: z.string().min(1),
    recordCount: z.number().int().nonnegative(),
  }),
});

/**
 * Validação stage of the official pipeline — runs after the Canonical Model
 * is built and before any Transformação. Two layers: structural (zod shape)
 * and semantic (business rules that zod alone can't express, e.g. metadata
 * consistency and unknown field names).
 */
export function validateCanonicalDocument(document: CanonicalDocument): ValidationResult {
  const issues: ValidationIssue[] = [];

  const structural = canonicalDocumentSchema.safeParse(document);
  if (!structural.success) {
    for (const issue of structural.error.issues) {
      issues.push({ path: issue.path.join("."), message: issue.message });
    }
    return { valid: false, issues };
  }

  if (document.metadata.recordCount !== document.records.length) {
    issues.push({
      path: "metadata.recordCount",
      message: `metadata.recordCount (${document.metadata.recordCount}) diverge do total real de registros (${document.records.length})`,
    });
  }

  const knownColumns = new Set(document.columns);
  document.records.forEach((record, index) => {
    for (const field of record.fields) {
      if (!knownColumns.has(field.name)) {
        issues.push({
          path: `records[${index}].fields`,
          message: `campo "${field.name}" não está declarado em columns`,
        });
      }
    }
  });

  return { valid: issues.length === 0, issues };
}
