<script lang="ts">
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Table from "$lib/components/ui/table"
  import { UserUpdateSchema } from "$lib/schemas/user"
  import type { z } from "zod"
  import UserEditSheet from "./user-edit-sheet.svelte"
  import type { RoleOption, UsersPageResponse } from "../model/types"

  type UpdateData = z.infer<typeof UserUpdateSchema>

  const {
    usersResponse,
    roles,
    searchQuery,
    totalItems,
    currentPage,
    pageSize,
    onPrev,
    onNext,
    onPageSelect,
    onUpdateUser,
  } = $props<{
    usersResponse: UsersPageResponse | null
    roles: RoleOption[]
    searchQuery: string
    totalItems: number
    currentPage: number
    pageSize: number
    onPrev: () => void
    onNext: () => void
    onPageSelect: (page: number) => void | Promise<void>
    onUpdateUser: (userId: string, data: UpdateData) => Promise<{ ok: boolean; error?: string }>
  }>()
</script>

<div class="flex-1 min-h-0 flex flex-col">
  <div class="flex-1 min-h-0 overflow-auto">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px] whitespace-normal">Пользователь</Table.Head>
          <Table.Head class="whitespace-normal">Роль</Table.Head>
          <Table.Head class="whitespace-normal">Кол-во записей</Table.Head>
          <Table.Head class="whitespace-normal">Статус</Table.Head>
          <Table.Head class="text-end whitespace-normal">Действия</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if usersResponse === null || !usersResponse.ok || usersResponse.data.items.length === 0}
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
          {#each usersResponse.data.items as user (user.id)}
            <Table.Row>
              <Table.Cell class="font-medium whitespace-normal break-words">
                {user.first_name} {user.last_name}
              </Table.Cell>
              <Table.Cell>
                <Badge variant="secondary">{user.role}</Badge>
              </Table.Cell>
              <Table.Cell>15</Table.Cell>
              <Table.Cell>ACTIVE</Table.Cell>
              <Table.Cell class="text-end">
                <UserEditSheet {user} {roles} onUpdate={onUpdateUser} />
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  {#if usersResponse && usersResponse.ok}
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
