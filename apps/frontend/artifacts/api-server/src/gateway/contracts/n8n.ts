export interface N8nTriggerWorkflowInput {
  workflowId: string;
  payload?: Record<string, unknown>;
}

export interface N8nTriggerWorkflowOutput {
  workflowId: string;
  executionId: string | null;
  status: string;
}

export interface N8nAdapter {
  triggerWorkflow(input: N8nTriggerWorkflowInput): Promise<N8nTriggerWorkflowOutput>;
}
