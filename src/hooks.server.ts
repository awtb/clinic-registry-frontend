import { config } from "$lib/server/config"

export const handleFetch = async ({ event, request, fetch }) => {
    const cookie = event.request.headers.get("cookie")

    if (!cookie) return fetch(request)

    const headers = new Headers(request.headers)
    headers.set("cookie", cookie)

    return fetch(new Request(request, { headers }))
}