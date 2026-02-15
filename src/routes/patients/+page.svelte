<script lang="ts">
  import * as Table from "$lib/components/ui/table"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Dialog from "$lib/components/ui/dialog/index.js"
  import { replaceState } from "$app/navigation"
  import { getContext } from "svelte"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import { PatientCreateSchema } from "$lib/schemas/patient"
  import * as Select from "$lib/components/ui/select/index.js"
  import type { PageData } from "./$types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const genders = [
    { label: "Мужской", value: "MALE" },
    { label: "Женский", value: "FEMALE" },
  ]

  const props = $props<{ data: PageData }>()
  let patientsResponse = $state(props.data.patientsResponse)

  let currentPage = $derived(patientsResponse?.ok ? patientsResponse.data.page : 1)
  const totalPages = $derived(patientsResponse?.ok ? patientsResponse.data.total_pages : 1)
  const pageSize = $derived(patientsResponse?.ok ? patientsResponse.data.page_size : 10)
  const totalItems = $derived(patientsResponse?.ok ? patientsResponse.data.total_items : 0)

  let isLoading = $state(false)

  const updateQueryParams = (nextPage: number, nextSize: number) => {
    const params = new URLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    replaceState(`?${params.toString()}`, {})
  }

  async function createPatient(event: SubmitEvent) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = PatientCreateSchema.safeParse({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      birth_date: formData.get("birth_date")
        ? new Date(formData.get("birth_date") as string)
        : undefined,
      phone_number: formData.get("phone") as string,
      passport_number: formData.get("passport") as string,
      gender: value,
    })

    if (!payload.success) {
      console.error("Validation failed:", payload.error)
      return
    }

    const response = await apiClient.patients.create(payload.data)

    if (response.ok) {
      await loadPatientsPage(1)
    } else {
      console.error("Failed to create patient:", response)
    }
  }

  async function loadPatientsPage(page: number) {
    if (isLoading) return
    isLoading = true

    const r = await apiClient.patients.getAll(page, pageSize)

    if (!r.ok) {
      console.error("Failed to load patients:", r)
      isLoading = false
      return
    }

    patientsResponse = { ok: true, status: r.status, data: r.data }
    updateQueryParams(page, pageSize)

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

  let value = $state("")
  const triggerGender = $derived(genders.find((g) => g.value === value)?.label ?? "Выберите пол")
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold mb-4">Пациенты</h1>
  <Dialog.Root>
    <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
      Добавить пациента
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-[425px]">
      <form method="POST" onsubmit={createPatient}>
        <Dialog.Header>
          <Dialog.Title>Добавление нового пациента</Dialog.Title>
          <Dialog.Description>Внесите необходимые данные нового пациента.</Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4">
          <div class="grid gap-3">
            <Label for="first-name">Имя</Label>
            <Input id="first-name" name="first_name" defaultValue="Исломджон" />
          </div>

          <div class="grid gap-3">
            <Label for="last-name">Фамилия</Label>
            <Input id="last-name" name="last_name" defaultValue="Хушназаров" />
          </div>

          <div class="grid gap-3">
            <Label for="birth_date">Дата рождения</Label>
            <Input id="birth_date" name="birth_date" type="date" defaultValue="2004-11-13" />
          </div>

          <div class="grid gap-3">
            <Label for="phone">Номер телефона</Label>
            <Input id="phone" name="phone" type="tel" defaultValue="+992901234567" />
          </div>

          <div class="grid gap-3">
            <Label for="passport">Паспорт</Label>
            <Input id="passport" name="passport" defaultValue="AA1234567" />
          </div>

          <div class="grid gap-3">
            <Label for="gender">Пол</Label>
            <Select.Root type="single" bind:value>
              <Select.Trigger class="w-[180px]">{triggerGender}</Select.Trigger>
              <Select.Content>
                {#each genders as gender}
                  <Select.Item value={gender.value}>{gender.label}</Select.Item>
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

<div class="min-h-[calc(100dvh-12rem)] flex flex-col">
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
      {#if patientsResponse === null || !patientsResponse.ok || patientsResponse.data.items.length === 0}
        <Table.Row>
          <Table.Cell colspan="5" class="text-center py-4">Нет данных для отображения</Table.Cell>
        </Table.Row>
      {:else}
        {#each patientsResponse.data.items as patient}
          <Table.Row>
            <Table.Cell class="font-medium">{patient.first_name} {patient.last_name}</Table.Cell>
            <Table.Cell>
              {patient.birth_date ?? "Не указано."}
            </Table.Cell>
            <Table.Cell>
              {patient.last_visit ?? "Нет посещений."}
            </Table.Cell>
            <Table.Cell>{patient.passport_number}</Table.Cell>
            <Table.Cell>{patient.phone_number}</Table.Cell>
            <Table.Cell>{patient.gender}</Table.Cell>
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
  {#if patientsResponse && patientsResponse.ok}
    <Pagination.Root count={totalItems} page={currentPage} perPage={pageSize} class="mt-auto">
      {#snippet children({ pages, currentPage })}
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous placeholder="Предыдущая" onclick={() => goPrev()} />
          </Pagination.Item>
          {#each pages as 
          page (page.key)}
            {#if page.type === "ellipsis"}
              <Pagination.Item>
                <Pagination.Ellipsis />
              </Pagination.Item>
            {:else}
              <Pagination.Item>
                <Pagination.Link
                  {page}
                  isActive={currentPage === page.value}
                  onclick={() => loadPatientsPage(page.value)}
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
