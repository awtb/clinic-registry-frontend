<script lang="ts">
  import { Badge } from "$lib/components/ui/badge"
  import * as Pagination from "$lib/components/ui/pagination/index.js"
  import * as Table from "$lib/components/ui/table"
  import type { Procedure } from "$lib/features/procedures/model/types"
  import { MedicalRecordUpdateSchema } from "$lib/schemas/medical-record"
  import type { z } from "zod"
  import MedicalRecordEditSheet from "./medical-record-edit-sheet.svelte"
  import type { MedicalRecord, MedicalRecordsPageResponse } from "../model/types"

  type UpdateData = z.infer<typeof MedicalRecordUpdateSchema>

  const {
    medicalRecordsResponse,
    totalItems,
    currentPage,
    pageSize,
    onPrev,
    onNext,
    onPageSelect,
    onUpdateMedicalRecord,
    onSearchProcedures,
  } = $props<{
    medicalRecordsResponse: MedicalRecordsPageResponse | null
    totalItems: number
    currentPage: number
    pageSize: number
    onPrev: () => void
    onNext: () => void
    onPageSelect: (page: number) => void | Promise<void>
    onUpdateMedicalRecord: (
      recordId: string,
      data: UpdateData,
    ) => Promise<{ ok: boolean; error?: string }>
    onSearchProcedures: (query: string) => Promise<Procedure[]>
  }>()

  const patientNameFromRecord = (record: MedicalRecord) => {
    if (record.patient?.first_name || record.patient?.last_name) {
      return `${record.patient.first_name} ${record.patient.last_name}`.trim()
    }

    if (record.patient_id) return record.patient_id

    return "Неизвестный пациент"
  }

  const creatorNameFromRecord = (record: MedicalRecord) => {
    if (!record.creator) return "Не указан"

    const firstLast = `${record.creator.first_name ?? ""} ${record.creator.last_name ?? ""}`.trim()
    if (firstLast.length > 0) return firstLast
    if (record.creator.username && record.creator.username.length > 0) return record.creator.username
    if (record.creator.email && record.creator.email.length > 0) return record.creator.email
    return "Не указан"
  }
</script>

<div class="flex-1 min-h-0 flex flex-col">
  <div class="flex-1 min-h-0 overflow-auto">
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
          {#each medicalRecordsResponse.data.items as record (record.id)}
            <Table.Row>
              <Table.Cell class="font-medium">{patientNameFromRecord(record)}</Table.Cell>
              <Table.Cell>{record.chief_complaint ?? "Не указано."}</Table.Cell>
              <Table.Cell>{record.diagnosis}</Table.Cell>
              <Table.Cell>{record.treatment}</Table.Cell>
              <Table.Cell>
                {#if record.procedures.length === 0}
                  —
                {:else}
                  <div class="flex flex-wrap gap-1">
                    {#each record.procedures as procedure (procedure.id)}
                      <Badge variant="secondary">{procedure.name}</Badge>
                    {/each}
                  </div>
                {/if}
              </Table.Cell>
              <Table.Cell>{creatorNameFromRecord(record)}</Table.Cell>
              <Table.Cell>{record.created_at}</Table.Cell>
              <Table.Cell class="text-end">
                <MedicalRecordEditSheet
                  {record}
                  onUpdate={onUpdateMedicalRecord}
                  {onSearchProcedures}
                />
              </Table.Cell>
            </Table.Row>
          {/each}
        {/if}
      </Table.Body>
    </Table.Root>
  </div>

  {#if medicalRecordsResponse && medicalRecordsResponse.ok}
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
