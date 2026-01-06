import type {z} from "zod"
import {buildHttpClient} from "$lib/server/api/client"
import type {ApiResult} from "$lib/server/api/types"
import {UserSchema} from "$lib/schemas/user";

export type User = z.infer<typeof UserSchema>

type Client = ReturnType<typeof buildHttpClient>

const buildProfileMethod = (client: Client) => {
    return async (): Promise<ApiResult<User>> => {
        return await client.request({
            path: "/users/me",
            method: "GET",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            schema: UserSchema,
        })
    }
}

export const buildUsersClient = (client: Client) => {
    return {
        me: buildProfileMethod(client),
    }
}
