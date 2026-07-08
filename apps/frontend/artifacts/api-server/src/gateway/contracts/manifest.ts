import type { CapabilityHealth } from "./health";

export interface CapabilityManifest {
  id: string;
  version: number;
  owner: string;
  status: CapabilityHealth;
  requiresApproval: boolean;
  supportsDryRun: boolean;
  supportsRollback: boolean;
  description: string;
}
