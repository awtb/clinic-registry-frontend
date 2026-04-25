import { createPageSchema } from "$lib/schemas/base"
import {
  ProcedureCreateSchema,
  ProcedureSchema,
  ProcedureUpdateSchema,
} from "$lib/schemas/procedure"
import type { z } from "zod"
import type { buildHttpClient } from "../client"

type Client = ReturnType<typeof buildHttpClient>
const ProcedurePageSchema = createPageSchema(ProcedureSchema)

const buildGetAllProceduresMethod = (client: Client) => {
  return async (
    page: number,
    page_size: number,
    search_query?: string,
    category_id?: string,
    is_active?: boolean,
  ) => {
    const params: Record<string, string | number> = { page, page_size }

    if (search_query && search_query.trim().length > 0) {
      params.search_query = search_query.trim()
    }

    if (category_id && category_id.length > 0) params.category_id = category_id
    if (is_active !== undefined) params.is_active = String(is_active)

    return await client.request({
      path: "procedures/",
      method: "GET",
      params,
      schema: ProcedurePageSchema,
    })
  }
}

const buildGetProcedureByIdMethod = (client: Client) => {
  return async (procedureId: string) => {
    return await client.request({
      path: `procedures/${procedureId}`,
      method: "GET",
      schema: ProcedureSchema,
    })
  }
}

const buildCreateProcedureMethod = (client: Client) => {
  return async (payload: z.infer<typeof ProcedureCreateSchema>) => {
    return await client.request({
      path: "procedures/",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      schema: ProcedureSchema,
    })
  }
}

const buildUpdateProcedureMethod = (client: Client) => {
  return async (procedureId: string, payload: z.infer<typeof ProcedureUpdateSchema>) => {
    return await client.request({
      path: `procedures/${procedureId}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      schema: ProcedureSchema,
    })
  }
}

export const buildProceduresClient = (client: Client) => {
  return {
    getAll: buildGetAllProceduresMethod(client),
    getById: buildGetProcedureByIdMethod(client),
    create: buildCreateProcedureMethod(client),
    update: buildUpdateProcedureMethod(client),
  }
}
