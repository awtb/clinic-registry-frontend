type PaginationDefaults = {
  page: number
  pageSize: number
}

type PaginationParams = {
  page: number
  pageSize: number
}

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return Math.floor(parsed)
}

export const getPaginationParams = (
  url: URL,
  defaults: PaginationDefaults = { page: 1, pageSize: 10 }
): PaginationParams => {
  const page = parsePositiveInt(url.searchParams.get("page"), defaults.page)
  const pageSize = parsePositiveInt(url.searchParams.get("page_size"), defaults.pageSize)

  return { page, pageSize }
}
