<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { UserCreateSchema, UserUpdateSchema } from "$lib/schemas/user"
  import type { z } from "zod"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import { createQuery, createMutation, useQueryClient } from "@tanstack/svelte-query"
  import UserCreateDialog from "./user-create-dialog.svelte"
  import UsersSearch from "./users-search.svelte"
  import UsersTable from "./users-table.svelte"
  import { userRoleOptions } from "../model/constants"
  import type { UsersPageData, UsersPageResponse, UsersPageRouteData } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)
  const queryClient = useQueryClient()

  const props = $props<{ data: UsersPageRouteData }>()

  // svelte-ignore state_referenced_locally
  const initial = props.data.usersResponse?.ok ? props.data.usersResponse.data : undefined

  // svelte-ignore state_referenced_locally
  let searchQuery = $state(props.data.searchQuery ?? "")
  // svelte-ignore state_referenced_locally
  let debouncedSearch = $state(props.data.searchQuery ?? "")
  let page = $state(initial?.page ?? 1)
  let pageSize = $state(initial?.page_size ?? 10)

  const usersQuery = createQuery<UsersPageData>(() => ({
    queryKey: ["users", { page, pageSize, search: debouncedSearch }],
    queryFn: async ({ signal }) => {
      const result = await apiClient.users.getAll(page, pageSize, debouncedSearch, { signal })
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
    placeholderData: (prev: UsersPageData | undefined) => prev,
  }))

  $effect(() => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(page))
    params.set("page_size", String(pageSize))
    if (debouncedSearch.trim().length > 0) params.set("search_query", debouncedSearch.trim())

    const nextUrl = new SvelteURL(resolve("/users"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  })

  const createUserMut = createMutation(() => ({
    mutationFn: async (data: z.infer<typeof UserCreateSchema>) => {
      const result = await apiClient.users.create(data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Пользователь успешно добавлен.")
      page = 1
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  }))

  const updateUserMut = createMutation(() => ({
    mutationFn: async (vars: { userId: string; data: z.infer<typeof UserUpdateSchema> }) => {
      const result = await apiClient.users.update(vars.userId, vars.data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Профиль пользователя успешно обновлен.")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  }))

  async function createUser(data: z.infer<typeof UserCreateSchema>) {
    try {
      await createUserMut.mutateAsync(data)
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось создать пользователя.",
      }
    }
  }

  async function updateUser(userId: string, data: z.infer<typeof UserUpdateSchema>) {
    try {
      await updateUserMut.mutateAsync({ userId, data })
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось обновить пользователя.",
      }
    }
  }

  const usersResponse = $derived<UsersPageResponse | null>(
    usersQuery.data ? { ok: true, status: 200, data: usersQuery.data } : null,
  )
  const currentPage = $derived(usersQuery.data?.page ?? page)
  const totalPages = $derived(usersQuery.data?.total_pages ?? 1)
  const currentPageSize = $derived(usersQuery.data?.page_size ?? pageSize)
  const totalItems = $derived(usersQuery.data?.total_items ?? 0)

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
    <h1 class="text-2xl font-bold mb-4">Пользователи системы</h1>
    <UserCreateDialog roles={userRoleOptions} onCreate={createUser} />
  </div>

  <UsersSearch
    bind:searchQuery
    isLoading={usersQuery.isFetching}
    onSearchInput={scheduleSearch}
    onClear={clearSearch}
  />

  <UsersTable
    {usersResponse}
    roles={userRoleOptions}
    searchQuery={debouncedSearch}
    {totalItems}
    {currentPage}
    pageSize={currentPageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={goToPage}
    onUpdateUser={updateUser}
  />
</div>
