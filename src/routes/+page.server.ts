import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
  const dashboardResponse = await locals.apiClient.dashboard.getOverview()

  return {
    dashboardResponse,
  }
}
