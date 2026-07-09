import type { ValidationIssue } from "./contracts";

export class ConvergiaValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(`Documento reprovado na validação (${issues.length} problema(s)).`);
    this.name = "ConvergiaValidationError";
    this.issues = issues;
  }
}
