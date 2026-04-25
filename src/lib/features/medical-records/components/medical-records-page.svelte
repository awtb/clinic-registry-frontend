<script lang="ts">
  import { resolve } from "$app/paths"
  import { MedicalRecordCreateSchema, MedicalRecordUpdateSchema } from "$lib/schemas/medical-record"
  import type { z } from "zod"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import type { Procedure } from "$lib/features/procedures/model/types"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import MedicalRecordCreateDialog from "./medical-record-create-dialog.svelte"
  import MedicalRecordsTable from "./medical-records-table.svelte"
  import type { MedicalRecordsPageRouteData, PatientOption } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: MedicalRecordsPageRouteData }>()
  let medicalRecordsResponse = $state(props.data.medicalRecordsResponse)

  let currentPage = $derived(medicalRecordsResponse?.ok ? medicalRecordsResponse.data.page : 1)
  const totalPages = $derived(
    medicalRecordsResponse?.ok ? medicalRecordsResponse.data.total_pages : 1,
  )
  const pageSize = $derived(medicalRecordsResponse?.ok ? medicalRecordsResponse.data.page_size : 10)
  const totalItems = $derived(
    medicalRecordsResponse?.ok ? medicalRecordsResponse.data.total_items : 0,
  )

  let isLoading = $state(false)

  const updateQueryParams = (nextPage: number, nextSize: number) => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))

    const nextUrl = new SvelteURL(resolve("/records"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  }

  async function searchPatients(query: string): Promise<PatientOption[]> {
    if (query.trim().length === 0) return []

    const response = await apiClient.patients.getAll(1, 20, query)

    if (!response.ok) {
      globalThis.console.error("Failed to search patients:", response.error)
      return []
    }

    return response.data.items.map((patient) => ({
      value: patient.id,
      label: `${patient.first_name} ${patient.last_name}`,
      birth_date: patient.birth_date,
      passport_number: patient.passport_number,
      phone_number: patient.phone_number,
    }))
  }

  async function searchProcedures(query: string): Promise<Procedure[]> {
    const response = await apiClient.procedures.getAll(1, 20, query, undefined, true)
    if (!response.ok) {
      globalThis.console.error("Failed to search procedures:", response.error)
      return []
    }
    return response.data.items
  }

  async function createMedicalRecord(
    data: z.infer<typeof MedicalRecordCreateSchema>,
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await apiClient.medicalRecords.create(data)

    if (!response.ok) {
      return {
        ok: false,
        error: response.error.message || "Не удалось создать медицинскую запись.",
      }
    }

    toast.success("Медицинская запись успешно создана.")
    await loadMedicalRecordsPage(1)
    return { ok: true }
  }

  async function updateMedicalRecord(
    recordId: string,
    data: z.infer<typeof MedicalRecordUpdateSchema>,
  ): Promise<{ ok: boolean; error?: string }> {
    const response = await apiClient.medicalRecords.update(recordId, data)

    if (!response.ok) {
      return { ok: false, error: response.error.message || "Не удалось обновить запись." }
    }

    toast.success("Медицинская запись успешно обновлена.")
    await loadMedicalRecordsPage(currentPage)
    return { ok: true }
  }

  let requestSeq = 0
  async function loadMedicalRecordsPage(page: number) {
    const seq = ++requestSeq
    isLoading = true

    const response = await apiClient.medicalRecords.getAll(page, pageSize)

    if (!response.ok) {
      globalThis.console.error("Failed to load medical records:", response.error)
      if (seq === requestSeq) isLoading = false
      return
    }

    if (seq !== requestSeq) return

    medicalRecordsResponse = { ok: true, status: response.status, data: response.data }
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

<div class="h-full min-h-0 flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold mb-4">Медицинские записи</h1>
    <MedicalRecordCreateDialog
      onCreate={createMedicalRecord}
      onSearchPatients={searchPatients}
      onSearchProcedures={searchProcedures}
    />
  </div>

  <MedicalRecordsTable
    {medicalRecordsResponse}
    {totalItems}
    {currentPage}
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadMedicalRecordsPage}
    onUpdateMedicalRecord={updateMedicalRecord}
    onSearchProcedures={searchProcedures}
  />
</div>
