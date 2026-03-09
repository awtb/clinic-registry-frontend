<script lang="ts">
  import { getContext } from "svelte"
  import { Badge } from "$lib/components/ui/badge"
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import * as Table from "$lib/components/ui/table"
  import type { Log, LogAction, LogEntity } from "$lib/schemas/log"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import type { PageData } from "./$types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: PageData }>()

  type ActorOption = {
    id: string
    name: string
  }

  const actionOptions: Array<{ label: string; value: LogAction | "" }> = [
    { label: "Все действия", value: "" },
    { label: "Создание", value: "CREATE" },
    { label: "Обновление", value: "UPDATE" },
    { label: "Удаление", value: "DELETE" },
  ]

  const entityOptions: Array<{ label: string; value: LogEntity | "" }> = [
    { label: "Все сущности", value: "" },
    { label: "Пациент", value: "PATIENT" },
    { label: "Пользователь", value: "USER" },
    { label: "Медицинская запись", value: "MEDICAL_RECORD" },
  ]

  const entityLabelMap: Record<LogEntity, string> = {
    PATIENT: "Пациент",
    USER: "Пользователь",
    MEDICAL_RECORD: "Медицинская запись",
  }

  const actionLabelMap: Record<LogAction, string> = {
    CREATE: "Создание",
    UPDATE: "Обновление",
    DELETE: "Удаление",
  }

  const logFieldMap: Record<LogEntity, Array<{ key: string; label: string }>> = {
    PATIENT: [
      { key: "id", label: "ID" },
      { key: "first_name", label: "Имя" },
      { key: "last_name", label: "Фамилия" },
      { key: "birth_date", label: "Дата рождения" },
      { key: "gender", label: "Пол" },
      { key: "passport_number", label: "Паспорт" },
      { key: "phone_number", label: "Телефон" },
      { key: "notes", label: "Примечание" },
      { key: "last_visit", label: "Последний визит" },
    ],
    USER: [
      { key: "id", label: "ID" },
      { key: "first_name", label: "Имя" },
      { key: "last_name", label: "Фамилия" },
      { key: "username", label: "Логин" },
      { key: "email", label: "Email" },
      { key: "role", label: "Роль" },
    ],
    MEDICAL_RECORD: [
      { key: "id", label: "ID" },
      { key: "patient_id", label: "Пациент ID" },
      { key: "diagnosis", label: "Диагноз" },
      { key: "treatment", label: "Лечение" },
      { key: "procedures", label: "Процедуры" },
      { key: "chief_complaint", label: "Жалоба" },
      { key: "creator_id", label: "Создатель ID" },
    ],
  }

  let logsResponse = $state(props.data.logsResponse)
  let actorId = $state(props.data.filters.actorId ?? "")
  let entityType = $state<LogEntity | "">(props.data.filters.entityType ?? "")
  let actionType = $state<LogAction | "">(props.data.filters.actionType ?? "")
  let entityId = $state(props.data.filters.entityId ?? "")
  let actorOptions = $state<Array<ActorOption>>([])
  let createdFrom = $state(toDateTimeLocalValue(props.data.filters.createdFrom ?? ""))
  let createdTo = $state(toDateTimeLocalValue(props.data.filters.createdTo ?? ""))
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

  const badgeVariantForAction = (action: unknown) => {
    if (action === "DELETE") return "destructive"
    if (action === "UPDATE") return "secondary"
    return "default"
  }

  const actionLabelFor = (action: unknown) => {
    if (action === "CREATE" || action === "UPDATE" || action === "DELETE") {
      return actionLabelMap[action]
    }
    return "Неизвестно"
  }

  const entityLabelFor = (entityTypeValue: unknown) => {
    if (
      entityTypeValue === "PATIENT" ||
      entityTypeValue === "USER" ||
      entityTypeValue === "MEDICAL_RECORD"
    ) {
      return entityLabelMap[entityTypeValue]
    }
    return "Неизвестно"
  }

  const formatDateTime = (value: string) => {
    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return value

    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(parsedDate)
  }

  const formatJson = (payload: unknown) => {
    if (!payload) return "Нет данных"

    try {
      const serialized = JSON.stringify(payload)
      return serialized.length > 160 ? `${serialized.slice(0, 160)}...` : serialized
    } catch {
      return "Невозможно отобразить"
    }
  }

  const toRecord = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
    return {}
  }

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—"
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return String(value)
    }

    return formatJson(value)
  }

  const isSameValue = (left: unknown, right: unknown) => {
    return JSON.stringify(left ?? null) === JSON.stringify(right ?? null)
  }

  const searchActor = async (query: string) => {
    const response = await apiClient.users.getAll(1, 10, query)
    if (response.ok) {
      actorOptions = response.data.items.map((user) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name} (${user.username})`,
      }))
    }
  }

  const getChangedFields = (log: Log) => {
    const fields = logFieldMap[log.entity_type]
    const before = toRecord(log.entity_before)
    const after = toRecord(log.entity_after)

    return fields
      .map((field) => ({
        key: field.key,
        label: field.label,
        before: before[field.key],
        after: after[field.key],
      }))
      .filter((field) => {
        if (log.action === "CREATE") return field.after !== undefined
        if (log.action === "DELETE") return field.before !== undefined
        return !isSameValue(field.before, field.after)
      })
  }

  const changeSummary = (log: Log) => {
    const changedCount = getChangedFields(log).length
    if (log.action === "CREATE") return `Создано: ${changedCount}`
    if (log.action === "DELETE") return `Удалено: ${changedCount}`
    return `Изменено: ${changedCount}`
  }

  const getMetadataEntries = (metadata: unknown) => {
    const record = toRecord(metadata)
    return Object.entries(record).map(([key, value]) => ({ key, value: formatValue(value) }))
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

    <form class="grid gap-2 md:grid-cols-2 xl:grid-cols-4" onsubmit={submitFilters}>
      <Input
        placeholder="Пользователь"
        bind:value={actorId}
        oninput={() => searchActor(actorId)}
        list="actors"
      />
      <datalist id="actors">
        {#each actorOptions as option}
          <option value={option.id}>{option.name}</option>
        {/each}
      </datalist>
      <Input placeholder="Entity ID" bind:value={entityId} />

      <Select.Root type="single" bind:value={entityType}>
        <Select.Trigger class="w-full">{triggerEntity}</Select.Trigger>
        <Select.Content>
          {#each entityOptions as option (option.value)}
            <Select.Item value={option.value}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <Select.Root type="single" bind:value={actionType}>
        <Select.Trigger class="w-full">{triggerAction}</Select.Trigger>
        <Select.Content>
          {#each actionOptions as option (option.value)}
            <Select.Item value={option.value}>{option.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <Input type="datetime-local" bind:value={createdFrom} />
      <Input type="datetime-local" bind:value={createdTo} />

      <div class="flex items-center gap-2 md:col-span-2">
        <Button type="submit" disabled={isLoading}>Применить</Button>
        <Button
          type="button"
          variant="outline"
          onclick={clearFilters}
          disabled={!hasActiveFilters || isLoading}
        >
          Сбросить
        </Button>
        {#if isLoading}
          <span class="text-sm text-muted-foreground whitespace-nowrap">Загрузка...</span>
        {/if}
      </div>
    </form>
  </div>

  <div class="flex-1 min-h-0 flex flex-col">
    <div class="flex-1 min-h-0 overflow-auto">
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="whitespace-normal">Дата</Table.Head>
            <Table.Head class="whitespace-normal">Действие</Table.Head>
            <Table.Head class="whitespace-normal">Сущность</Table.Head>
            <Table.Head class="whitespace-normal">Идентификатор пользователя</Table.Head>
            <Table.Head class="whitespace-normal">Идентификатор сущности</Table.Head>
            <Table.Head class="whitespace-normal">Изменения</Table.Head>
            <Table.Head class="whitespace-normal text-end">Действия</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if logsResponse === null || !logsResponse.ok || logsResponse.data.items.length === 0}
            <Table.Row>
              <Table.Cell colspan={7} class="text-center py-4">
                {#if hasActiveFilters}
                  Ничего не найдено по заданным фильтрам.
                {:else}
                  Нет данных для отображения
                {/if}
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each logsResponse.data.items as log (log.id)}
              {@const changedFields = getChangedFields(log)}
              {@const metadataEntries = getMetadataEntries(log.metadata)}
              <Table.Row>
                <Table.Cell class="whitespace-nowrap">{formatDateTime(log.created_at)}</Table.Cell>
                <Table.Cell>
                  <Badge variant={badgeVariantForAction(log.action)}
                    >{actionLabelFor(log.action)}</Badge
                  >
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="outline">{entityLabelFor(log.entity_type)}</Badge>
                </Table.Cell>
                <Table.Cell class="font-mono text-xs whitespace-normal break-all">
                  {log.actor_id}
                </Table.Cell>
                <Table.Cell class="font-mono text-xs whitespace-normal break-all">
                  {log.entity_id}
                </Table.Cell>
                <Table.Cell class="text-xs whitespace-nowrap">
                  {changeSummary(log)}
                </Table.Cell>
                <Table.Cell class="text-end">
                  <Dialog.Root>
                    <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
                      Детали
                    </Dialog.Trigger>
                    <Dialog.Content class="sm:max-w-3xl max-h-[85vh] overflow-auto">
                      <Dialog.Header>
                        <Dialog.Title>
                          {actionLabelFor(log.action)}: {entityLabelFor(log.entity_type)}
                        </Dialog.Title>
                        <Dialog.Description>
                          {formatDateTime(log.created_at)} · Actor: {log.actor_id} · Entity: {log.entity_id}
                        </Dialog.Description>
                      </Dialog.Header>

                      <div class="mt-4 grid gap-3">
                        <h3 class="text-sm font-medium">Изменения</h3>
                        {#if changedFields.length === 0}
                          <p class="text-sm text-muted-foreground">Изменений не найдено.</p>
                        {:else}
                          {#each changedFields as field (field.key)}
                            <div class="border rounded-md p-3 grid gap-2 md:grid-cols-3">
                              <div>
                                <p class="text-xs text-muted-foreground">Поле</p>
                                <p class="text-sm">{field.label}</p>
                              </div>
                              <div>
                                <p class="text-xs text-muted-foreground">До</p>
                                <p class="text-sm break-all">{formatValue(field.before)}</p>
                              </div>
                              <div>
                                <p class="text-xs text-muted-foreground">После</p>
                                <p class="text-sm break-all">{formatValue(field.after)}</p>
                              </div>
                            </div>
                          {/each}
                        {/if}

                        <h3 class="text-sm font-medium mt-2">Доп.данные</h3>
                        {#if metadataEntries.length === 0}
                          <p class="text-sm text-muted-foreground">Доп.данные отсутствуют.</p>
                        {:else}
                          <div class="border rounded-md p-3 grid gap-2">
                            {#each metadataEntries as metadata (metadata.key)}
                              <div class="grid gap-1 md:grid-cols-[200px_1fr]">
                                <p class="text-xs text-muted-foreground break-all">
                                  {metadata.key}
                                </p>
                                <p class="text-sm break-all">{metadata.value}</p>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </Dialog.Content>
                  </Dialog.Root>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>
    </div>

    {#if logsResponse && logsResponse.ok}
      <Pagination.Root
        count={totalItems}
        page={currentPage}
        perPage={pageSize}
        class="mt-4 shrink-0"
      >
        {#snippet children({ pages, currentPage })}
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous placeholder="Предыдущая" onclick={() => goPrev()} />
            </Pagination.Item>

            {#each pages as page (page.key)}
              {#if page.type === "ellipsis"}
                <Pagination.Item>
                  <Pagination.Ellipsis />
                </Pagination.Item>
              {:else}
                <Pagination.Item>
                  <Pagination.Link
                    {page}
                    isActive={currentPage === page.value}
                    onclick={() => loadLogsPage(page.value)}
                  >
                    {page.value}
                  </Pagination.Link>
                </Pagination.Item>
              {/if}
            {/each}

            <Pagination.Item>
              <Pagination.Next onclick={() => goNext()} />
            </Pagination.Item>
          </Pagination.Content>
        {/snippet}
      </Pagination.Root>
    {/if}
  </div>
</div>
