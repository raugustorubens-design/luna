import assert from "node:assert/strict";
import test from "node:test";
import { RailwayDeployCapability } from "../capabilities/railway/deploy";
import { RailwayListServicesCapability } from "../capabilities/railway/list-services";
import { RailwayLogsCapability } from "../capabilities/railway/logs";
import { RailwayRestartServiceCapability } from "../capabilities/railway/restart-service";
import { RailwayStatusCapability } from "../capabilities/railway/status";
import { RailwayVariablesCapability } from "../capabilities/railway/variables";
import type {
  RailwayAdapter,
  RailwayDeployInput,
  RailwayDeployOutput,
  RailwayListServicesInput,
  RailwayListServicesOutput,
  RailwayLogsInput,
  RailwayLogsOutput,
  RailwayRestartServiceInput,
  RailwayRestartServiceOutput,
  RailwayStatusInput,
  RailwayStatusOutput,
  RailwayVariablesInput,
  RailwayVariablesOutput,
} from "../contracts";
import { CapabilityRegistry } from "../registry/capability-registry";

class StubRailwayAdapter implements RailwayAdapter {
  async deploy(input: RailwayDeployInput): Promise<RailwayDeployOutput> {
    return { deploymentId: "dep_1", serviceId: input.serviceId, environmentId: input.environmentId, status: "QUEUED" };
  }

  async listServices(input: RailwayListServicesInput): Promise<RailwayListServicesOutput> {
    return { projectId: input.projectId, services: [{ id: "svc_1", name: "api" }] };
  }

  async status(input: RailwayStatusInput): Promise<RailwayStatusOutput> {
    return { serviceId: input.serviceId, environmentId: input.environmentId, status: "SUCCESS", latestDeploymentId: "dep_1" };
  }

  async logs(input: RailwayLogsInput): Promise<RailwayLogsOutput> {
    return { deploymentId: input.deploymentId, logs: [{ timestamp: new Date().toISOString(), message: "started" }] };
  }

  async variables(input: RailwayVariablesInput): Promise<RailwayVariablesOutput> {
    return { serviceId: input.serviceId, environmentId: input.environmentId, variables: { NODE_ENV: "production" } };
  }

  async restartService(input: RailwayRestartServiceInput): Promise<RailwayRestartServiceOutput> {
    return { serviceId: input.serviceId, environmentId: input.environmentId, restarted: true };
  }
}

test("railway.deploy requires approval", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new RailwayDeployCapability(new StubRailwayAdapter()));

  const denied = await registry.execute({ capability: "railway.deploy", input: { serviceId: "s", environmentId: "e" } });
  assert.equal(denied.error?.code, "APPROVAL_REQUIRED");

  const approved = await registry.execute({
    capability: "railway.deploy",
    input: { serviceId: "s", environmentId: "e" },
    context: { metadata: { approval: true } },
  });
  assert.equal(approved.success, true);
  assert.equal((approved.output as RailwayDeployOutput).deploymentId, "dep_1");
});

test("railway.restart_service requires approval", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new RailwayRestartServiceCapability(new StubRailwayAdapter()));

  const denied = await registry.execute({ capability: "railway.restart_service", input: { serviceId: "s", environmentId: "e" } });
  assert.equal(denied.error?.code, "APPROVAL_REQUIRED");
});

test("railway read-only capabilities execute without approval", async () => {
  const registry = new CapabilityRegistry();
  registry.register(new RailwayListServicesCapability(new StubRailwayAdapter()));
  registry.register(new RailwayStatusCapability(new StubRailwayAdapter()));
  registry.register(new RailwayLogsCapability(new StubRailwayAdapter()));
  registry.register(new RailwayVariablesCapability(new StubRailwayAdapter()));

  const services = await registry.execute({ capability: "railway.list_services", input: { projectId: "p" } });
  assert.equal(services.success, true);
  assert.equal((services.output as RailwayListServicesOutput).services.length, 1);

  const status = await registry.execute({ capability: "railway.status", input: { serviceId: "s", environmentId: "e" } });
  assert.equal((status.output as RailwayStatusOutput).status, "SUCCESS");

  const logs = await registry.execute({ capability: "railway.logs", input: { deploymentId: "dep_1" } });
  assert.equal((logs.output as RailwayLogsOutput).logs.length, 1);

  const variables = await registry.execute({ capability: "railway.variables", input: { serviceId: "s", environmentId: "e" } });
  assert.deepEqual((variables.output as RailwayVariablesOutput).variables, { NODE_ENV: "production" });
});
