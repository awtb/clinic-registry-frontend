<script lang="ts">
  import * as Table from "$lib/components/ui/table"
  import * as Sheet from "$lib/components/ui/sheet"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { buttonVariants } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import { Button } from "$lib/components/ui/button"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import { UserCreateSchema } from "$lib/schemas/user"

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
  let roleValue = $state("")

  const roles = [
    { label: "Админ", value: "admin" },
    { label: "Врач", value: "doctor" },
  ]

  const triggerRole = $derived(
    roles.find((role) => role.value === roleValue)?.label ?? "Выберите роль"
  )

  const updateQueryParams = async (page: number, size: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", String(page))
    params.set("page_size", String(size))
    await goto(`?${params.toString()}`, {
      replaceState: true,
      noScroll: true,
    })
  }

  async function createUser(event: SubmitEvent) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = UserCreateSchema.safeParse({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      role: roleValue,
      password: formData.get("password"),
    })

    if (!payload.success) {
      console.error("Validation failed:", payload.error)
      return
    }

    const response = await apiClient.users.create(payload.data)

    if (response.ok) {
      await loadUsersPage(1)
      form.reset()
      roleValue = ""
    } else {
      console.error("Failed to create user:", response)
    }
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

    pageData = { ...pageData, usersResponse: usersResponse }
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

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold mb-4">Пользователи системы</h1>
  <Dialog.Root>
    <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
      Добавить пользователя
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-[425px]">
      <form method="POST" onsubmit={createUser}>
        <Dialog.Header>
          <Dialog.Title>Добавление нового пользователя</Dialog.Title>
        </Dialog.Header>

        <div class="grid gap-4 mt-4">
          <div class="grid gap-3">
            <Label for="first-name">Имя</Label>
            <Input id="first-name" name="first_name" defaultValue="Исломджон" />
          </div>

          <div class="grid gap-3">
            <Label for="last-name">Фамилия</Label>
            <Input id="last-name" name="last_name" defaultValue="Хушназаров" />
          </div>

          <div class="grid gap-3">
            <Label for="email">Email</Label>
            <Input id="email" name="email" type="email" autocomplete="email" />
          </div>

          <div class="grid gap-3">
            <Label for="password">Пароль</Label>
            <Input id="password" name="password" type="password" autocomplete="new-password" />
          </div>

          <div class="grid gap-3">
            <Label for="role">Роль</Label>
            <Select.Root type="single" bind:value={roleValue}>
              <Select.Trigger id="role" class="w-[180px]">{triggerRole}</Select.Trigger>
              <Select.Content>
                {#each roles as role}
                  <Select.Item value={role.value}>{role.label}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <!-- <div class="grid gap-3">
            <Label for="gender">Пол</Label>
            <Select.Root type="single" bind:value>
            <Select.Trigger class="w-[180px]">{triggerGender}</Select.Trigger>
            <Select.Content>
              {#each genders as gender}
                <Select.Item value={gender.value}>{gender.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div> -->

        <Dialog.Footer class="mt-4">
          <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>
            Отменить
          </Dialog.Close>
          <Button type="submit">Сохранить</Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>
</div>

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
        {#if !pageData.usersResponse.data}
          <Table.Row>
            <Table.Cell colspan=5 class="text-center py-4">Нет данных для отображения</Table.Cell>
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
