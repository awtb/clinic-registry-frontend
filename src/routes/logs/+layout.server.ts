import { getPaginationParams } from "$lib/shared/pagination"
import { LogActionSchema, LogEntitySchema } from "$lib/schemas/log"
import type { LayoutServerLoad } from "./$types"

const toIsoDateTime = (value: string) => {
  if (value.trim().length === 0) return undefined

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return undefined

  return parsedDate.toISOString()
}

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url)

  const actorId = url.searchParams.get("actor_id")?.trim() ?? ""
  const rawEntityType = url.searchParams.get("entity_type")?.trim() ?? ""
  const rawActionType = url.searchParams.get("action_type")?.trim() ?? ""
  const entityId = url.searchParams.get("entity_id")?.trim() ?? ""
  const createdFrom = url.searchParams.get("created_from")?.trim() ?? ""
  const createdTo = url.searchParams.get("created_to")?.trim() ?? ""

  const parsedEntityType = LogEntitySchema.safeParse(rawEntityType)
  const parsedActionType = LogActionSchema.safeParse(rawActionType)

  const entityType = parsedEntityType.success ? parsedEntityType.data : ""
  const actionType = parsedActionType.success ? parsedActionType.data : ""

  const logsResponse = await locals.apiClient.logs.getAll(page, pageSize, {
    actor_id: actorId || undefined,
    entity_type: entityType || undefined,
    action_type: actionType || undefined,
    entity_id: entityId || undefined,
    created_from: toIsoDateTime(createdFrom),
    created_to: toIsoDateTime(createdTo),
  })

  return {
    logsResponse,
    filters: {
      actorId,
      entityType,
      actionType,
      entityId,
      createdFrom,
      createdTo,
    },
  }
}
