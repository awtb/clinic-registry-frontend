import { LogSchema } from "$lib/schemas/log"
import type { Page } from "$lib/schemas/base"
import type { ApiResult } from "$lib/shared/api/types"
import type { LogAction, LogEntity } from "$lib/schemas/log"
import type { z } from "zod"

export type Log = z.infer<typeof LogSchema>
export type LogsPageData = Page<Log>
export type LogsPageResponse = ApiResult<LogsPageData>

export type LogsFilters = {
  actorId: string
  entityType: LogEntity | ""
  actionType: LogAction | ""
  entityId: string
  createdFrom: string
  createdTo: string
}

export type LogsPageRouteData = {
  logsResponse: LogsPageResponse
  filters: LogsFilters
}

export type ActorOption = {
  id: string
  name: string
}
