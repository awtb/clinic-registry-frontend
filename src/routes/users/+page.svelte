<script lang="ts">
  import * as Table from "$lib/components/ui/table"
  import * as Sheet from "$lib/components/ui/sheet"
  import { buttonVariants } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"

  import { goto } from "$app/navigation"
  import { getContext } from "svelte"
  import {type ApiClient, apiClientKey} from "$lib/shared/api/context";

  const apiClient = getContext<ApiClient>(apiClientKey)

  let { data } = $props()
  let pageData = $state(data)
  let currentPage = $state(data.usersResponse?.ok ? data.usersResponse.data.page : 1)
  let totalPages = $state(data.usersResponse?.ok ? data.usersResponse.data.total_pages : 1)
  let pageSize = $state(data.usersResponse?.ok ? data.usersResponse.data.page_size : 10)
  let totalItems = $state(data.usersResponse?.ok ? data.usersResponse.data.total_items : 0)
  let isLoading = $state(false)

  const updateQueryParams = async (page: number, size: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", String(page))
    params.set("page_size", String(size))
    await goto(`?${params.toString()}`, {
      replaceState: true,
      noScroll: true,
    })
  }

  async function loadUsersPage(page: number) {
    if (isLoading) return
    isLoading = true

    await updateQueryParams(page, pageSize)

    const usersResponse = await apiClient.users.getAll(page, pageSize)

    if (!usersResponse.ok) {
      isLoading = false
      return
    }

    pageData = { ...pageData, usersResponse: { ok: true, data: usersResponse.data } }
    currentPage = usersResponse.data.page
    totalPages = usersResponse.data.total_pages

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
</script>

<div class="min-h-[calc(100dvh-8rem)] flex flex-col">
  {#key currentPage}
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px]">Пользователь</Table.Head>
          <Table.Head>Роль</Table.Head>
          <Table.Head>Кол-во записей</Table.Head>
          <Table.Head>Статус</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if !pageData.usersResponse.ok}
          <Table.Row>
            <Table.Cell colspan="5" class="text-center py-4">Нет данных для отображения</Table.Cell>
          </Table.Row>
        {:else}
          {#each pageData.usersResponse.data.items as user}
            <Table.Row>
              <Table.Cell class="font-medium">{user.first_name} {user.last_name}</Table.Cell>
              <Table.Cell>
                <Badge variant="secondary">{user.role}</Badge>
              </Table.Cell>
              <Table.Cell>15</Table.Cell>
              <Table.Cell>ACTIVE</Table.Cell>
              <Table.Cell class="text-end">
                <Sheet.Root>
                  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}
                    >Изменить</Sheet.Trigger
                  >
                  <Sheet.Content>
                    <Sheet.Header>
                      <Sheet.Title>Обновление профиля пользователя</Sheet.Title>
                      <Sheet.Description>
                        Внесите необходимые изменения в профиль пользователя.
                      </Sheet.Description>
                    </Sheet.Header>
                  </Sheet.Content>
                </Sheet.Root>
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  {/key}
  {#if pageData.usersResponse.ok}
    <Pagination.Root count={totalItems} page={currentPage} perPage={pageSize} class="mt-auto">
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
                  onclick={() => loadUsersPage(page.value)}
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
