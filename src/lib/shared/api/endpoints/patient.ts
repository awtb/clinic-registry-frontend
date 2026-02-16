import { createPageSchema } from "$lib/schemas/base"
import { PatientSchema, PatientCreateSchema } from "$lib/schemas/patient"
import type { z } from "zod"
import type { buildHttpClient } from "../client"

type Client = ReturnType<typeof buildHttpClient>
const PatientPageSchema = createPageSchema(PatientSchema)

const buildGetAllPatientsMethod = (httpClient: Client) => {
  return async (page: number, page_size: number) => {
    return await httpClient.request({
      path: "patients/",
      method: "GET",
      params: {
        page,
        page_size,
      },
      schema: PatientPageSchema,
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

export const buildPatientsClient = (httpClient: ReturnType<typeof buildHttpClient>) => {
  return {
    getAll: buildGetAllPatientsMethod(httpClient),
    create: buildCreatePatientMethod(httpClient),
  }
}
