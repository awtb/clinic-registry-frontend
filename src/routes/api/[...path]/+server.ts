import type { RequestHandler } from "./$types"

import { proxyRequest } from "../_proxy"

const proxy: RequestHandler = async (event) => proxyRequest(event, event.params.path)

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const HEAD = proxy
export const OPTIONS = proxy
