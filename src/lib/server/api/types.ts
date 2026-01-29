import { z } from "zod"
import { buildHttpClient } from "$lib/server/api/client"
import { buildAuthClient } from "$lib/server/api/endpoints/auth"
import {buildUsersClient} from "$lib/server/api/endpoints/user";

export type ApiError =
  | { kind: "network"; message: string; details?: unknown }
  | { kind: "http"; status: number; message: string; payload?: unknown }
  | { kind: "parse"; message: string; details?: unknown }
  | { kind: "schema"; message: string; issues: unknown; payload?: unknown }

export type ApiOk<T> = { ok: true; status: number; data: T; headers: Headers }
export type ApiErr = { ok: false; status: number; error: ApiError; headers: Headers }
export type ApiResult<T> = ApiOk<T> | ApiErr

export type RequestArgs = {
  path: string
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  headers?: Record<string, string>
  body?: BodyInit
  params?: Record<string, string | number>
}

export type RequestWithSchemaArgs<T> = RequestArgs & {
  schema: z.ZodSchema<T>
}