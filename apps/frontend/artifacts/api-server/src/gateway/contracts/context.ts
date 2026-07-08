export interface GatewayActor {
  id: string;
  type: "user" | "system" | "service";
}

export interface GatewayExecutionContext {
  requestId?: string;
  actor?: GatewayActor;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export interface ContextSyncCheckpoint {
  id: string;
  createdAt: string;
  cognitiveIndexRef: string;
  metadata?: Record<string, unknown>;
}

export interface ContextSyncPort {
  syncCheckpoint(checkpoint: ContextSyncCheckpoint): Promise<void>;
}
