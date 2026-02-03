import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getPaginationParams } from "$lib/shared/pagination"

export const GET: RequestHandler = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url, { page: 1, pageSize: 1 })

  const usersResponse = await locals.apiClient.users.getAll(page, pageSize)

  return json(usersResponse.data)
}
