<script lang="ts">
  import { getContext } from "svelte"
  import { createQuery } from "@tanstack/svelte-query"
  import type { LogAction, LogEntity } from "$lib/schemas/log"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import LogsFilters from "./logs-filters.svelte"
  import LogsTable from "./logs-table.svelte"
  import { actionOptions, entityOptions } from "../model/constants"
  import type {
    ActorOption,
    LogsPageData,
    LogsPageResponse,
    LogsPageRouteData,
  } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: LogsPageRouteData }>()

  type AppliedFilters = {
    actorId: string
    entityType: LogEntity | ""
    actionType: LogAction | ""
    entityId: string
    createdFrom: string
    createdTo: string
  }

  // svelte-ignore state_referenced_locally
  const initial = props.data.logsResponse?.ok ? props.data.logsResponse.data : undefined

  // svelte-ignore state_referenced_locally
  let actorId = $state(props.data.filters.actorId ?? "")
  // svelte-ignore state_referenced_locally
  let entityType = $state<LogEntity | "">(props.data.filters.entityType ?? "")
  // svelte-ignore state_referenced_locally
  let actionType = $state<LogAction | "">(props.data.filters.actionType ?? "")
  // svelte-ignore state_referenced_locally
  let entityId = $state(props.data.filters.entityId ?? "")
  // svelte-ignore state_referenced_locally
  let createdFrom = $state(toDateTimeLocalValue(props.data.filters.createdFrom ?? ""))
  // svelte-ignore state_referenced_locally
  let createdTo = $state(toDateTimeLocalValue(props.data.filters.createdTo ?? ""))
  let actorOptions = $state<ActorOption[]>([])

  // svelte-ignore state_referenced_locally
  let appliedFilters = $state<AppliedFilters>({
    actorId: props.data.filters.actorId ?? "",
    entityType: (props.data.filters.entityType ?? "") as LogEntity | "",
    actionType: (props.data.filters.actionType ?? "") as LogAction | "",
    entityId: props.data.filters.entityId ?? "",
    createdFrom: props.data.filters.createdFrom ?? "",
    createdTo: props.data.filters.createdTo ?? "",
  })

  let page = $state(initial?.page ?? 1)
  let pageSize = $state(initial?.page_size ?? 10)

  const logsQuery = createQuery<LogsPageData>(() => ({
    queryKey: ["logs", { page, pageSize, filters: appliedFilters }],
    queryFn: async ({ signal }) => {
      const result = await apiClient.logs.getAll(
        page,
        pageSize,
        {
          actor_id: appliedFilters.actorId.trim() || undefined,
          entity_type: appliedFilters.entityType || undefined,
          action_type: appliedFilters.actionType || undefined,
          entity_id: appliedFilters.entityId.trim() || undefined,
          created_from: appliedFilters.createdFrom || undefined,
          created_to: appliedFilters.createdTo || undefined,
        },
        { signal },
      )
      if (!result.ok) throw result.error
      return result.data
    },
    initialData: page === (initial?.page ?? 1) && pageSize === (initial?.page_size ?? 10) ? initial : undefined,
    initialDataUpdatedAt: initial ? Date.now() : undefined,
    placeholderData: (prev: LogsPageData | undefined) => prev,
  }))

  const triggerAction = $derived(
    actionOptions.find((option) => option.value === actionType)?.label ?? "Все действия",
  )
  const triggerEntity = $derived(
    entityOptions.find((option) => option.value === entityType)?.label ?? "Все сущности",
  )
  const hasActiveFilters = $derived(
    actorId.trim().length > 0 ||
      entityType.length > 0 ||
      actionType.length > 0 ||
      entityId.trim().length > 0 ||
      createdFrom.trim().length > 0 ||
      createdTo.trim().length > 0,
  )

  function toIsoDateTime(value: string) {
    if (value.trim().length === 0) return ""

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return ""

    return parsedDate.toISOString()
  }

  function toDateTimeLocalValue(value: string) {
    if (value.trim().length === 0) return ""

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return ""

    const pad = (datePart: number) => String(datePart).padStart(2, "0")

    const year = parsedDate.getFullYear()
    const month = pad(parsedDate.getMonth() + 1)
    const day = pad(parsedDate.getDate())
    const hours = pad(parsedDate.getHours())
    const minutes = pad(parsedDate.getMinutes())

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const searchActor = async (query: string) => {
    const response = await apiClient.users.getAll(1, 10, query)

    if (!response.ok) return

    actorOptions = response.data.items.map((user) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name} (${user.username ?? "без логина"})`,
    }))
  }

  const submitFilters = (event: SubmitEvent) => {
    event.preventDefault()
    page = 1
    appliedFilters = {
      actorId,
      entityType,
      actionType,
      entityId,
      createdFrom: toIsoDateTime(createdFrom),
      createdTo: toIsoDateTime(createdTo),
    }
  }

  const clearFilters = () => {
    actorId = ""
    entityType = ""
    actionType = ""
    entityId = ""
    createdFrom = ""
    createdTo = ""
    page = 1
    appliedFilters = {
      actorId: "",
      entityType: "",
      actionType: "",
      entityId: "",
      createdFrom: "",
      createdTo: "",
    }
  }

  const logsResponse = $derived<LogsPageResponse | null>(
    logsQuery.data ? { ok: true, status: 200, data: logsQuery.data } : null,
  )
  const currentPage = $derived(logsQuery.data?.page ?? page)
  const totalPages = $derived(logsQuery.data?.total_pages ?? 1)
  const currentPageSize = $derived(logsQuery.data?.page_size ?? pageSize)
  const totalItems = $derived(logsQuery.data?.total_items ?? 0)

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
</script>

<div class="h-full min-h-0 flex flex-col">
  <div class="mb-4">
    <h1 class="text-2xl font-bold mb-4">Логи</h1>
    <LogsFilters
      bind:actorId
      bind:entityType
      bind:actionType
      bind:entityId
      bind:createdFrom
      bind:createdTo
      {actorOptions}
      {triggerAction}
      {triggerEntity}
      {hasActiveFilters}
      isLoading={logsQuery.isFetching}
      {actionOptions}
      {entityOptions}
      onSubmit={submitFilters}
      onClear={clearFilters}
      onSearchActor={searchActor}
    />
  </div>

  <LogsTable
    {logsResponse}
    {hasActiveFilters}
    {totalItems}
    {currentPage}
    pageSize={currentPageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={goToPage}
  />
</div>
