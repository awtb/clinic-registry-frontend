<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { ProcedureCreateSchema, ProcedureUpdateSchema } from "$lib/schemas/procedure"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import ProcedureCreateDialog from "./procedure-create-dialog.svelte"
  import ProceduresSearch from "./procedures-search.svelte"
  import ProceduresTable from "./procedures-table.svelte"
  import type { CategoryOption, ProceduresPageRouteData } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: ProceduresPageRouteData }>()
  let proceduresResponse = $state(props.data.proceduresResponse)
  let searchQuery = $state(props.data.searchQuery ?? "")

  let currentPage = $derived(proceduresResponse?.ok ? proceduresResponse.data.page : 1)
  const totalPages = $derived(proceduresResponse?.ok ? proceduresResponse.data.total_pages : 1)
  const pageSize = $derived(proceduresResponse?.ok ? proceduresResponse.data.page_size : 10)
  const totalItems = $derived(proceduresResponse?.ok ? proceduresResponse.data.total_items : 0)

  let isLoading = $state(false)
  let createFormError = $state("")
  let isUpdatingProcedure = $state<Record<string, boolean>>({})
  let editFormErrors = $state<Record<string, string>>({})

  const updateQueryParams = (nextPage: number, nextSize: number, nextSearchQuery: string) => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    if (nextSearchQuery.trim().length > 0) params.set("search_query", nextSearchQuery.trim())

    const nextUrl = new SvelteURL(resolve("/procedures"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  }

  const setEditFormError = (procedureId: string, message: string) => {
    editFormErrors = { ...editFormErrors, [procedureId]: message }
  }

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

  const parsePrice = (raw: FormDataEntryValue | null) => {
    if (typeof raw !== "string" || raw.trim().length === 0) return undefined
    return raw.trim()
  }

  async function createProcedure(
    event: SubmitEvent,
    selectedCategoryId: string,
    isActive: boolean,
  ): Promise<boolean> {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    createFormError = ""

    if (!selectedCategoryId) {
      createFormError = "Выберите категорию из списка."
      return false
    }

    const descriptionRaw = formData.get("description")
    const payload = ProcedureCreateSchema.safeParse({
      code: formData.get("code"),
      name: formData.get("name"),
      category_id: selectedCategoryId,
      description:
        typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
          ? descriptionRaw
          : null,
      default_price: parsePrice(formData.get("default_price")),
      is_active: isActive,
    })

    if (!payload.success) {
      createFormError = payload.error.issues[0]?.message ?? "Проверьте поля формы."
      return false
    }

    const response = await apiClient.procedures.create(payload.data)

    if (!response.ok) {
      createFormError = response.error.message || "Не удалось создать процедуру."
      return false
    }

    toast.success("Процедура успешно создана.")
    await loadProceduresPage(1)
    return true
  }

  async function updateProcedure(
    event: SubmitEvent,
    procedureId: string,
    selectedCategoryId: string,
    isActive: boolean,
  ) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    setEditFormError(procedureId, "")
    const formData = new FormData(form)

    const descriptionRaw = formData.get("description")
    const payload = ProcedureUpdateSchema.safeParse({
      code: formData.get("code") as string,
      name: formData.get("name") as string,
      category_id: selectedCategoryId,
      description:
        typeof descriptionRaw === "string" && descriptionRaw.trim().length > 0
          ? descriptionRaw
          : null,
      default_price: parsePrice(formData.get("default_price")),
      is_active: isActive,
    })

    if (!payload.success) {
      setEditFormError(procedureId, payload.error.issues[0]?.message ?? "Проверьте поля формы.")
      return
    }

    isUpdatingProcedure = { ...isUpdatingProcedure, [procedureId]: true }
    const response = await apiClient.procedures.update(procedureId, payload.data)

    if (response.ok) {
      toast.success("Процедура успешно обновлена.")
      await loadProceduresPage(currentPage)
    } else {
      setEditFormError(procedureId, response.error.message || "Не удалось обновить процедуру.")
    }
    isUpdatingProcedure = { ...isUpdatingProcedure, [procedureId]: false }
  }

  let requestSeq = 0
  async function loadProceduresPage(page: number) {
    const seq = ++requestSeq
    isLoading = true

    const response = await apiClient.procedures.getAll(page, pageSize, searchQuery)

    if (!response.ok) {
      globalThis.console.error("Failed to load procedures:", response.error)
      if (seq === requestSeq) isLoading = false
      return
    }

    if (seq !== requestSeq) return

    proceduresResponse = { ok: true, status: response.status, data: response.data }
    updateQueryParams(page, pageSize, searchQuery)

    isLoading = false
  }

  function goPrev() {
    if (currentPage <= 1) return
    loadProceduresPage(currentPage - 1)
  }

  function goNext() {
    if (currentPage >= totalPages) return
    loadProceduresPage(currentPage + 1)
  }

  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  const scheduleSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchDebounce = globalThis.setTimeout(() => loadProceduresPage(1), 300)
  }

  const clearSearch = () => {
    searchQuery = ""
    loadProceduresPage(1)
  }
</script>

<div class="h-full min-h-0 flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold mb-4">Процедуры</h1>
    <ProcedureCreateDialog
      {createFormError}
      onSubmit={createProcedure}
      onSearchCategories={searchCategories}
    />
  </div>

  <ProceduresSearch
    bind:searchQuery
    {isLoading}
    onSearchInput={scheduleSearch}
    onClear={clearSearch}
  />

  <ProceduresTable
    {proceduresResponse}
    {searchQuery}
    {editFormErrors}
    {isUpdatingProcedure}
    {totalItems}
    {currentPage}
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadProceduresPage}
    onUpdateProcedure={updateProcedure}
    onSearchCategories={searchCategories}
  />
</div>
