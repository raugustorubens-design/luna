import type { CanonicalDocument, Transform, TransformResult } from "../contracts";

/** No-op transform — used when a template needs the parsed data as-is. */
export class IdentityTransform implements Transform {
  readonly id = "identity";

  async apply(document: CanonicalDocument): Promise<TransformResult> {
    return { document, notes: [] };
  }
}
