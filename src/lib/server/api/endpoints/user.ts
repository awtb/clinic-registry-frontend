import type { z } from "zod"
import { buildHttpClient } from "$lib/server/api/client"
import type { ApiResult } from "$lib/server/api/types"
import { UserSchema } from "$lib/schemas/user"
import { createPageSchema } from "$lib/schemas/base"

export type User = z.infer<typeof UserSchema>

type Client = ReturnType<typeof buildHttpClient>
const UserPageSchema = createPageSchema(UserSchema)

const buildProfileMethod = (client: Client) => {
  return async (): Promise<ApiResult<User>> => {
    return await client.request({
      path: "/users/me",
      method: "GET",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      schema: UserSchema,
    })
  }
}

const buildGetAllUsersMethod = (client: Client) => {
  return async (page: number, page_size: number) => {
    return await client.request({
      path: "/users",
      method: "GET",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      schema: UserPageSchema,
      params: { page, page_size },
    })
  }
}
export const buildUsersClient = (client: Client) => {
  return {
    me: buildProfileMethod(client),
    getAll: buildGetAllUsersMethod(client),
  }
}
