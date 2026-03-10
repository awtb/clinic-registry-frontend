import type { Page } from "$lib/schemas/base"
import { UserSchema } from "$lib/schemas/user"
import type { ApiResult } from "$lib/shared/api/types"
import type { z } from "zod"

export type User = z.infer<typeof UserSchema>
export type UsersPageData = Page<User>
export type UsersPageResponse = ApiResult<UsersPageData>

export type UsersPageRouteData = {
  usersResponse: UsersPageResponse
  searchQuery?: string
}

export type RoleOption = {
  label: string
  value: string
}
