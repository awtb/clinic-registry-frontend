import type { Page } from "$lib/schemas/base"
import { ProcedureCategorySchema } from "$lib/schemas/procedure-category"
import type { ApiResult } from "$lib/shared/api/types"
import type { z } from "zod"

export type ProcedureCategory = z.infer<typeof ProcedureCategorySchema>
export type ProcedureCategoriesPageData = Page<ProcedureCategory>
export type ProcedureCategoriesPageResponse = ApiResult<ProcedureCategoriesPageData>

export type ProcedureCategoriesPageRouteData = {
  procedureCategoriesResponse: ProcedureCategoriesPageResponse
  searchQuery?: string
}
