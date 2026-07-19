import type { N8nAdapter, N8nTriggerWorkflowInput, N8nTriggerWorkflowOutput } from "../contracts/n8n";

/**
 * Contract-only adapter — no N8N_BASE_URL/N8N_API_KEY exists anywhere in this
 * project's environment yet. Registered as a `disabled` capability (see
 * `n8n-trigger-workflow.ts` manifest) so it is discoverable and never
 * actually invoked until a real n8n instance and implementation land.
 */
export class N8nRestAdapter implements N8nAdapter {
  async triggerWorkflow(_input: N8nTriggerWorkflowInput): Promise<N8nTriggerWorkflowOutput> {
    if (!process.env.N8N_BASE_URL || !process.env.N8N_API_KEY) {
      throw new Error("n8n adapter is not configured (missing N8N_BASE_URL/N8N_API_KEY)");
    }

    throw new Error("n8n adapter has no implementation yet");
  }
}
