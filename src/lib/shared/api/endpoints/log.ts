import { LogActionSchema, LogEntitySchema, LogPageSchema } from "$lib/schemas/log"
import type { buildHttpClient } from "$lib/shared/api/client"
import type { z } from "zod"

type Client = ReturnType<typeof buildHttpClient>

export type LogsFilters = {
  actor_id?: string
  entity_type?: z.infer<typeof LogEntitySchema>
  action_type?: z.infer<typeof LogActionSchema>
  entity_id?: string
  created_from?: string
  created_to?: string
}

const buildGetAllLogsMethod = (client: Client) => {
  return async (page: number, page_size: number, filters: LogsFilters = {}) => {
    const params: Record<string, string | number> = {
      page,
      page_size,
    }

    if (filters.actor_id && filters.actor_id.trim().length > 0) {
      params.actor_id = filters.actor_id.trim()
    }
    if (filters.entity_type) {
      params.entity_type = filters.entity_type
    }
    if (filters.action_type) {
      params.action_type = filters.action_type
    }
    if (filters.entity_id && filters.entity_id.trim().length > 0) {
      params.entity_id = filters.entity_id.trim()
    }
    if (filters.created_from) {
      params.created_from = filters.created_from
    }
    if (filters.created_to) {
      params.created_to = filters.created_to
    }

    return await client.request({
      path: "logs/",
      method: "GET",
      params,
      schema: LogPageSchema,
    })
  }
}

export const buildLogsClient = (client: Client) => {
  return {
    getAll: buildGetAllLogsMethod(client),
  }
}
