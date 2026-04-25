import type { Page } from "$lib/schemas/base"
import { ProcedureSchema } from "$lib/schemas/procedure"
import type { ApiResult } from "$lib/shared/api/types"
import type { z } from "zod"

export type Procedure = z.infer<typeof ProcedureSchema>
export type ProceduresPageData = Page<Procedure>
export type ProceduresPageResponse = ApiResult<ProceduresPageData>

export type ProceduresPageRouteData = {
  proceduresResponse: ProceduresPageResponse
  searchQuery?: string
}

export type CategoryOption = {
  value: string
  label: string
}
