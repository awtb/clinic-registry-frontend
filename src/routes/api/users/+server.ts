import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

const DEFAULT_PAGE_SIZE = 1

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

export const GET: RequestHandler = async ({ url, locals }) => {
  const page = parsePositiveInt(url.searchParams.get("page"), 1)
  const pageSize = parsePositiveInt(url.searchParams.get("page_size"), DEFAULT_PAGE_SIZE)

  const usersResponse = await locals.apiClient.users.getAll(page, pageSize)

  return json(usersResponse.data)
}
