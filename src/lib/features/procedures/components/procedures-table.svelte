<script lang="ts">
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Table from "$lib/components/ui/table"
  import { ProcedureUpdateSchema } from "$lib/schemas/procedure"
  import type { z } from "zod"
  import ProcedureEditSheet from "./procedure-edit-sheet.svelte"
  import { formatPrice } from "../model/format"
  import type { CategoryOption, ProceduresPageResponse } from "../model/types"

  type UpdateData = z.infer<typeof ProcedureUpdateSchema>

  const {
    proceduresResponse,
    searchQuery,
    totalItems,
    currentPage,
    pageSize,
    onPrev,
    onNext,
    onPageSelect,
    onUpdateProcedure,
    onSearchCategories,
  } = $props<{
    proceduresResponse: ProceduresPageResponse | null
    searchQuery: string
    totalItems: number
    currentPage: number
    pageSize: number
    onPrev: () => void
    onNext: () => void
    onPageSelect: (page: number) => void | Promise<void>
    onUpdateProcedure: (
      procedureId: string,
      data: UpdateData,
    ) => Promise<{ ok: boolean; error?: string }>
    onSearchCategories: (query: string) => Promise<CategoryOption[]>
  }>()
</script>

<div class="flex-1 min-h-0 flex flex-col">
  <div class="flex-1 min-h-0 overflow-auto">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="whitespace-normal">Код</Table.Head>
          <Table.Head class="whitespace-normal">Название</Table.Head>
          <Table.Head class="whitespace-normal">Категория</Table.Head>
          <Table.Head class="whitespace-normal">Цена</Table.Head>
          <Table.Head class="whitespace-normal">Описание</Table.Head>
          <Table.Head class="whitespace-normal">Статус</Table.Head>
          <Table.Head class="text-end whitespace-normal">Действия</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if proceduresResponse === null || !proceduresResponse.ok || proceduresResponse.data.items.length === 0}
          <Table.Row>
            <Table.Cell colspan={7} class="text-center py-4">
              {#if searchQuery.trim().length > 0}
                Ничего не найдено по запросу "{searchQuery.trim()}".
              {:else}
                Нет данных для отображения
              {/if}
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each proceduresResponse.data.items as procedure (procedure.id)}
            <Table.Row>
              <Table.Cell class="font-mono text-xs whitespace-normal break-all">
                {procedure.code}
              </Table.Cell>
              <Table.Cell class="font-medium whitespace-normal break-words">
                {procedure.name}
              </Table.Cell>
              <Table.Cell class="whitespace-normal break-words">
                {procedure.category.name}
              </Table.Cell>
              <Table.Cell class="whitespace-nowrap">{formatPrice(procedure.default_price)}</Table.Cell>
              <Table.Cell class="whitespace-normal break-words">
                {procedure.description ?? "—"}
              </Table.Cell>
              <Table.Cell>
                <Badge variant={procedure.is_active ? "default" : "secondary"}>
                  {procedure.is_active ? "Активна" : "Неактивна"}
                </Badge>
              </Table.Cell>
              <Table.Cell class="text-end">
                <ProcedureEditSheet
                  {procedure}
                  onUpdate={onUpdateProcedure}
                  {onSearchCategories}
                />
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  {#if proceduresResponse && proceduresResponse.ok}
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
