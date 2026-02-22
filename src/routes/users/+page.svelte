<script lang="ts">
  import * as Table from "$lib/components/ui/table"
  import * as Sheet from "$lib/components/ui/sheet"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import { UserCreateSchema, UserUpdateSchema } from "$lib/schemas/user"
  import { replaceState } from "$app/navigation"
  import { getContext } from "svelte"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import type { PageData } from "./$types"
  import { toast } from "svelte-sonner"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: PageData }>()
  let usersResponse = $state(props.data.usersResponse)
  let searchQuery = $state(props.data.searchQuery ?? "")

  let currentPage = $derived(usersResponse?.ok ? usersResponse.data.page : 1)
  const totalPages = $derived(usersResponse?.ok ? usersResponse.data.total_pages : 1)
  const pageSize = $derived(usersResponse?.ok ? usersResponse.data.page_size : 10)
  const totalItems = $derived(usersResponse?.ok ? usersResponse.data.total_items : 0)

  let isLoading = $state(false)
  let roleValue = $state("")
  let isUpdatingUser = $state<Record<string, boolean>>({})
  let editFormErrors = $state<Record<string, string>>({})

  const roles = [
    { label: "Админ", value: "admin" },
    { label: "Пользователь (Врач)", value: "user" },
  ]

  const triggerRole = $derived(
    roles.find((role) => role.value === roleValue)?.label ?? "Выберите роль",
  )

  const updateQueryParams = (nextPage: number, nextSize: number, nextSearchQuery: string) => {
    const params = new URLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    if (nextSearchQuery.trim().length > 0) params.set("search_query", nextSearchQuery.trim())
    replaceState(`?${params.toString()}`, {})
  }

  const setEditFormError = (userId: string, message: string) => {
    editFormErrors = { ...editFormErrors, [userId]: message }
  }

  async function createUser(event: SubmitEvent) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = UserCreateSchema.safeParse({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      username: formData.get("username"),
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
    } else {
      console.error("Failed to create user:", response)
    }
  }

  async function updateUser(event: SubmitEvent, userId: string) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    setEditFormError(userId, "")
    const formData = new FormData(form)
    const newRole = roleValue.length > 0 ? roleValue : undefined
    const usernameRaw = formData.get("username")
    const newUsername =
      typeof usernameRaw === "string" && usernameRaw.length > 0 ? usernameRaw : undefined

    const updatePayload = UserUpdateSchema.safeParse({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      username: newUsername,
      email: formData.get("email") as string,
      role: newRole,
      password: (formData.get("password") as string) || undefined,
    })

    if (!updatePayload.success) {
      setEditFormError(userId, updatePayload.error.issues[0]?.message ?? "Проверьте поля формы.")
      return
    }

    isUpdatingUser = { ...isUpdatingUser, [userId]: true }
    const response = await apiClient.users.update(userId, updatePayload.data)

    if (response.ok) {
      toast.success("Профиль пользователя успешно обновлен.")
      await loadUsersPage(currentPage)
    } else {
      setEditFormError(userId, response.error.message || "Не удалось обновить пользователя.")
    }
    isUpdatingUser = { ...isUpdatingUser, [userId]: false }
  }

  let requestSeq = 0
  async function loadUsersPage(page: number) {
    const seq = ++requestSeq
    isLoading = true

    const r = await apiClient.users.getAll(page, pageSize, searchQuery)

    if (!r.ok) {
      console.error("Failed to load users:", r.error)
      if (seq === requestSeq) isLoading = false
      return
    }

    if (seq !== requestSeq) return

    usersResponse = { ok: true, status: r.status, data: r.data }
    updateQueryParams(page, pageSize, searchQuery)

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

  let searchDebounce: ReturnType<typeof setTimeout> | null = null
  const scheduleSearch = () => {
    if (searchDebounce) clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => loadUsersPage(1), 300)
  }

  const clearSearch = () => {
    searchQuery = ""
    loadUsersPage(1)
  }
</script>

<div class="h-full min-h-0 flex flex-col">
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
              <Label for="username">Имя пользователя</Label>
              <Input id="username" name="username" autocomplete="username" />
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

            <Dialog.Footer class="mt-4">
              <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>
                Отменить
              </Dialog.Close>
              <Button type="submit">Сохранить</Button>
            </Dialog.Footer>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  </div>

  <div class="flex items-center gap-2 mb-4">
    <Input
      placeholder="Поиск по имени, логину, email"
      bind:value={searchQuery}
      oninput={scheduleSearch}
    />
    {#if isLoading}
      <span class="text-sm text-muted-foreground whitespace-nowrap">Загрузка...</span>
    {/if}
    {#if searchQuery.trim().length > 0}
      <Button type="button" variant="outline" onclick={clearSearch} disabled={isLoading}>
        Очистить
      </Button>
    {/if}
  </div>

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
          {#each usersResponse.data.items as user}
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
                <Sheet.Root>
                  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}
                    >Изменить</Sheet.Trigger
                  >
                  <Sheet.Content class="sm:max-w-[425px]">
                    <Sheet.Header>
                      <Sheet.Title>Обновление профиля пользователя</Sheet.Title>
                      <Sheet.Description>
                        Внесите необходимые изменения в профиль пользователя.
                      </Sheet.Description>
                    </Sheet.Header>

                    <form
                      onsubmit={(e) => updateUser(e, user.id)}
                      class="flex flex-col w-full h-full p-4"
                    >
                      <div class="grid gap-4">
                        <div class="grid gap-3">
                          <Label for="first-name">Имя</Label>
                          <Input
                            id="first-name"
                            name="first_name"
                            defaultValue={user.first_name}
                          />
                        </div>

                        <div class="grid gap-3">
                          <Label for="last-name">Фамилия</Label>
                          <Input id="last-name" name="last_name" defaultValue={user.last_name} />
                        </div>

                        <div class="grid gap-3">
                          <Label for="username">Имя пользователя</Label>
                          <Input id="username" name="username" defaultValue={user.username} />
                        </div>

                        <div class="grid gap-3">
                          <Label for="email">Email</Label>
                          <Input id="email" name="email" type="email" defaultValue={user.email} />
                        </div>

                        <div class="grid gap-3">
                          <Label for="password">Новый пароль</Label>
                          <Input id="password" name="password" type="password" />
                        </div>

                        <div class="grid gap-3">
                          <Label for="role">Роль</Label>
                          <Select.Root type="single" bind:value={roleValue}>
                            <Select.Trigger id="role" class="w-full">
                              {triggerRole}
                            </Select.Trigger>
                            <Select.Content>
                              {#each roles as role}
                                <Select.Item value={role.value}>{role.label}</Select.Item>
                              {/each}
                            </Select.Content>
                          </Select.Root>
                        </div>

                        {#if editFormErrors[user.id]}
                          <p class="text-sm text-destructive">{editFormErrors[user.id]}</p>
                        {/if}

                        <Dialog.Footer class="mt-4">
                          <Dialog.Close
                            type="button"
                            class={buttonVariants({ variant: "outline" })}
                          >
                            Отменить
                          </Dialog.Close>
                          <Button type="submit" disabled={isUpdatingUser[user.id]}>
                            {isUpdatingUser[user.id] ? "Сохранение..." : "Сохранить"}
                          </Button>
                        </Dialog.Footer>
                      </div>
                    </form>
                  </Sheet.Content>
                </Sheet.Root>
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
      </Table.Root>
    </div>
    {#if usersResponse && usersResponse.ok}
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
</div>
