import type { LayoutServerLoad } from "./$types"
import { getPaginationParams } from "$lib/shared/pagination"

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url)
  const searchQuery = url.searchParams.get("search_query")?.trim() ?? ""
  const usersResponse = await locals.apiClient.users.getAll(page, pageSize, searchQuery)

  return {
    usersResponse,
    searchQuery,
  }
}
