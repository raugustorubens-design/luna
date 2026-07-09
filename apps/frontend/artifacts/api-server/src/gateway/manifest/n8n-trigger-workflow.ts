import type { CapabilityManifest } from "../contracts";

export const n8nTriggerWorkflowManifest: CapabilityManifest = {
  id: "n8n.trigger_workflow",
  version: 1,
  owner: "gateway",
  status: "disabled",
  requiresApproval: true,
  supportsDryRun: true,
  supportsRollback: false,
  description:
    "Prepared contract for triggering an n8n workflow. Disabled: no n8n instance, credentials, or adapter implementation exists yet.",
};
