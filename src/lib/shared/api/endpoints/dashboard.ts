import { DashboardOverviewSchema } from "$lib/schemas/dashboard"
import type { buildHttpClient } from "$lib/shared/api/client"

type Client = ReturnType<typeof buildHttpClient>

const buildGetDashboardOverviewMethod = (client: Client) => {
  return async () => {
    return await client.request({
      path: "dashboard/",
      method: "GET",
      schema: DashboardOverviewSchema,
    })
  }
}

export const buildDashboardClient = (client: Client) => {
  return {
    getOverview: buildGetDashboardOverviewMethod(client),
  }
}
