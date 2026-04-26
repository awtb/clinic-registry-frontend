import { createPageSchema } from "$lib/schemas/base"
import {
  ProcedureCategoryCreateSchema,
  ProcedureCategorySchema,
  ProcedureCategoryUpdateSchema,
} from "$lib/schemas/procedure-category"
import type { z } from "zod"
import type { buildHttpClient } from "../client"

type Client = ReturnType<typeof buildHttpClient>
const ProcedureCategoryPageSchema = createPageSchema(ProcedureCategorySchema)

const buildGetAllProcedureCategoriesMethod = (client: Client) => {
  return async (
    page: number,
    page_size: number,
    search_query?: string,
    is_active?: boolean,
    opts?: { signal?: AbortSignal },
  ) => {
    const params: Record<string, string | number> = { page, page_size }

    if (search_query && search_query.trim().length > 0) {
      params.search_query = search_query.trim()
    }

    if (is_active !== undefined) params.is_active = String(is_active)

    return await client.request({
      path: "procedure-categories/",
      method: "GET",
      params,
      schema: ProcedureCategoryPageSchema,
      signal: opts?.signal,
    })
  }
}

const buildGetProcedureCategoryByIdMethod = (client: Client) => {
  return async (categoryId: string) => {
    return await client.request({
      path: `procedure-categories/${categoryId}`,
      method: "GET",
      schema: ProcedureCategorySchema,
    })
  }
}

const buildCreateProcedureCategoryMethod = (client: Client) => {
  return async (payload: z.infer<typeof ProcedureCategoryCreateSchema>) => {
    return await client.request({
      path: "procedure-categories/",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      schema: ProcedureCategorySchema,
    })
  }
}

const buildUpdateProcedureCategoryMethod = (client: Client) => {
  return async (categoryId: string, payload: z.infer<typeof ProcedureCategoryUpdateSchema>) => {
    return await client.request({
      path: `procedure-categories/${categoryId}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      schema: ProcedureCategorySchema,
    })
  }
}

export const buildProcedureCategoriesClient = (client: Client) => {
  return {
    getAll: buildGetAllProcedureCategoriesMethod(client),
    getById: buildGetProcedureCategoryByIdMethod(client),
    create: buildCreateProcedureCategoryMethod(client),
    update: buildUpdateProcedureCategoryMethod(client),
  }
}
