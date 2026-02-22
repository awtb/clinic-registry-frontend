import type { buildApiClient } from "./client"

export type ApiClient = ReturnType<typeof buildApiClient>

export const apiClientKey: unique symbol = Symbol()
