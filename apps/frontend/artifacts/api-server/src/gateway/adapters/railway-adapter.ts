import { GatewayError } from "../errors/gateway-error";
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

interface GraphqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export class RailwayGraphqlAdapter implements RailwayAdapter {
  constructor(
    private readonly token = process.env.RAILWAY_TOKEN,
    private readonly endpoint = "https://backboard.railway.app/graphql/v2",
  ) {}

  private async request<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    if (!this.token) {
      throw new GatewayError("RAILWAY_TOKEN_MISSING", "RAILWAY_TOKEN environment variable is required");
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new GatewayError("RAILWAY_REQUEST_FAILED", `Railway API request failed with status ${response.status}`, await response.text());
    }

    const payload = (await response.json()) as GraphqlResponse<T>;

    if (payload.errors?.length) {
      throw new GatewayError("RAILWAY_GRAPHQL_ERROR", payload.errors.map((error) => error.message).join("; "), payload.errors);
    }

    if (!payload.data) {
      throw new GatewayError("RAILWAY_EMPTY_RESPONSE", "Railway API returned no data");
    }

    return payload.data;
  }

  async deploy(input: RailwayDeployInput): Promise<RailwayDeployOutput> {
    const data = await this.request<{ serviceInstanceDeploy: { id: string; status: string } }>(
      `mutation ServiceInstanceDeploy($serviceId: String!, $environmentId: String!, $commitSha: String) {
        serviceInstanceDeploy(serviceId: $serviceId, environmentId: $environmentId, commitSha: $commitSha) {
          id
          status
        }
      }`,
      { serviceId: input.serviceId, environmentId: input.environmentId, commitSha: input.commitSha },
    );

    return {
      deploymentId: data.serviceInstanceDeploy.id,
      serviceId: input.serviceId,
      environmentId: input.environmentId,
      status: data.serviceInstanceDeploy.status,
    };
  }

  async listServices(input: RailwayListServicesInput): Promise<RailwayListServicesOutput> {
    const data = await this.request<{ project: { services: { edges: { node: { id: string; name: string; updatedAt?: string } }[] } } }>(
      `query ProjectServices($projectId: String!) {
        project(id: $projectId) {
          services {
            edges {
              node {
                id
                name
                updatedAt
              }
            }
          }
        }
      }`,
      { projectId: input.projectId },
    );

    return {
      projectId: input.projectId,
      services: data.project.services.edges.map((edge) => ({
        id: edge.node.id,
        name: edge.node.name,
        updatedAt: edge.node.updatedAt,
      })),
    };
  }

  async status(input: RailwayStatusInput): Promise<RailwayStatusOutput> {
    const data = await this.request<{ deployments: { edges: { node: { id: string; status: string } }[] } }>(
      `query DeploymentStatus($serviceId: String!, $environmentId: String!) {
        deployments(input: { serviceId: $serviceId, environmentId: $environmentId }, first: 1) {
          edges {
            node {
              id
              status
            }
          }
        }
      }`,
      { serviceId: input.serviceId, environmentId: input.environmentId },
    );

    const latest = data.deployments.edges[0]?.node;

    return {
      serviceId: input.serviceId,
      environmentId: input.environmentId,
      status: latest?.status ?? "UNKNOWN",
      latestDeploymentId: latest?.id,
    };
  }

  async logs(input: RailwayLogsInput): Promise<RailwayLogsOutput> {
    const data = await this.request<{ deploymentLogs: { timestamp: string; message: string; severity?: string }[] }>(
      `query DeploymentLogs($deploymentId: String!, $limit: Int) {
        deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
          timestamp
          message
          severity
        }
      }`,
      { deploymentId: input.deploymentId, limit: input.limit ?? 100 },
    );

    return { deploymentId: input.deploymentId, logs: data.deploymentLogs };
  }

  async variables(input: RailwayVariablesInput): Promise<RailwayVariablesOutput> {
    const data = await this.request<{ variables: Record<string, string> }>(
      `query ServiceVariables($serviceId: String!, $environmentId: String!) {
        variables(serviceId: $serviceId, environmentId: $environmentId)
      }`,
      { serviceId: input.serviceId, environmentId: input.environmentId },
    );

    return { serviceId: input.serviceId, environmentId: input.environmentId, variables: data.variables };
  }

  async restartService(input: RailwayRestartServiceInput): Promise<RailwayRestartServiceOutput> {
    const data = await this.request<{ serviceInstanceRestart: boolean }>(
      `mutation ServiceInstanceRestart($serviceId: String!, $environmentId: String!) {
        serviceInstanceRestart(serviceId: $serviceId, environmentId: $environmentId)
      }`,
      { serviceId: input.serviceId, environmentId: input.environmentId },
    );

    return { serviceId: input.serviceId, environmentId: input.environmentId, restarted: data.serviceInstanceRestart };
  }
}
