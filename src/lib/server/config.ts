import { env } from "$env/dynamic/private"

export const config = {
  apiBaseUrl: env.API_BASE_URL ?? "http://localhost:8000",
} as const
