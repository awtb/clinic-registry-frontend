<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { UserCreateSchema, UserUpdateSchema } from "$lib/schemas/user"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import UserCreateDialog from "./user-create-dialog.svelte"
  import UsersSearch from "./users-search.svelte"
  import UsersTable from "./users-table.svelte"
  import { userRoleOptions } from "../model/constants"
  import type { UsersPageRouteData } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: UsersPageRouteData }>()
  let usersResponse = $state(props.data.usersResponse)
  let searchQuery = $state(props.data.searchQuery ?? "")

  let currentPage = $derived(usersResponse?.ok ? usersResponse.data.page : 1)
  const totalPages = $derived(usersResponse?.ok ? usersResponse.data.total_pages : 1)
  const pageSize = $derived(usersResponse?.ok ? usersResponse.data.page_size : 10)
  const totalItems = $derived(usersResponse?.ok ? usersResponse.data.total_items : 0)

  let isLoading = $state(false)
  let isUpdatingUser = $state<Record<string, boolean>>({})
  let editFormErrors = $state<Record<string, string>>({})

  const updateQueryParams = (nextPage: number, nextSize: number, nextSearchQuery: string) => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    if (nextSearchQuery.trim().length > 0) params.set("search_query", nextSearchQuery.trim())

    const nextUrl = new SvelteURL(resolve("/users"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  }

  const setEditFormError = (userId: string, message: string) => {
    editFormErrors = { ...editFormErrors, [userId]: message }
  }

  async function createUser(event: SubmitEvent, roleValue: string) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = UserCreateSchema.safeParse({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      username: formData.get("username"),
      email: formData.get("email"),
      role: roleValue,
      password: formData.get("password"),
    })

    if (!payload.success) {
      globalThis.console.error("Validation failed:", payload.error)
      return
    }

    const response = await apiClient.users.create(payload.data)

    if (response.ok) {
      await loadUsersPage(1)
    } else {
      globalThis.console.error("Failed to create user:", response)
    }
  }

  async function updateUser(event: SubmitEvent, userId: string, roleValue: string) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    setEditFormError(userId, "")
    const formData = new FormData(form)
    const newRole = roleValue.length > 0 ? roleValue : undefined
    const usernameRaw = formData.get("username")
    const newUsername =
      typeof usernameRaw === "string" && usernameRaw.length > 0 ? usernameRaw : undefined

    const updatePayload = UserUpdateSchema.safeParse({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      username: newUsername,
      email: formData.get("email") as string,
      role: newRole,
      password: (formData.get("password") as string) || undefined,
    })

    if (!updatePayload.success) {
      setEditFormError(userId, updatePayload.error.issues[0]?.message ?? "Проверьте поля формы.")
      return
    }

    isUpdatingUser = { ...isUpdatingUser, [userId]: true }
    const response = await apiClient.users.update(userId, updatePayload.data)

    if (response.ok) {
      toast.success("Профиль пользователя успешно обновлен.")
      await loadUsersPage(currentPage)
    } else {
      setEditFormError(userId, response.error.message || "Не удалось обновить пользователя.")
    }
    isUpdatingUser = { ...isUpdatingUser, [userId]: false }
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
    <UserCreateDialog roles={userRoleOptions} onSubmit={createUser} />
  </div>

  <UsersSearch bind:searchQuery {isLoading} onSearchInput={scheduleSearch} onClear={clearSearch} />

  <UsersTable
    {usersResponse}
    roles={userRoleOptions}
    {searchQuery}
    {editFormErrors}
    {isUpdatingUser}
    {totalItems}
    {currentPage}
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadUsersPage}
    onUpdateUser={updateUser}
  />
</div>
