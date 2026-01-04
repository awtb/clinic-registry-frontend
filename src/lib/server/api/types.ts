import { z } from "zod"

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
}

export type RequestWithSchemaArgs<T> = RequestArgs & {
  schema: z.ZodSchema<T>
}
