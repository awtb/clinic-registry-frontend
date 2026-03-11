<script lang="ts">
  import { getContext } from "svelte"
  import type { LogAction, LogEntity } from "$lib/schemas/log"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import LogsFilters from "./logs-filters.svelte"
  import LogsTable from "./logs-table.svelte"
  import { actionOptions, entityOptions } from "../model/constants"
  import type { ActorOption, LogsPageRouteData } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: LogsPageRouteData }>()

  let logsResponse = $state(props.data.logsResponse)
  let actorId = $state(props.data.filters.actorId ?? "")
  let entityType = $state<LogEntity | "">(props.data.filters.entityType ?? "")
  let actionType = $state<LogAction | "">(props.data.filters.actionType ?? "")
  let entityId = $state(props.data.filters.entityId ?? "")
  let createdFrom = $state(toDateTimeLocalValue(props.data.filters.createdFrom ?? ""))
  let createdTo = $state(toDateTimeLocalValue(props.data.filters.createdTo ?? ""))
  let actorOptions = $state<ActorOption[]>([])
  let isLoading = $state(false)

  let currentPage = $derived(logsResponse?.ok ? logsResponse.data.page : 1)
  const totalPages = $derived(logsResponse?.ok ? logsResponse.data.total_pages : 1)
  const pageSize = $derived(logsResponse?.ok ? logsResponse.data.page_size : 10)
  const totalItems = $derived(logsResponse?.ok ? logsResponse.data.total_items : 0)

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
    if (value.trim().length === 0) return undefined

    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return undefined

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

  let requestSeq = 0
  async function loadLogsPage(page: number) {
    const seq = ++requestSeq
    isLoading = true

    const response = await apiClient.logs.getAll(page, pageSize, {
      actor_id: actorId.trim() || undefined,
      entity_type: entityType || undefined,
      action_type: actionType || undefined,
      entity_id: entityId.trim() || undefined,
      created_from: toIsoDateTime(createdFrom),
      created_to: toIsoDateTime(createdTo),
    })

    if (!response.ok) {
      if (seq === requestSeq) isLoading = false
      return
    }

    if (seq !== requestSeq) return

    logsResponse = { ok: true, status: response.status, data: response.data }
    isLoading = false
  }

  const submitFilters = async (event: SubmitEvent) => {
    event.preventDefault()
    await loadLogsPage(1)
  }

  const clearFilters = async () => {
    actorId = ""
    entityType = ""
    actionType = ""
    entityId = ""
    createdFrom = ""
    createdTo = ""
    await loadLogsPage(1)
  }

  function goPrev() {
    if (currentPage <= 1) return
    loadLogsPage(currentPage - 1)
  }

  function goNext() {
    if (currentPage >= totalPages) return
    loadLogsPage(currentPage + 1)
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
      {isLoading}
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
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadLogsPage}
  />
</div>
