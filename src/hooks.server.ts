import {buildApiClient} from "$lib/shared/api/client";
import type {Handle} from "@sveltejs/kit";
import {config} from "$lib/server/config";

export const handleFetch = async ({event, request, fetch}) => {
    if (!request.url.startsWith(config.apiBaseUrl)) {
        return;
    }


    let accessToken = event.cookies.get("access_token") || ""
    const headers = new Headers(request.headers)
    headers.set("Authorization", "Bearer " + accessToken)

    return fetch(new Request(request, {headers}))
}

export const handle: Handle = async ({event, resolve}) => {
    event.locals.apiClient = buildApiClient(event.fetch, config.apiBaseUrl)
    return resolve(event)
}