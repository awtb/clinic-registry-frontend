import type { z } from "zod"
import { config } from "$lib/server/config"
import type { ApiError, ApiResult, RequestArgs, RequestWithSchemaArgs } from "$lib/server/api/types"
import { buildAuthClient } from "$lib/server/api/endpoints/auth"
import {buildUsersClient} from "$lib/server/api/endpoints/user";

const getPayload = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) return await response.json()
  return await response.text()
}

const getHttpMessage = (payload: unknown): string => {
  if (typeof payload === "string" && payload.trim().length > 0) return payload
  if (payload && typeof payload === "object") {
    const detail = (payload as { detail?: unknown }).detail
    if (typeof detail === "string" && detail.trim().length > 0) return detail
  }
  return "HTTP error"
}

const buildNetworkError = (details: unknown): ApiError => ({
  kind: "network",
  message: "Network error",
  details,
})

const buildParseError = (details: unknown): ApiError => ({
  kind: "parse",
  message: "Failed to read response",
  details,
})

const buildHttpError = (status: number, payload: unknown): ApiError => ({
  kind: "http",
  status,
  message: getHttpMessage(payload),
  payload,
})

const buildSchemaError = (issues: unknown, payload: unknown): ApiError => ({
  kind: "schema",
  message: "Invalid response schema",
  issues,
  payload,
})

const buildUrl = (path: string, params?: Record<string, string | number>) => {
  const url = new URL(config.apiBaseUrl + path)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  return url.toString()
}

const buildRawRequester = (fetchFn: typeof fetch) => {
  return async (args: RequestArgs): Promise<ApiResult<unknown>> => {
    let response: Response
    const finalUrl = buildUrl(args.path, args.params);

    try {
      response = await fetchFn(finalUrl, {
        method: args.method,
        headers: args.headers,
        body: args.body,
        credentials: "include",
      })
    } catch (e) {
      return { ok: false, status: 0, error: buildNetworkError(e), headers: new Headers() }
    }

    let payload: unknown
    try {
      payload = await getPayload(response)
    } catch (e) {
      return {
        ok: false,
        status: response.status,
        error: buildParseError(e),
        headers: response.headers,
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: buildHttpError(response.status, payload),
        headers: response.headers,
      }
    }

    return { ok: true, status: response.status, data: payload, headers: response.headers }
  }
}

const parseWithSchema = <T>(
  schema: z.ZodType<T>,
  payload: unknown,
  status: number,
  headers: Headers,
): ApiResult<T> => {
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    return { ok: false, status, error: buildSchemaError(parsed.error, payload), headers }
  }

  return { ok: true, status, data: parsed.data, headers }
}

export const buildHttpClient = (fetchFn: typeof fetch) => {
  const requestRaw = buildRawRequester(fetchFn)

  const request = async <T>(args: RequestWithSchemaArgs<T>): Promise<ApiResult<T>> => {
    const raw = await requestRaw(args)
    if (!raw.ok) return raw
    return parseWithSchema(args.schema, raw.data, raw.status, raw.headers)
  }

  return { request }
}

export const buildApiClient = (fetchFn: typeof fetch) => {
  const httpClient = buildHttpClient(fetchFn)

  return {
    auth: buildAuthClient(httpClient),
    users: buildUsersClient(httpClient),
  }
}
