import { string, type z } from "zod"
import type { ApiError, ApiResult, RequestArgs, RequestWithSchemaArgs } from "$lib/shared/api/types"
import { buildAuthClient } from "$lib/shared/api/endpoints/auth"
import { buildUsersClient } from "$lib/shared/api/endpoints/user"
import { buildPatientsClient as buildPatientsClient } from "./endpoints/patient"
import { buildMedicalRecordsClient } from "./endpoints/medical-record"
import { ErrorSchema } from "$lib/schemas/base"

const getPayload = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) return await response.json()
  return await response.text()
}

const getHttpMessage = (payload: unknown): string => {
  const validatedPayload = ErrorSchema.safeParse(payload)

  if (validatedPayload.success) {
    return validatedPayload.data.detail.message
  }

  return "Unknown HTTP error"
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

const buildUrl = (baseUrl: string, path: string, params?: Record<string, string | number>) => {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path
  const url = new URL(normalizedPath, normalizedBaseUrl)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)))
  return url.toString()
}

const buildRawRequester = (fetchFn: typeof fetch, baseUrl: string) => {
  return async (args: RequestArgs): Promise<ApiResult<unknown>> => {
    let response: Response
    const finalUrl = buildUrl(baseUrl, args.path, args.params)

    try {
      response = await fetchFn(finalUrl, {
        method: args.method,
        headers: args.headers,
        body: args.body,
        credentials: "include",
        cache: "no-store",
      })
    } catch (e) {
      return { ok: false, status: 0, error: buildNetworkError(e) }
    }

    let payload: unknown
    try {
      payload = await getPayload(response)
    } catch (e) {
      return {
        ok: false,
        status: response.status,
        error: buildParseError(e),
      }
    }

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: buildHttpError(response.status, payload),
      }
    }

    return { ok: true, status: response.status, data: payload }
  }
}

const parseWithSchema = <T>(
  schema: z.ZodType<T>,
  payload: unknown,
  status: number,
): ApiResult<T> => {
  const parsed = schema.safeParse(payload)

  if (!parsed.success) {
    return { ok: false, status, error: buildSchemaError(parsed.error, payload) }
  }

  return { ok: true, status, data: parsed.data }
}

export const buildHttpClient = (fetchFn: typeof fetch, baseUrl: string) => {
  const requestRaw = buildRawRequester(fetchFn, baseUrl)

  const request = async <T>(args: RequestWithSchemaArgs<T>): Promise<ApiResult<T>> => {
    const raw = await requestRaw(args)
    if (!raw.ok) return raw
    return parseWithSchema(args.schema, raw.data, raw.status)
  }

  return { request }
}

export const buildApiClient = (fetchFn: typeof fetch, baseUrl: string) => {
  const httpClient = buildHttpClient(fetchFn, baseUrl)

  return {
    auth: buildAuthClient(httpClient),
    users: buildUsersClient(httpClient),
    patients: buildPatientsClient(httpClient),
    medicalRecords: buildMedicalRecordsClient(httpClient),
  }
}
