<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { UserCreateSchema, UserUpdateSchema } from "$lib/schemas/user"
  import type { z } from "zod"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import UserCreateDialog from "./user-create-dialog.svelte"
  import UsersSearch from "./users-search.svelte"
  import UsersTable from "./users-table.svelte"
  import { userRoleOptions } from "../model/constants"
  import type { UsersPageRouteData } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: UsersPageRouteData }>()
  // svelte-ignore state_referenced_locally
  let usersResponse = $state(props.data.usersResponse)
  // svelte-ignore state_referenced_locally
  let searchQuery = $state(props.data.searchQuery ?? "")

  let currentPage = $derived(usersResponse?.ok ? usersResponse.data.page : 1)
  const totalPages = $derived(usersResponse?.ok ? usersResponse.data.total_pages : 1)
  const pageSize = $derived(usersResponse?.ok ? usersResponse.data.page_size : 10)
  const totalItems = $derived(usersResponse?.ok ? usersResponse.data.total_items : 0)

  let isLoading = $state(false)

  const updateQueryParams = (nextPage: number, nextSize: number, nextSearchQuery: string) => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    if (nextSearchQuery.trim().length > 0) params.set("search_query", nextSearchQuery.trim())

    const nextUrl = new SvelteURL(resolve("/users"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  }

  async function createUser(
    data: z.infer<typeof UserCreateSchema>,
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await apiClient.users.create(data)

    if (!response.ok) {
      return { ok: false, error: response.error.message || "Не удалось создать пользователя." }
    }

    toast.success("Пользователь успешно добавлен.")
    await loadUsersPage(1)
    return { ok: true }
  }

  async function updateUser(
    userId: string,
    data: z.infer<typeof UserUpdateSchema>,
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await apiClient.users.update(userId, data)

    if (!response.ok) {
      return { ok: false, error: response.error.message || "Не удалось обновить пользователя." }
    }

    toast.success("Профиль пользователя успешно обновлен.")
    await loadUsersPage(currentPage)
    return { ok: true }
  }

  let requestSeq = 0
  async function loadUsersPage(page: number) {
    const seq = ++requestSeq
    isLoading = true

    const response = await apiClient.users.getAll(page, pageSize, searchQuery)

    if (!response.ok) {
      globalThis.console.error("Failed to load users:", response.error)
      if (seq === requestSeq) isLoading = false
      return
    }

    if (seq !== requestSeq) return

    usersResponse = { ok: true, status: response.status, data: response.data }
    updateQueryParams(page, pageSize, searchQuery)

    isLoading = false
  }

  function goPrev() {
    if (currentPage <= 1) return
    loadUsersPage(currentPage - 1)
  }

  function goNext() {
    if (currentPage >= totalPages) return
    loadUsersPage(currentPage + 1)
  }

  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  const scheduleSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchDebounce = globalThis.setTimeout(() => loadUsersPage(1), 300)
  }

  const clearSearch = () => {
    searchQuery = ""
    loadUsersPage(1)
  }
</script>

<div class="h-full min-h-0 flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold mb-4">Пользователи системы</h1>
    <UserCreateDialog roles={userRoleOptions} onCreate={createUser} />
  </div>

  <UsersSearch bind:searchQuery {isLoading} onSearchInput={scheduleSearch} onClear={clearSearch} />

  <UsersTable
    {usersResponse}
    roles={userRoleOptions}
    {searchQuery}
    {totalItems}
    {currentPage}
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadUsersPage}
    onUpdateUser={updateUser}
  />
</div>
