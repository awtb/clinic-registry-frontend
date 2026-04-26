<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { ProcedureCreateSchema, ProcedureUpdateSchema } from "$lib/schemas/procedure"
  import type { z } from "zod"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import { createQuery, createMutation, useQueryClient } from "@tanstack/svelte-query"
  import ProcedureCreateDialog from "./procedure-create-dialog.svelte"
  import ProceduresSearch from "./procedures-search.svelte"
  import ProceduresTable from "./procedures-table.svelte"
  import type {
    CategoryOption,
    ProceduresPageData,
    ProceduresPageResponse,
    ProceduresPageRouteData,
  } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)
  const queryClient = useQueryClient()

  const props = $props<{ data: ProceduresPageRouteData }>()

  // svelte-ignore state_referenced_locally
  const initial = props.data.proceduresResponse?.ok ? props.data.proceduresResponse.data : undefined

  // svelte-ignore state_referenced_locally
  let searchQuery = $state(props.data.searchQuery ?? "")
  // svelte-ignore state_referenced_locally
  let debouncedSearch = $state(props.data.searchQuery ?? "")
  let page = $state(initial?.page ?? 1)
  let pageSize = $state(initial?.page_size ?? 10)

  const proceduresQuery = createQuery<ProceduresPageData>(() => ({
    queryKey: ["procedures", { page, pageSize, search: debouncedSearch }],
    queryFn: async ({ signal }) => {
      const result = await apiClient.procedures.getAll(
        page,
        pageSize,
        debouncedSearch,
        undefined,
        undefined,
        { signal },
      )
      if (!result.ok) throw result.error
      return result.data
    },
    initialData:
      page === (initial?.page ?? 1) &&
      pageSize === (initial?.page_size ?? 10) &&
      debouncedSearch === (props.data.searchQuery ?? "")
        ? initial
        : undefined,
    initialDataUpdatedAt: initial ? Date.now() : undefined,
    placeholderData: (prev: ProceduresPageData | undefined) => prev,
  }))

  $effect(() => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(page))
    params.set("page_size", String(pageSize))
    if (debouncedSearch.trim().length > 0) params.set("search_query", debouncedSearch.trim())

    const nextUrl = new SvelteURL(resolve("/procedures"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  })

  async function searchCategories(query: string): Promise<CategoryOption[]> {
    const response = await apiClient.procedureCategories.getAll(1, 20, query, true)
    if (!response.ok) {
      globalThis.console.error("Failed to load categories:", response.error)
      return []
    }
    return response.data.items.map((category) => ({
      value: category.id,
      label: `${category.code} — ${category.name}`,
    }))
  }

  const createProcedureMut = createMutation(() => ({
    mutationFn: async (data: z.infer<typeof ProcedureCreateSchema>) => {
      const result = await apiClient.procedures.create(data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Процедура успешно создана.")
      page = 1
      queryClient.invalidateQueries({ queryKey: ["procedures"] })
    },
  }))

  const updateProcedureMut = createMutation(() => ({
    mutationFn: async (vars: {
      procedureId: string
      data: z.infer<typeof ProcedureUpdateSchema>
    }) => {
      const result = await apiClient.procedures.update(vars.procedureId, vars.data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Процедура успешно обновлена.")
      queryClient.invalidateQueries({ queryKey: ["procedures"] })
    },
  }))

  async function createProcedure(data: z.infer<typeof ProcedureCreateSchema>) {
    try {
      await createProcedureMut.mutateAsync(data)
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось создать процедуру.",
      }
    }
  }

  async function updateProcedure(
    procedureId: string,
    data: z.infer<typeof ProcedureUpdateSchema>,
  ) {
    try {
      await updateProcedureMut.mutateAsync({ procedureId, data })
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось обновить процедуру.",
      }
    }
  }

  const proceduresResponse = $derived<ProceduresPageResponse | null>(
    proceduresQuery.data ? { ok: true, status: 200, data: proceduresQuery.data } : null,
  )
  const currentPage = $derived(proceduresQuery.data?.page ?? page)
  const totalPages = $derived(proceduresQuery.data?.total_pages ?? 1)
  const currentPageSize = $derived(proceduresQuery.data?.page_size ?? pageSize)
  const totalItems = $derived(proceduresQuery.data?.total_items ?? 0)

  function goPrev() {
    if (page <= 1) return
    page = page - 1
  }

  function goNext() {
    if (page >= totalPages) return
    page = page + 1
  }

  function goToPage(p: number) {
    page = p
  }

  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  const scheduleSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchDebounce = globalThis.setTimeout(() => {
      page = 1
      debouncedSearch = searchQuery
    }, 300)
  }

  const clearSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchQuery = ""
    page = 1
    debouncedSearch = ""
  }
</script>

<div class="h-full min-h-0 flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold mb-4">Процедуры</h1>
    <ProcedureCreateDialog onCreate={createProcedure} onSearchCategories={searchCategories} />
  </div>

  <ProceduresSearch
    bind:searchQuery
    isLoading={proceduresQuery.isFetching}
    onSearchInput={scheduleSearch}
    onClear={clearSearch}
  />

  <ProceduresTable
    {proceduresResponse}
    searchQuery={debouncedSearch}
    {totalItems}
    {currentPage}
    pageSize={currentPageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={goToPage}
    onUpdateProcedure={updateProcedure}
    onSearchCategories={searchCategories}
  />
</div>
