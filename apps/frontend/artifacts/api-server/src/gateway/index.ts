import { Router, type IRouter } from "express";
import { GithubRestAdapter } from "./adapters/github-adapter";
import { GithubReadFileCapability } from "./capabilities/github/read-file";
import type { CapabilityRequest } from "./contracts";
import { CapabilityRegistry } from "./registry/capability-registry";
import { GatewayError } from "./errors/gateway-error";

export function createGatewayRegistry(): CapabilityRegistry {
  const registry = new CapabilityRegistry();
  registry.register(new GithubReadFileCapability(new GithubRestAdapter()));
  return registry;
}

export function createGatewayRouter(registry = createGatewayRegistry()): IRouter {
  const router: IRouter = Router();

  router.get("/gateway/capabilities", (_req, res) => {
    res.json({ capabilities: registry.discover() });
  });

  router.post("/gateway/execute", async (req, res): Promise<void> => {
    try {
      const request = req.body as CapabilityRequest;
      const result = await registry.execute(request);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      const status = error instanceof GatewayError && error.code === "CAPABILITY_NOT_FOUND" ? 404 : 400;
      res.status(status).json({
        success: false,
        error: {
          code: error instanceof GatewayError ? error.code : "GATEWAY_EXECUTION_FAILED",
          message: error instanceof Error ? error.message : "Unknown gateway error",
          details: error instanceof GatewayError ? error.details : undefined,
        },
      });
    }
  });

  return router;
}

export { CapabilityRegistry } from "./registry/capability-registry";
export { GithubRestAdapter } from "./adapters/github-adapter";
export { GithubReadFileCapability } from "./capabilities/github/read-file";
export type * from "./contracts";
