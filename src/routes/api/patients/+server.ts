import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ url, locals, request }) => {
  const payload = await request.json()

  const patientCreateResponse = await locals.apiClient.patients.create(payload)

  return json(patientCreateResponse.data)
}
