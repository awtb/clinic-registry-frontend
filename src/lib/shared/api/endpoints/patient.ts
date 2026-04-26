import { createPageSchema } from "$lib/schemas/base"
import { PatientSchema, PatientCreateSchema, PatientUpdateSchema } from "$lib/schemas/patient"
import type { z } from "zod"
import type { buildHttpClient } from "../client"

type Client = ReturnType<typeof buildHttpClient>
type PatientUpdate = z.infer<typeof PatientUpdateSchema>
const PatientPageSchema = createPageSchema(PatientSchema)

const buildGetAllPatientsMethod = (httpClient: Client) => {
  return async (
    page: number,
    page_size: number,
    search_query?: string,
    opts?: { signal?: AbortSignal },
  ) => {
    const params: Record<string, string | number> = {
      page,
      page_size,
    }

    if (search_query && search_query.trim().length > 0) {
      params.search_query = search_query.trim()
    }

    return await httpClient.request({
      path: "patients/",
      method: "GET",
      params,
      schema: PatientPageSchema,
      signal: opts?.signal,
    })
  }
}

const buildCreatePatientMethod = (httpClient: Client) => {
  return async (payload: z.infer<typeof PatientCreateSchema>) => {
    return await httpClient.request({
      path: "patients/",
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      schema: PatientSchema,
    })
  }
}

const buildUpdatePatientMethod = (httpClient: Client) => {
  return async (patientId: string, payload: PatientUpdate) => {
    return await httpClient.request({
      path: `patients/${patientId}`,
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      schema: PatientSchema,
    })
  }
}

export const buildPatientsClient = (httpClient: ReturnType<typeof buildHttpClient>) => {
  return {
    getAll: buildGetAllPatientsMethod(httpClient),
    create: buildCreatePatientMethod(httpClient),
    update: buildUpdatePatientMethod(httpClient),
  }
}
