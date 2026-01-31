<script lang="ts">
  import * as Table from "$lib/components/ui/table"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Dialog from "$lib/components/ui/dialog/index.js"

  import { goto } from "$app/navigation"
  import { getContext } from "svelte"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"

  const apiClient = getContext<ApiClient>(apiClientKey)

  let { data } = $props()
  let pageData = $derived(data)
  let currentPage = $state(data.patientsResponse?.ok ? data.patientsResponse.data.page : 1)
  let totalPages = $state(data.patientsResponse?.ok ? data.patientsResponse.data.total_pages : 1)
  let pageSize = $state(data.patientsResponse?.ok ? data.patientsResponse.data.page_size : 10)
  let totalItems = $state(data.patientsResponse?.ok ? data.patientsResponse.data.total_items : 0)
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

  async function loadPatientsPage(page: number) {
    if (isLoading) return
    isLoading = true

    await updateQueryParams(page, pageSize)

    const patientsResponse = await apiClient.patients.getAll(page, pageSize)

    if (!patientsResponse.ok) {
      isLoading = false
      return
    }

    pageData = { ...pageData, patientsResponse: { ok: true, data: patientsResponse.data } }
    currentPage = patientsResponse.data.page
    totalPages = patientsResponse.data.total_pages

    isLoading = false
  }

  function goPrev() {
    if (currentPage <= 1) return
    loadPatientsPage(currentPage - 1)
  }

  function goNext() {
    if (currentPage >= totalPages) return
    loadPatientsPage(currentPage + 1)
  }
</script>

<div class="flex items-center justify-between mb-4 ">
  <h1 class="text-2xl font-bold mb-4">Пациенты</h1>
  <Dialog.Root>
    <form>
      <Dialog.Trigger class={buttonVariants({ variant: "outline" })}
        >Добавить пациента</Dialog.Trigger
      >
      <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title>Добавление нового пациента</Dialog.Title>
          <Dialog.Description>
            Внесите необходимые данные нового пациента.
          </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4">
          <div class="grid gap-3">
            <Label for="name-1">Имя</Label>
            <Input id="name-1" name="name" defaultValue="Исломджон" />
          </div>
          <div class="grid gap-3">
            <Label for="username-1">Фамилия</Label>
            <Input id="username-1" name="username" defaultValue="Хушназаров" />
          </div>
          <div class="grid gap-3">
            <Label for="email-1">Дата рождения</Label>
            <Input id="email-1" name="email" type="date" defaultValue="2004-11-13" />
        </div>
          <div class="grid gap-3">
            <Label for="phone-1">Номер телефона</Label>
            <Input id="phone-1" name="phone" type="tel" defaultValue="+998901234567" />
          </div>
          <div class="grid gap-3">
            <Label for="passport-1">Паспорт</Label>
            <Input id="passport-1" name="passport" defaultValue="AA1234567" />
          </div>
        </div>
        <Dialog.Footer>
          <Dialog.Close class={buttonVariants({ variant: "outline" })}>Отменить</Dialog.Close>
          <Button type="submit">Сохранить</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </form>
  </Dialog.Root>
</div>

<div class="min-h-[calc(100dvh-12rem)] flex flex-col">
  {#key currentPage}
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px]">Пациент</Table.Head>
          <Table.Head>Дата рождения</Table.Head>
          <Table.Head>Последнее посещение</Table.Head>
          <Table.Head>Паспорт</Table.Head>
          <Table.Head>Номер телефона</Table.Head>
          <Table.Head class="text-end">Пол</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if !pageData.patientsResponse.ok}
          <Table.Row>
            <Table.Cell colspan="5" class="text-center py-4">Нет данных для отображения</Table.Cell>
          </Table.Row>
        {:else}
          {#each pageData.patientsResponse.data.items as patient}
            <Table.Row>
              <Table.Cell class="font-medium">{patient.first_name} {patient.last_name}</Table.Cell>
              <Table.Cell>
                <Badge variant="secondary">{patient.gender}</Badge>
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
  {#if pageData.patientsResponse.ok}
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
