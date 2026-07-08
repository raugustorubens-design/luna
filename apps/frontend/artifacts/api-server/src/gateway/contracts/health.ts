export const capabilityHealthStates = ["healthy", "degraded", "disabled"] as const;

export type CapabilityHealth = (typeof capabilityHealthStates)[number];

export function isCapabilityHealth(value: unknown): value is CapabilityHealth {
  return typeof value === "string" && capabilityHealthStates.includes(value as CapabilityHealth);
}
