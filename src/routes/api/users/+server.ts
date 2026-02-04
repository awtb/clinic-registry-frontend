import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getPaginationParams } from "$lib/shared/pagination"

export const GET: RequestHandler = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url, { page: 1, pageSize: 1 })

  const usersResponse = await locals.apiClient.users.getAll(page, pageSize)

  return json(usersResponse.data)
}

export const POST: RequestHandler = async ({ locals, request }) => {
  const payload = await request.json()
  const userCreateResponse = await locals.apiClient.users.create(payload)

  return json(userCreateResponse.data)
}
