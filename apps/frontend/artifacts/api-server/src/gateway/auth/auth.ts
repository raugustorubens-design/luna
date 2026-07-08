import type { CapabilityRequest } from "../contracts";

export interface GatewayAuthorizationPolicy {
  authorize(request: CapabilityRequest): Promise<void> | void;
}

export class AllowGatewayAuthorizationPolicy implements GatewayAuthorizationPolicy {
  authorize(_request: CapabilityRequest): void {}
}
