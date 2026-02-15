import { json } from "@sveltejs/kit"
import type { RequestHandler, RequestHandler } from "./$types"
import { getPaginationParams } from "$lib/shared/pagination"

export const POST: RequestHandler = async ({ url, locals, request }) => {
  const payload = await request.json()

  const patientCreateResponse = await locals.apiClient.patients.create(payload)

  return json(patientCreateResponse.data)
}

export const GET: RequestHandler = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url)
  const patientsResponse = await locals.apiClient.patients.getAll(page, pageSize)

  return json(patientsResponse.data)
}
