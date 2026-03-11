<script lang="ts">
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Table from "$lib/components/ui/table"
  import PatientEditSheet from "./patient-edit-sheet.svelte"
  import type { GenderOption, PatientsPageResponse } from "../model/types"

  const {
    patientsResponse,
    genders,
    searchQuery,
    editFormErrors,
    isUpdatingPatient,
    totalItems,
    currentPage,
    pageSize,
    onPrev,
    onNext,
    onPageSelect,
    onUpdatePatient,
  } = $props<{
    patientsResponse: PatientsPageResponse | null
    genders: GenderOption[]
    searchQuery: string
    editFormErrors: Record<string, string>
    isUpdatingPatient: Record<string, boolean>
    totalItems: number
    currentPage: number
    pageSize: number
    onPrev: () => void
    onNext: () => void
    onPageSelect: (page: number) => void | Promise<void>
    onUpdatePatient: (event: SubmitEvent, patientId: string, genderValue: string) => void | Promise<void>
  }>()

  const getGenderName = (genderValue: string | null | undefined) => {
    if (!genderValue) return "Не указан"
    const gender = genders.find((option: GenderOption) => option.value === genderValue)
    return gender?.label ?? "Не указан"
  }
</script>

<div class="flex-1 min-h-0 flex flex-col">
  <div class="flex-1 min-h-0 overflow-auto">
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head class="w-[100px] whitespace-normal">Пациент</Table.Head>
          <Table.Head class="whitespace-normal">Дата рождения</Table.Head>
          <Table.Head class="whitespace-normal">Последнее посещение</Table.Head>
          <Table.Head class="whitespace-normal">Паспорт</Table.Head>
          <Table.Head class="whitespace-normal">Номер телефона</Table.Head>
          <Table.Head class="whitespace-normal">Пол</Table.Head>
          <Table.Head class="text-end whitespace-normal">Действия</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#if patientsResponse === null || !patientsResponse.ok || patientsResponse.data.items.length === 0}
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
          {#each patientsResponse.data.items as patient (patient.id)}
            <Table.Row>
              <Table.Cell class="font-medium whitespace-normal break-words">
                {patient.first_name} {patient.last_name}
              </Table.Cell>
              <Table.Cell class="whitespace-normal break-words">
                {patient.birth_date ?? "Не указано."}
              </Table.Cell>
              <Table.Cell class="whitespace-normal break-words">
                {patient.last_visit ?? "Нет посещений."}
              </Table.Cell>
              <Table.Cell class="whitespace-normal break-words">{patient.passport_number}</Table.Cell>
              <Table.Cell class="whitespace-normal break-words">
                {patient.phone_number ?? "Не указано."}
              </Table.Cell>
              <Table.Cell class="whitespace-normal break-words">{getGenderName(patient.gender)}</Table.Cell>
              <Table.Cell class="text-end">
                <PatientEditSheet
                  {patient}
                  {genders}
                  errorMessage={editFormErrors[patient.id] ?? ""}
                  isSubmitting={Boolean(isUpdatingPatient[patient.id])}
                  onSubmit={onUpdatePatient}
                />
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  {#if patientsResponse && patientsResponse.ok}
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
