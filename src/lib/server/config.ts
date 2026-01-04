import { env } from "$env/dynamic/private"

export const config = {
  apiBaseUrl: env.API_BASE_URL ?? "http://127.0.0.1:8000",
} as const
