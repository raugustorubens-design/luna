export interface RailwayGetDeploymentStatusInput {
  serviceId: string;
}

export interface RailwayGetDeploymentStatusOutput {
  serviceId: string;
  status: string;
  deployedAt: string | null;
  url: string | null;
}

export interface RailwayAdapter {
  getDeploymentStatus(input: RailwayGetDeploymentStatusInput): Promise<RailwayGetDeploymentStatusOutput>;
}
