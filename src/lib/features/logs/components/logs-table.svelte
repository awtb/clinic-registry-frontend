<script lang="ts">
  import { Badge } from "$lib/components/ui/badge"
  import { buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Table from "$lib/components/ui/table"
  import type { Log, LogAction, LogEntity } from "$lib/schemas/log"
  import { actionLabelMap, entityLabelMap, logFieldMap } from "../model/constants"
  import type { LogsPageResponse } from "../model/types"

  const {
    logsResponse,
    hasActiveFilters,
    totalItems,
    currentPage,
    pageSize,
    onPrev,
    onNext,
    onPageSelect,
  } = $props<{
    logsResponse: LogsPageResponse | null
    hasActiveFilters: boolean
    totalItems: number
    currentPage: number
    pageSize: number
    onPrev: () => void
    onNext: () => void
    onPageSelect: (page: number) => void | Promise<void>
  }>()

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
</script>

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
                <Badge variant={badgeVariantForAction(log.action)}>{actionLabelFor(log.action)}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Badge variant="outline">{entityLabelFor(log.entity_type)}</Badge>
              </Table.Cell>
              <Table.Cell class="font-mono text-xs whitespace-normal break-all">{log.actor_id}</Table.Cell>
              <Table.Cell class="font-mono text-xs whitespace-normal break-all">{log.entity_id}</Table.Cell>
              <Table.Cell class="text-xs whitespace-nowrap">{changeSummary(log)}</Table.Cell>
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
                              <p class="text-xs text-muted-foreground break-all">{metadata.key}</p>
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
    <Pagination.Root count={totalItems} page={currentPage} perPage={pageSize} class="mt-4 shrink-0">
      {#snippet children({ pages, currentPage })}
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous placeholder="Предыдущая" onclick={onPrev} />
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
                  onclick={() => onPageSelect(page.value)}
                >
                  {page.value}
                </Pagination.Link>
              </Pagination.Item>
            {/if}
          {/each}

          <Pagination.Item>
            <Pagination.Next onclick={onNext} />
          </Pagination.Item>
        </Pagination.Content>
      {/snippet}
    </Pagination.Root>
  {/if}
</div>
