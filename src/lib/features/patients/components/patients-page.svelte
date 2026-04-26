<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { PatientCreateSchema, PatientUpdateSchema } from "$lib/schemas/patient"
  import type { z } from "zod"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import { createQuery, createMutation, useQueryClient } from "@tanstack/svelte-query"
  import PatientCreateDialog from "./patient-create-dialog.svelte"
  import PatientsSearch from "./patients-search.svelte"
  import PatientsTable from "./patients-table.svelte"
  import { patientGenderOptions } from "../model/constants"
  import type {
    PatientsPageData,
    PatientsPageResponse,
    PatientsPageRouteData,
  } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)
  const queryClient = useQueryClient()

  const props = $props<{ data: PatientsPageRouteData }>()

  // svelte-ignore state_referenced_locally
  const initial = props.data.patientsResponse?.ok ? props.data.patientsResponse.data : undefined

  // svelte-ignore state_referenced_locally
  let searchQuery = $state(props.data.searchQuery ?? "")
  // svelte-ignore state_referenced_locally
  let debouncedSearch = $state(props.data.searchQuery ?? "")
  let page = $state(initial?.page ?? 1)
  let pageSize = $state(initial?.page_size ?? 10)

  const patientsQuery = createQuery<PatientsPageData>(() => ({
    queryKey: ["patients", { page, pageSize, search: debouncedSearch }],
    queryFn: async ({ signal }) => {
      const result = await apiClient.patients.getAll(page, pageSize, debouncedSearch, { signal })
      if (!result.ok) throw result.error
      return result.data
    },
    initialData:
      page === (initial?.page ?? 1) &&
      pageSize === (initial?.page_size ?? 10) &&
      debouncedSearch === (props.data.searchQuery ?? "")
        ? initial
        : undefined,
    initialDataUpdatedAt: initial ? Date.now() : undefined,
    placeholderData: (prev: PatientsPageData | undefined) => prev,
  }))

  $effect(() => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(page))
    params.set("page_size", String(pageSize))
    if (debouncedSearch.trim().length > 0) params.set("search_query", debouncedSearch.trim())

    const nextUrl = new SvelteURL(resolve("/patients"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  })

  const createPatientMut = createMutation(() => ({
    mutationFn: async (data: z.infer<typeof PatientCreateSchema>) => {
      const result = await apiClient.patients.create(data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Пациент успешно добавлен.")
      page = 1
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  }))

  const updatePatientMut = createMutation(() => ({
    mutationFn: async (vars: { patientId: string; data: z.infer<typeof PatientUpdateSchema> }) => {
      const result = await apiClient.patients.update(vars.patientId, vars.data)
      if (!result.ok) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success("Данные о пациенте успешно обновлены.")
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  }))

  async function createPatient(data: z.infer<typeof PatientCreateSchema>) {
    try {
      await createPatientMut.mutateAsync(data)
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось создать пациента.",
      }
    }
  }

  async function updatePatient(patientId: string, data: z.infer<typeof PatientUpdateSchema>) {
    try {
      await updatePatientMut.mutateAsync({ patientId, data })
      return { ok: true }
    } catch (e) {
      return {
        ok: false,
        error: (e as { message?: string })?.message ?? "Не удалось обновить пациента.",
      }
    }
  }

  const patientsResponse = $derived<PatientsPageResponse | null>(
    patientsQuery.data ? { ok: true, status: 200, data: patientsQuery.data } : null,
  )
  const currentPage = $derived(patientsQuery.data?.page ?? page)
  const totalPages = $derived(patientsQuery.data?.total_pages ?? 1)
  const currentPageSize = $derived(patientsQuery.data?.page_size ?? pageSize)
  const totalItems = $derived(patientsQuery.data?.total_items ?? 0)

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

  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  const scheduleSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchDebounce = globalThis.setTimeout(() => {
      page = 1
      debouncedSearch = searchQuery
    }, 300)
  }

  const clearSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchQuery = ""
    page = 1
    debouncedSearch = ""
  }
</script>

<div class="h-full min-h-0 flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold mb-4">Пациенты</h1>
    <PatientCreateDialog genders={patientGenderOptions} onCreate={createPatient} />
  </div>

  <PatientsSearch
    bind:searchQuery
    isLoading={patientsQuery.isFetching}
    onSearchInput={scheduleSearch}
    onClear={clearSearch}
  />

  <PatientsTable
    {patientsResponse}
    genders={patientGenderOptions}
    searchQuery={debouncedSearch}
    {totalItems}
    {currentPage}
    pageSize={currentPageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={goToPage}
    onUpdatePatient={updatePatient}
  />
</div>
