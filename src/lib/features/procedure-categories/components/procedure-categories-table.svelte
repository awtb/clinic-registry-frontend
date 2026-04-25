<script lang="ts">
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Table from "$lib/components/ui/table"
  import ProcedureCategoryEditSheet from "./procedure-category-edit-sheet.svelte"
  import type { ProcedureCategoriesPageResponse } from "../model/types"

  const {
    procedureCategoriesResponse,
    searchQuery,
    editFormErrors,
    isUpdatingCategory,
    totalItems,
    currentPage,
    pageSize,
    onPrev,
    onNext,
    onPageSelect,
    onUpdateCategory,
  } = $props<{
    procedureCategoriesResponse: ProcedureCategoriesPageResponse | null
    searchQuery: string
    editFormErrors: Record<string, string>
    isUpdatingCategory: Record<string, boolean>
    totalItems: number
    currentPage: number
    pageSize: number
    onPrev: () => void
    onNext: () => void
    onPageSelect: (page: number) => void | Promise<void>
    onUpdateCategory: (event: SubmitEvent, categoryId: string, isActive: boolean) => void | Promise<void>
  }>()
</script>

<div class="flex-1 min-h-0 flex flex-col">
  <div class="flex-1 min-h-0 overflow-auto">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="whitespace-normal">Код</Table.Head>
          <Table.Head class="whitespace-normal">Название</Table.Head>
          <Table.Head class="whitespace-normal">Описание</Table.Head>
          <Table.Head class="whitespace-normal">Статус</Table.Head>
          <Table.Head class="text-end whitespace-normal">Действия</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if procedureCategoriesResponse === null || !procedureCategoriesResponse.ok || procedureCategoriesResponse.data.items.length === 0}
          <Table.Row>
            <Table.Cell colspan={5} class="text-center py-4">
              {#if searchQuery.trim().length > 0}
                Ничего не найдено по запросу "{searchQuery.trim()}".
              {:else}
                Нет данных для отображения
              {/if}
            </Table.Cell>
          </Table.Row>
        {:else}
          {#each procedureCategoriesResponse.data.items as category (category.id)}
            <Table.Row>
              <Table.Cell class="font-mono text-xs whitespace-normal break-all">
                {category.code}
              </Table.Cell>
              <Table.Cell class="font-medium whitespace-normal wrap-break-word">
                {category.name}
              </Table.Cell>
              <Table.Cell class="whitespace-normal wrap-break-word">
                {category.description ?? "—"}
              </Table.Cell>
              <Table.Cell>
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active ? "Активна" : "Неактивна"}
                </Badge>
              </Table.Cell>
              <Table.Cell class="text-end">
                <ProcedureCategoryEditSheet
                  {category}
                  errorMessage={editFormErrors[category.id] ?? ""}
                  isSubmitting={Boolean(isUpdatingCategory[category.id])}
                  onSubmit={onUpdateCategory}
                />
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  {#if procedureCategoriesResponse && procedureCategoriesResponse.ok}
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
