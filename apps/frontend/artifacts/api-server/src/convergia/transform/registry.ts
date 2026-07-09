import { IdentityTransform } from "./identity-transform";
import { SsmaAsoTransform } from "./ssma-aso-transform";
import type { Transform } from "../contracts";

export function createTransformRegistry(): Map<string, Transform> {
  const transforms: Transform[] = [new IdentityTransform(), new SsmaAsoTransform()];
  return new Map(transforms.map((transform) => [transform.id, transform]));
}
