<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import {
    ProcedureCategoryCreateSchema,
    ProcedureCategoryUpdateSchema,
  } from "$lib/schemas/procedure-category"
  import type { z } from "zod"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import ProcedureCategoriesSearch from "./procedure-categories-search.svelte"
  import ProcedureCategoriesTable from "./procedure-categories-table.svelte"
  import ProcedureCategoryCreateDialog from "./procedure-category-create-dialog.svelte"
  import type { ProcedureCategoriesPageRouteData } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: ProcedureCategoriesPageRouteData }>()
  let procedureCategoriesResponse = $state(props.data.procedureCategoriesResponse)
  let searchQuery = $state(props.data.searchQuery ?? "")

  let currentPage = $derived(
    procedureCategoriesResponse?.ok ? procedureCategoriesResponse.data.page : 1,
  )
  const totalPages = $derived(
    procedureCategoriesResponse?.ok ? procedureCategoriesResponse.data.total_pages : 1,
  )
  const pageSize = $derived(
    procedureCategoriesResponse?.ok ? procedureCategoriesResponse.data.page_size : 10,
  )
  const totalItems = $derived(
    procedureCategoriesResponse?.ok ? procedureCategoriesResponse.data.total_items : 0,
  )

  let isLoading = $state(false)

  const updateQueryParams = (nextPage: number, nextSize: number, nextSearchQuery: string) => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    if (nextSearchQuery.trim().length > 0) params.set("search_query", nextSearchQuery.trim())

    const nextUrl = new SvelteURL(resolve("/procedure-categories"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  }

  async function createCategory(
    data: z.infer<typeof ProcedureCategoryCreateSchema>,
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await apiClient.procedureCategories.create(data)

    if (!response.ok) {
      return { ok: false, error: response.error.message || "Не удалось создать категорию." }
    }

    toast.success("Категория успешно создана.")
    await loadCategoriesPage(1)
    return { ok: true }
  }

  async function updateCategory(
    categoryId: string,
    data: z.infer<typeof ProcedureCategoryUpdateSchema>,
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await apiClient.procedureCategories.update(categoryId, data)

    if (!response.ok) {
      return { ok: false, error: response.error.message || "Не удалось обновить категорию." }
    }

    toast.success("Категория успешно обновлена.")
    await loadCategoriesPage(currentPage)
    return { ok: true }
  }

  let requestSeq = 0
  async function loadCategoriesPage(page: number) {
    const seq = ++requestSeq
    isLoading = true

    const response = await apiClient.procedureCategories.getAll(page, pageSize, searchQuery)

    if (!response.ok) {
      globalThis.console.error("Failed to load procedure categories:", response.error)
      if (seq === requestSeq) isLoading = false
      return
    }

    if (seq !== requestSeq) return

    procedureCategoriesResponse = { ok: true, status: response.status, data: response.data }
    updateQueryParams(page, pageSize, searchQuery)

    isLoading = false
  }

  function goPrev() {
    if (currentPage <= 1) return
    loadCategoriesPage(currentPage - 1)
  }

  function goNext() {
    if (currentPage >= totalPages) return
    loadCategoriesPage(currentPage + 1)
  }

  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  const scheduleSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchDebounce = globalThis.setTimeout(() => loadCategoriesPage(1), 300)
  }

  const clearSearch = () => {
    searchQuery = ""
    loadCategoriesPage(1)
  }
</script>

<div class="h-full min-h-0 flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold mb-4">Категории процедур</h1>
    <ProcedureCategoryCreateDialog onCreate={createCategory} />
  </div>

  <ProcedureCategoriesSearch
    bind:searchQuery
    {isLoading}
    onSearchInput={scheduleSearch}
    onClear={clearSearch}
  />

  <ProcedureCategoriesTable
    {procedureCategoriesResponse}
    {searchQuery}
    {totalItems}
    {currentPage}
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadCategoriesPage}
    onUpdateCategory={updateCategory}
  />
</div>
