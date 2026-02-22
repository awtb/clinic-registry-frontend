import type { RequestEvent } from "@sveltejs/kit"

import { config } from "$lib/server/config"

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
])

const filterHeaders = (headers: Headers) => {
  const out = new Headers()
  headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) out.set(key, value)
  })
  return out
}

const buildUpstreamUrl = (sourceUrl: URL, apiPath: string) => {
  const normalizedBaseUrl = config.apiBaseUrl.endsWith("/")
    ? config.apiBaseUrl
    : `${config.apiBaseUrl}/`
  const normalizedPath = apiPath.replace(/^\/+/, "")
  const upstreamUrl = new URL(normalizedPath, normalizedBaseUrl)
  sourceUrl.searchParams.forEach((v, k) => upstreamUrl.searchParams.append(k, v))
  return upstreamUrl
}

export const proxyRequest = async (event: RequestEvent, apiPath: string) => {
  const { request, fetch, url } = event
  const upstreamUrl = buildUpstreamUrl(url, apiPath)
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer()

  let upstreamResponse: Response
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: filterHeaders(request.headers),
      body,
      credentials: "include",
      redirect: "manual",
    })

    // Some backends (e.g. FastAPI) 307/308 redirect /resource -> /resource/.
    // Follow this internally to keep browser traffic on /api/*.
    if (
      (upstreamResponse.status === 307 || upstreamResponse.status === 308) &&
      upstreamResponse.headers.has("location")
    ) {
      const location = upstreamResponse.headers.get("location")
      if (location) {
        const redirectedUrl = new URL(location, upstreamUrl)
        upstreamResponse = await fetch(redirectedUrl, {
          method: request.method,
          headers: filterHeaders(request.headers),
          body,
          credentials: "include",
          redirect: "manual",
        })
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error"
    return Response.json(
      {
        error: "BFF upstream request failed",
        upstreamUrl: upstreamUrl.toString(),
        apiBaseUrl: config.apiBaseUrl,
        message,
      },
      { status: 502 },
    )
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: filterHeaders(upstreamResponse.headers),
  })
}
