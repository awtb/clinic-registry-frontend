import type { LayoutServerLoad } from "../$types"

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const usersResponse = await locals.apiClient.users.getAll(1, 100)

  return {
    usersResponse,
  }
}
