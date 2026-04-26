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
  import { createQuery, createMutation, useQueryClient } from "@tanstack/svelte-query"
  import ProcedureCategoriesSearch from "./procedure-categories-search.svelte"
  import ProcedureCategoriesTable from "./procedure-categories-table.svelte"
  import ProcedureCategoryCreateDialog from "./procedure-category-create-dialog.svelte"
  import type {
    ProcedureCategoriesPageData,
    ProcedureCategoriesPageResponse,
    ProcedureCategoriesPageRouteData,
  } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)
  const queryClient = useQueryClient()

  const props = $props<{ data: ProcedureCategoriesPageRouteData }>()

  // svelte-ignore state_referenced_locally
  const initial = props.data.procedureCategoriesResponse?.ok
    ? props.data.procedureCategoriesResponse.data
    : undefined

  // svelte-ignore state_referenced_locally
  let searchQuery = $state(props.data.searchQuery ?? "")
  // svelte-ignore state_referenced_locally
  let debouncedSearch = $state(props.data.searchQuery ?? "")
  let page = $state(initial?.page ?? 1)
  let pageSize = $state(initial?.page_size ?? 10)

  const categoriesQuery = createQuery<ProcedureCategoriesPageData>(() => ({
    queryKey: ["procedure-categories", { page, pageSize, search: debouncedSearch }],
    queryFn: async ({ signal }) => {
      const result = await apiClient.procedureCategories.getAll(
        page,
        pageSize,
        debouncedSearch,
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
    placeholderData: (prev: ProcedureCategoriesPageData | undefined) => prev,
  }))

  $effect(() => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(page))
    params.set("page_size", String(pageSize))
    if (debouncedSearch.trim().length > 0) params.set("search_query", debouncedSearch.trim())

    const nextUrl = new SvelteURL(resolve("/procedure-categories"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  })

  const createCategoryMut = createMutation(() => ({
    mutationFn: async (data: z.infer<typeof ProcedureCategoryCreateSchema>) => {
      const result = await apiClient.procedureCategories.create(data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Категория успешно создана.")
      page = 1
      queryClient.invalidateQueries({ queryKey: ["procedure-categories"] })
    },
  }))

  const updateCategoryMut = createMutation(() => ({
    mutationFn: async (vars: {
      categoryId: string
      data: z.infer<typeof ProcedureCategoryUpdateSchema>
    }) => {
      const result = await apiClient.procedureCategories.update(vars.categoryId, vars.data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Категория успешно обновлена.")
      queryClient.invalidateQueries({ queryKey: ["procedure-categories"] })
    },
  }))

  async function createCategory(data: z.infer<typeof ProcedureCategoryCreateSchema>) {
    try {
      await createCategoryMut.mutateAsync(data)
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось создать категорию.",
      }
    }
  }

  async function updateCategory(
    categoryId: string,
    data: z.infer<typeof ProcedureCategoryUpdateSchema>,
  ) {
    try {
      await updateCategoryMut.mutateAsync({ categoryId, data })
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось обновить категорию.",
      }
    }
  }

  const procedureCategoriesResponse = $derived<ProcedureCategoriesPageResponse | null>(
    categoriesQuery.data ? { ok: true, status: 200, data: categoriesQuery.data } : null,
  )
  const currentPage = $derived(categoriesQuery.data?.page ?? page)
  const totalPages = $derived(categoriesQuery.data?.total_pages ?? 1)
  const currentPageSize = $derived(categoriesQuery.data?.page_size ?? pageSize)
  const totalItems = $derived(categoriesQuery.data?.total_items ?? 0)

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
    <h1 class="text-2xl font-bold mb-4">Категории процедур</h1>
    <ProcedureCategoryCreateDialog onCreate={createCategory} />
  </div>

  <ProcedureCategoriesSearch
    bind:searchQuery
    isLoading={categoriesQuery.isFetching}
    onSearchInput={scheduleSearch}
    onClear={clearSearch}
  />

  <ProcedureCategoriesTable
    {procedureCategoriesResponse}
    searchQuery={debouncedSearch}
    {totalItems}
    {currentPage}
    pageSize={currentPageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={goToPage}
    onUpdateCategory={updateCategory}
  />
</div>
