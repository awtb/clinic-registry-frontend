<script lang="ts">
  import * as Table from "$lib/components/ui/table"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Sheet from "$lib/components/ui/sheet"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import { MedicalRecordCreateSchema, MedicalRecordUpdateSchema } from "$lib/schemas/medical-record"
  import { replaceState } from "$app/navigation"
  import { getContext } from "svelte"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import type { PageData } from "./$types"
  import { toast } from "svelte-sonner"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: PageData }>()
  let medicalRecordsResponse = $state(props.data.medicalRecordsResponse)

  type PatientOption = {
    value: string
    label: string
  }

  let currentPage = $derived(medicalRecordsResponse?.ok ? medicalRecordsResponse.data.page : 1)
  const totalPages = $derived(medicalRecordsResponse?.ok ? medicalRecordsResponse.data.total_pages : 1)
  const pageSize = $derived(medicalRecordsResponse?.ok ? medicalRecordsResponse.data.page_size : 10)
  const totalItems = $derived(medicalRecordsResponse?.ok ? medicalRecordsResponse.data.total_items : 0)

  let isLoading = $state(false)
  let patientInputValue = $state("")
  let patientOptions = $state<PatientOption[]>([])
  let createFormError = $state("")
  let isUpdatingRecord = $state<Record<string, boolean>>({})
  let editFormErrors = $state<Record<string, string>>({})
  let searchDebounceTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined)
  let latestSearchRequestId = $state(0)

  const selectedPatientId = $derived(
    patientOptions.find(
      (patient: PatientOption) =>
        patient.label.toLowerCase() === patientInputValue.trim().toLowerCase(),
    )?.value ?? "",
  )

  const updateQueryParams = (nextPage: number, nextSize: number) => {
    const params = new URLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    replaceState(`?${params.toString()}`, {})
  }

  const patientNameFromRecord = (record: { patient: { first_name: string; last_name: string }; patient_id?: string }) => {
    if (record.patient?.first_name || record.patient?.last_name) {
      return `${record.patient.first_name} ${record.patient.last_name}`.trim()
    }

    if (record.patient_id) {
      return record.patient_id
    }

    return "Неизвестный пациент"
  }

  const creatorNameFromRecord = (record: {
    creator?: { first_name?: string; last_name?: string; username?: string; email?: string } | null
  }) => {
    if (!record.creator) return "Не указан"

    const firstLast = `${record.creator.first_name ?? ""} ${record.creator.last_name ?? ""}`.trim()
    if (firstLast.length > 0) return firstLast
    if (record.creator.username && record.creator.username.length > 0) return record.creator.username
    if (record.creator.email && record.creator.email.length > 0) return record.creator.email
    return "Не указан"
  }

  const setEditFormError = (recordId: string, message: string) => {
    editFormErrors = { ...editFormErrors, [recordId]: message }
  }

  async function updateMedicalRecord(event: SubmitEvent, recordId: string) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    setEditFormError(recordId, "")

    const complaintRaw = formData.get("chief_complaint")

    const payload = MedicalRecordUpdateSchema.safeParse({
      diagnosis: formData.get("diagnosis") as string,
      treatment: formData.get("treatment") as string,
      procedures: formData.get("procedures") as string,
      chief_complaint:
        typeof complaintRaw === "string" && complaintRaw.trim().length > 0 ? complaintRaw : null,
    })

    if (!payload.success) {
      setEditFormError(recordId, payload.error.issues[0]?.message ?? "Проверьте поля формы.")
      return
    }

    isUpdatingRecord = { ...isUpdatingRecord, [recordId]: true }
    const response = await apiClient.medicalRecords.update(recordId, payload.data)

    if (!response.ok) {
      setEditFormError(recordId, response.error.message || "Не удалось обновить запись.")
      isUpdatingRecord = { ...isUpdatingRecord, [recordId]: false }
      return
    }

    toast.success("Медицинская запись успешно обновлена.")
    await loadMedicalRecordsPage(currentPage)
    isUpdatingRecord = { ...isUpdatingRecord, [recordId]: false }
  }

  async function searchPatients(query: string) {
    const requestId = latestSearchRequestId + 1
    latestSearchRequestId = requestId

    if (query.trim().length === 0) {
      patientOptions = []
      return
    }

    const response = await apiClient.patients.getAll(1, 20, query)

    if (!response.ok) {
      console.error("Failed to search patients:", response.error)
      return
    }

    if (requestId !== latestSearchRequestId) {
      return
    }

    patientOptions = response.data.items.map((patient) => ({
      value: patient.id,
      label: `${patient.first_name} ${patient.last_name}`,
    }))
  }

  async function createMedicalRecord(event: SubmitEvent) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)
    createFormError = ""
    if (!selectedPatientId) {
      createFormError = "Выберите пациента из списка."
      return
    }

    const chiefComplaint = formData.get("chief_complaint")

    const payload = MedicalRecordCreateSchema.safeParse({
      patient_id: selectedPatientId,
      diagnosis: formData.get("diagnosis"),
      treatment: formData.get("treatment"),
      procedures: formData.get("procedures"),
      chief_complaint:
        typeof chiefComplaint === "string" && chiefComplaint.trim().length > 0
          ? chiefComplaint
          : null,
    })

    if (!payload.success) {
      createFormError = payload.error.issues[0]?.message ?? "Проверьте поля формы."
      return
    }

    const response = await apiClient.medicalRecords.create(payload.data)

    if (!response.ok) {
      createFormError = response.error.message || "Не удалось создать медицинскую запись."
      return
    }

    toast.success("Медицинская запись успешно создана.")
    form.reset()
    patientInputValue = ""
    patientOptions = []
    await loadMedicalRecordsPage(1)
  }

  async function loadMedicalRecordsPage(page: number) {
    if (isLoading) return
    isLoading = true

    const r = await apiClient.medicalRecords.getAll(page, pageSize)

    if (!r.ok) {
      console.error("Failed to load medical records:", r.error)
      isLoading = false
      return
    }

    medicalRecordsResponse = { ok: true, status: r.status, data: r.data }
    updateQueryParams(page, pageSize)

    isLoading = false
  }

  function goPrev() {
    if (currentPage <= 1) return
    loadMedicalRecordsPage(currentPage - 1)
  }

  function goNext() {
    if (currentPage >= totalPages) return
    loadMedicalRecordsPage(currentPage + 1)
  }
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold mb-4">Медицинские записи</h1>
  <Dialog.Root>
    <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
      Добавить запись
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-[560px]">
      <form method="POST" onsubmit={createMedicalRecord}>
        <Dialog.Header>
          <Dialog.Title>Добавление медицинской записи</Dialog.Title>
          <Dialog.Description>Заполните данные по пациенту и лечению.</Dialog.Description>
        </Dialog.Header>

        <div class="grid gap-4 mt-4">
          <div class="grid gap-3">
            <Label for="patient">Пациент</Label>
            <Input
              id="patient"
              type="text"
              placeholder="Начните вводить имя пациента..."
              list="patient-options"
              bind:value={patientInputValue}
              oninput={() => {
                if (searchDebounceTimeout) clearTimeout(searchDebounceTimeout)
                searchDebounceTimeout = setTimeout(() => {
                  searchPatients(patientInputValue)
                }, 300)
              }}
            />
            <datalist id="patient-options">
              {#each patientOptions as patient}
                <option value={patient.label}></option>
              {/each}
            </datalist>
          </div>

          <div class="grid gap-3">
            <Label for="chief_complaint">Жалоба</Label>
            <Textarea id="chief_complaint" name="chief_complaint" rows={3} />
          </div>

          <div class="grid gap-3">
            <Label for="diagnosis">Диагноз</Label>
            <Input id="diagnosis" name="diagnosis" />
          </div>

          <div class="grid gap-3">
            <Label for="treatment">Лечение</Label>
            <Textarea id="treatment" name="treatment" rows={3} />
          </div>

          <div class="grid gap-3">
            <Label for="procedures">Процедуры</Label>
            <Textarea id="procedures" name="procedures" rows={3} />
          </div>

          {#if createFormError}
            <p class="text-sm text-destructive">{createFormError}</p>
          {/if}

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

<div class="min-h-[calc(100dvh-8rem)] flex flex-col">
  <Table.Root>
    <Table.Header>
        <Table.Row>
          <Table.Head>Пациент</Table.Head>
          <Table.Head>Жалоба</Table.Head>
          <Table.Head>Диагноз</Table.Head>
          <Table.Head>Лечение</Table.Head>
          <Table.Head>Процедуры</Table.Head>
          <Table.Head>Врач</Table.Head>
          <Table.Head>Создано</Table.Head>
          <Table.Head class="text-end">Действия</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
      {#if medicalRecordsResponse === null || !medicalRecordsResponse.ok || medicalRecordsResponse.data.items.length === 0}
        <Table.Row>
          <Table.Cell colspan={8} class="text-center py-4">Нет данных для отображения</Table.Cell>
        </Table.Row>
      {:else}
        {#each medicalRecordsResponse.data.items as record}
          <Table.Row>
            <Table.Cell class="font-medium">{patientNameFromRecord(record)}</Table.Cell>
            <Table.Cell>{record.chief_complaint ?? "Не указано."}</Table.Cell>
            <Table.Cell>{record.diagnosis}</Table.Cell>
            <Table.Cell>{record.treatment}</Table.Cell>
            <Table.Cell>{record.procedures}</Table.Cell>
            <Table.Cell>{creatorNameFromRecord(record)}</Table.Cell>
            <Table.Cell>{record.created_at}</Table.Cell>
            <Table.Cell class="text-end">
              <Sheet.Root>
                <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
                <Sheet.Content class="sm:max-w-[560px]">
                  <Sheet.Header>
                    <Sheet.Title>Редактирование медицинской записи</Sheet.Title>
                    <Sheet.Description>Измените данные диагноза и лечения.</Sheet.Description>
                  </Sheet.Header>

                  <form
                    class="flex flex-col w-full h-full p-4"
                    onsubmit={(event) => updateMedicalRecord(event, record.id)}
                  >
                    <div class="grid gap-4">
                      <div class="grid gap-3">
                        <Label for="chief_complaint">Жалоба</Label>
                        <Textarea
                          id="chief_complaint"
                          name="chief_complaint"
                          rows={3}
                          defaultValue={record.chief_complaint ?? ""}
                        />
                      </div>

                      <div class="grid gap-3">
                        <Label for="diagnosis">Диагноз</Label>
                        <Input id="diagnosis" name="diagnosis" defaultValue={record.diagnosis} />
                      </div>

                      <div class="grid gap-3">
                        <Label for="treatment">Лечение</Label>
                        <Textarea
                          id="treatment"
                          name="treatment"
                          rows={3}
                          defaultValue={record.treatment}
                        />
                      </div>

                      <div class="grid gap-3">
                        <Label for="procedures">Процедуры</Label>
                        <Textarea
                          id="procedures"
                          name="procedures"
                          rows={3}
                          defaultValue={record.procedures}
                        />
                      </div>

                      {#if editFormErrors[record.id]}
                        <p class="text-sm text-destructive">{editFormErrors[record.id]}</p>
                      {/if}

                      <Dialog.Footer class="mt-4">
                        <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>
                          Отменить
                        </Dialog.Close>
                        <Button type="submit" disabled={isUpdatingRecord[record.id]}>
                          {isUpdatingRecord[record.id] ? "Сохранение..." : "Сохранить"}
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

  {#if medicalRecordsResponse && medicalRecordsResponse.ok}
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
                  onclick={() => loadMedicalRecordsPage(page.value)}
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
