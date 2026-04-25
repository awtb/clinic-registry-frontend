import type { LayoutServerLoad } from "./$types"
import { getPaginationParams } from "$lib/shared/pagination"

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url)
  const searchQuery = url.searchParams.get("search_query")?.trim() ?? ""

  const procedureCategoriesResponse = await locals.apiClient.procedureCategories.getAll(
    page,
    pageSize,
    searchQuery,
  )

  return {
    procedureCategoriesResponse,
    searchQuery,
  }
}
