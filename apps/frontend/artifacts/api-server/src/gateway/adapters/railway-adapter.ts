import type { RailwayAdapter, RailwayGetDeploymentStatusInput, RailwayGetDeploymentStatusOutput } from "../contracts/railway";

/**
 * Contract-only adapter — no RAILWAY_TOKEN exists anywhere in this project's
 * environment yet. Registered as a `disabled` capability (see
 * `railway-get-deployment-status.ts` manifest) so it is discoverable and
 * never actually invoked until a real token and implementation land.
 */
export class RailwayRestAdapter implements RailwayAdapter {
  async getDeploymentStatus(_input: RailwayGetDeploymentStatusInput): Promise<RailwayGetDeploymentStatusOutput> {
    if (!process.env.RAILWAY_TOKEN) {
      throw new Error("railway adapter is not configured (missing RAILWAY_TOKEN)");
    }

    throw new Error("railway adapter has no implementation yet");
  }
}
