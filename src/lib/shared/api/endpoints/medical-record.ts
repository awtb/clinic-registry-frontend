import { createPageSchema } from "$lib/schemas/base"
import {
  MedicalRecordCreateSchema,
  MedicalRecordSchema,
  MedicalRecordUpdateSchema,
} from "$lib/schemas/medical-record"
import type { buildHttpClient } from "$lib/shared/api/client"
import type { z } from "zod"

const MedicalRecordPageSchema = createPageSchema(MedicalRecordSchema)

type Client = ReturnType<typeof buildHttpClient>

const buildGetAllMedicalRecordsMethod = (client: Client) => {
  return async (page: number, page_size: number, opts?: { signal?: AbortSignal }) => {
    return await client.request({
      path: "medical-records",
      method: "GET",
      params: { page, page_size },
      schema: MedicalRecordPageSchema,
      signal: opts?.signal,
    })
  }
}

const buildGetMedicalRecordByIdMethod = (client: Client) => {
  return async (medicalRecordId: string) => {
    return await client.request({
      path: `medical-records/${medicalRecordId}`,
      method: "GET",
      schema: MedicalRecordSchema,
    })
  }
}

const buildCreateMedicalRecordMethod = (client: Client) => {
  return async (payload: z.infer<typeof MedicalRecordCreateSchema>) => {
    return await client.request({
      path: "medical-records",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      schema: MedicalRecordSchema,
    })
  }
}

const buildUpdateMedicalRecordMethod = (client: Client) => {
  return async (medicalRecordId: string, payload: z.infer<typeof MedicalRecordUpdateSchema>) => {
    return await client.request({
      path: `medical-records/${medicalRecordId}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      schema: MedicalRecordSchema,
    })
  }
}

export const buildMedicalRecordsClient = (client: Client) => {
  return {
    getAll: buildGetAllMedicalRecordsMethod(client),
    getById: buildGetMedicalRecordByIdMethod(client),
    create: buildCreateMedicalRecordMethod(client),
    update: buildUpdateMedicalRecordMethod(client),
  }
}
