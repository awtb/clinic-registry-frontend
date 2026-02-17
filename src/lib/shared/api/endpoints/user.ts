import { createPageSchema } from "$lib/schemas/base"
import { UserCreateSchema, UserSchema, UserUpdateSchema } from "$lib/schemas/user"
import type { z } from "zod"
import type { buildHttpClient } from "../client"

type Client = ReturnType<typeof buildHttpClient>
const UserPageSchema = createPageSchema(UserSchema)
type UserCreatePayload = z.infer<typeof UserCreateSchema>
type UserUpdatePayload = z.infer<typeof UserUpdateSchema>

const buildProfileMethod = (httpClient: Client) => {
  return async () => {
    return await httpClient.request({
      path: "users/me",
      method: "GET",
      schema: UserSchema,
    })
  }
}

const buildGetAllUsersMethod = (httpClient: Client) => {
  return async (page: number, page_size: number) => {
    return await httpClient.request({
      path: "users/",
      method: "GET",
      params: {
        page,
        page_size,
      },
      schema: UserPageSchema,
    })
  }
}

const buildCreateUserMethod = (httpClient: Client) => {
  return async (payload: UserCreatePayload) => {
    return await httpClient.request({
      path: "users/",
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      schema: UserSchema,
    })
  }
}

const buildUpdateUserMethod = (httpClient: Client) => {
  return async (userId: string, payload: UserUpdatePayload) => {
    return await httpClient.request({
      path: `users/${userId}`,
      method: "PATCH",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      schema: UserSchema,
    })
  }
}

export const buildUsersClient = (httpClient: ReturnType<typeof buildHttpClient>) => {
  return {
    me: buildProfileMethod(httpClient),
    getAll: buildGetAllUsersMethod(httpClient),
    create: buildCreateUserMethod(httpClient),
    update: buildUpdateUserMethod(httpClient),
  }
}
