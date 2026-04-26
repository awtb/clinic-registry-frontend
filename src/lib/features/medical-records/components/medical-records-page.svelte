<script lang="ts">
  import { resolve } from "$app/paths"
  import { MedicalRecordCreateSchema, MedicalRecordUpdateSchema } from "$lib/schemas/medical-record"
  import type { z } from "zod"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import type { Procedure } from "$lib/features/procedures/model/types"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { createQuery, createMutation, useQueryClient } from "@tanstack/svelte-query"
  import MedicalRecordCreateDialog from "./medical-record-create-dialog.svelte"
  import MedicalRecordsTable from "./medical-records-table.svelte"
  import type {
    MedicalRecordsPageData,
    MedicalRecordsPageResponse,
    MedicalRecordsPageRouteData,
    PatientOption,
  } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)
  const queryClient = useQueryClient()

  const props = $props<{ data: MedicalRecordsPageRouteData }>()

  // svelte-ignore state_referenced_locally
  const initial = props.data.medicalRecordsResponse?.ok
    ? props.data.medicalRecordsResponse.data
    : undefined

  let page = $state(initial?.page ?? 1)
  let pageSize = $state(initial?.page_size ?? 10)

  const recordsQuery = createQuery<MedicalRecordsPageData>(() => ({
    queryKey: ["medical-records", { page, pageSize }],
    queryFn: async ({ signal }) => {
      const result = await apiClient.medicalRecords.getAll(page, pageSize, { signal })
      if (!result.ok) throw result.error
      return result.data
    },
    initialData:
      page === (initial?.page ?? 1) && pageSize === (initial?.page_size ?? 10) ? initial : undefined,
    initialDataUpdatedAt: initial ? Date.now() : undefined,
    placeholderData: (prev: MedicalRecordsPageData | undefined) => prev,
  }))

  $effect(() => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(page))
    params.set("page_size", String(pageSize))

    const nextUrl = new SvelteURL(resolve("/records"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  })

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

  const createRecordMut = createMutation(() => ({
    mutationFn: async (data: z.infer<typeof MedicalRecordCreateSchema>) => {
      const result = await apiClient.medicalRecords.create(data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Медицинская запись успешно создана.")
      page = 1
      queryClient.invalidateQueries({ queryKey: ["medical-records"] })
    },
  }))

  const updateRecordMut = createMutation(() => ({
    mutationFn: async (vars: {
      recordId: string
      data: z.infer<typeof MedicalRecordUpdateSchema>
    }) => {
      const result = await apiClient.medicalRecords.update(vars.recordId, vars.data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Медицинская запись успешно обновлена.")
      queryClient.invalidateQueries({ queryKey: ["medical-records"] })
    },
  }))

  async function createMedicalRecord(data: z.infer<typeof MedicalRecordCreateSchema>) {
    try {
      await createRecordMut.mutateAsync(data)
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось создать медицинскую запись.",
      }
    }
  }

  async function updateMedicalRecord(
    recordId: string,
    data: z.infer<typeof MedicalRecordUpdateSchema>,
  ) {
    try {
      await updateRecordMut.mutateAsync({ recordId, data })
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось обновить запись.",
      }
    }
  }

  const medicalRecordsResponse = $derived<MedicalRecordsPageResponse | null>(
    recordsQuery.data ? { ok: true, status: 200, data: recordsQuery.data } : null,
  )
  const currentPage = $derived(recordsQuery.data?.page ?? page)
  const totalPages = $derived(recordsQuery.data?.total_pages ?? 1)
  const currentPageSize = $derived(recordsQuery.data?.page_size ?? pageSize)
  const totalItems = $derived(recordsQuery.data?.total_items ?? 0)

  function goPrev() {
    if (page <= 1) return
    page = page - 1
  }

  function goNext() {
    if (page >= totalPages) return
    page = page + 1
  }

  function goToPage(p: number) {
    page = p
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
    pageSize={currentPageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={goToPage}
    onUpdateMedicalRecord={updateMedicalRecord}
    onSearchProcedures={searchProcedures}
  />
</div>
