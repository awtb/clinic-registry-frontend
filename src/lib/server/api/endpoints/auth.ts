import type { z } from "zod"
import { buildClient } from "$lib/server/api/client"
import { TokenSchema } from "$lib/schemas/auth"
import type { ApiResult } from "$lib/server/api/types"

export type Token = z.infer<typeof TokenSchema>

type Client = ReturnType<typeof buildClient>

export const buildTokenMethod = (client: Client) => {
    return async (email: string, password: string): Promise<ApiResult<Token>> => {
        const body = new URLSearchParams({ username: email, password })

        return await client.request({
            path: "/auth/token",
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
            schema: TokenSchema,
        })
    }
}

export const buildAuthApi = (fetchFn: typeof fetch) => {
    const client = buildClient(fetchFn)

    return {
        token: buildTokenMethod(client),
    }
}