import { Router, type IRouter } from "express";
import { GithubRestAdapter } from "./adapters/github-adapter";
import { FilesystemRestAdapter } from "./adapters/filesystem-adapter";
import { GithubReadFileCapability } from "./capabilities/github/read-file";
import { GithubWriteFileCapability } from "./capabilities/github/write-file";
import { GithubCreateBranchCapability } from "./capabilities/github/create-branch";
import { GithubCommitCapability } from "./capabilities/github/commit";
import { GithubCreatePullRequestCapability } from "./capabilities/github/create-pull-request";
import { GithubListBranchesCapability } from "./capabilities/github/list-branches";
import { GithubListPullRequestsCapability } from "./capabilities/github/list-pull-requests";
import { GithubListCommitsCapability } from "./capabilities/github/list-commits";
import { GithubCompareCommitsCapability } from "./capabilities/github/compare-commits";
import { GithubCreateIssueCapability } from "./capabilities/github/create-issue";
import { GithubCommentPullRequestCapability } from "./capabilities/github/comment-pull-request";
import { FilesystemReadCapability } from "./capabilities/filesystem/read";
import { FilesystemWriteCapability } from "./capabilities/filesystem/write";
import { FilesystemListCapability } from "./capabilities/filesystem/list";
import { FilesystemSearchCapability } from "./capabilities/filesystem/search";
import { FilesystemDiffCapability } from "./capabilities/filesystem/diff";
import { FilesystemExistsCapability } from "./capabilities/filesystem/exists";
import { RailwayGetDeploymentStatusCapability } from "./capabilities/railway/get-deployment-status";
import { N8nTriggerWorkflowCapability } from "./capabilities/n8n/trigger-workflow";
import { RailwayRestAdapter } from "./adapters/railway-adapter";
import { N8nRestAdapter } from "./adapters/n8n-adapter";
import type { CapabilityRequest } from "./contracts";
import { CapabilityRegistry } from "./registry/capability-registry";
import { GatewayError } from "./errors/gateway-error";

export function createGatewayRegistry(): CapabilityRegistry {
  const registry = new CapabilityRegistry();
  const github = new GithubRestAdapter();
  const filesystem = new FilesystemRestAdapter();
  const railway = new RailwayRestAdapter();
  const n8n = new N8nRestAdapter();

  registry.register(new GithubReadFileCapability(github));
  registry.register(new GithubWriteFileCapability(github));
  registry.register(new GithubCreateBranchCapability(github));
  registry.register(new GithubCommitCapability(github));
  registry.register(new GithubCreatePullRequestCapability(github));
  registry.register(new GithubListBranchesCapability(github));
  registry.register(new GithubListPullRequestsCapability(github));
  registry.register(new GithubListCommitsCapability(github));
  registry.register(new GithubCompareCommitsCapability(github));
  registry.register(new GithubCreateIssueCapability(github));
  registry.register(new GithubCommentPullRequestCapability(github));

  registry.register(new FilesystemReadCapability(filesystem));
  registry.register(new FilesystemWriteCapability(filesystem));
  registry.register(new FilesystemListCapability(filesystem));
  registry.register(new FilesystemSearchCapability(filesystem));
  registry.register(new FilesystemDiffCapability(filesystem));
  registry.register(new FilesystemExistsCapability(filesystem));

  // Prepared, not live: both registered with manifest status "disabled", so
  // the registry's tested disabled-capability short-circuit guarantees they
  // are discoverable but never actually executed until real credentials and
  // an implementation exist (Prompt 2: "preparar integração... sem alterar
  // funcionalidades existentes").
  registry.register(new RailwayGetDeploymentStatusCapability(railway));
  registry.register(new N8nTriggerWorkflowCapability(n8n));

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
export { FilesystemRestAdapter } from "./adapters/filesystem-adapter";
export { GithubReadFileCapability } from "./capabilities/github/read-file";
export { GithubWriteFileCapability } from "./capabilities/github/write-file";
export { GithubCreateBranchCapability } from "./capabilities/github/create-branch";
export { GithubCommitCapability } from "./capabilities/github/commit";
export { GithubCreatePullRequestCapability } from "./capabilities/github/create-pull-request";
export { GithubListBranchesCapability } from "./capabilities/github/list-branches";
export { GithubListPullRequestsCapability } from "./capabilities/github/list-pull-requests";
export { GithubListCommitsCapability } from "./capabilities/github/list-commits";
export { GithubCompareCommitsCapability } from "./capabilities/github/compare-commits";
export { GithubCreateIssueCapability } from "./capabilities/github/create-issue";
export { GithubCommentPullRequestCapability } from "./capabilities/github/comment-pull-request";
export { FilesystemReadCapability } from "./capabilities/filesystem/read";
export { FilesystemWriteCapability } from "./capabilities/filesystem/write";
export { FilesystemListCapability } from "./capabilities/filesystem/list";
export { FilesystemSearchCapability } from "./capabilities/filesystem/search";
export { FilesystemDiffCapability } from "./capabilities/filesystem/diff";
export { FilesystemExistsCapability } from "./capabilities/filesystem/exists";
export { RailwayRestAdapter } from "./adapters/railway-adapter";
export { N8nRestAdapter } from "./adapters/n8n-adapter";
export { RailwayGetDeploymentStatusCapability } from "./capabilities/railway/get-deployment-status";
export { N8nTriggerWorkflowCapability } from "./capabilities/n8n/trigger-workflow";
export type * from "./contracts";
