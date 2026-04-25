<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import {
    ProcedureCategoryCreateSchema,
    ProcedureCategoryUpdateSchema,
  } from "$lib/schemas/procedure-category"
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
  let createFormError = $state("")
  let isUpdatingCategory = $state<Record<string, boolean>>({})
  let editFormErrors = $state<Record<string, string>>({})

  const updateQueryParams = (nextPage: number, nextSize: number, nextSearchQuery: string) => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    if (nextSearchQuery.trim().length > 0) params.set("search_query", nextSearchQuery.trim())

    const nextUrl = new SvelteURL(resolve("/procedure-categories"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  }

  const setEditFormError = (categoryId: string, message: string) => {
    editFormErrors = { ...editFormErrors, [categoryId]: message }
  }

  async function createCategory(event: SubmitEvent, isActive: boolean): Promise<boolean> {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    createFormError = ""

    const descriptionRaw = formData.get("description")
    const payload = ProcedureCategoryCreateSchema.safeParse({
      code: formData.get("code"),
      name: formData.get("name"),
      description:
        typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
          ? descriptionRaw
          : null,
      is_active: isActive,
    })

    if (!payload.success) {
      createFormError = payload.error.issues[0]?.message ?? "Проверьте поля формы."
      return false
    }

    const response = await apiClient.procedureCategories.create(payload.data)

    if (!response.ok) {
      createFormError = response.error.message || "Не удалось создать категорию."
      return false
    }

    toast.success("Категория успешно создана.")
    await loadCategoriesPage(1)
    return true
  }

  async function updateCategory(event: SubmitEvent, categoryId: string, isActive: boolean) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    setEditFormError(categoryId, "")
    const formData = new FormData(form)

    const descriptionRaw = formData.get("description")
    const payload = ProcedureCategoryUpdateSchema.safeParse({
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      description:
        typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
          ? descriptionRaw
          : null,
      is_active: isActive,
    })

    if (!payload.success) {
      setEditFormError(categoryId, payload.error.issues[0]?.message ?? "Проверьте поля формы.")
      return
    }

    isUpdatingCategory = { ...isUpdatingCategory, [categoryId]: true }
    const response = await apiClient.procedureCategories.update(categoryId, payload.data)

    if (response.ok) {
      toast.success("Категория успешно обновлена.")
      await loadCategoriesPage(currentPage)
    } else {
      setEditFormError(categoryId, response.error.message || "Не удалось обновить категорию.")
    }
    isUpdatingCategory = { ...isUpdatingCategory, [categoryId]: false }
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
    <ProcedureCategoryCreateDialog {createFormError} onSubmit={createCategory} />
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
    {editFormErrors}
    {isUpdatingCategory}
    {totalItems}
    {currentPage}
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadCategoriesPage}
    onUpdateCategory={updateCategory}
  />
</div>
