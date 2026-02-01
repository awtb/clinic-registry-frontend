import type { LayoutServerLoad } from "../$types"

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const pageParam = Number(url.searchParams.get("page") ?? "1")
  const pageSizeParam = Number(url.searchParams.get("page_size") ?? "10")
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.floor(pageSizeParam) : 1

  const usersResponse = await locals.apiClient.users.getAll(page, pageSize)

  return {
    usersResponse: {
      ok: usersResponse.ok,
      data: usersResponse.ok ? usersResponse.data : null,
    },
  }
}
