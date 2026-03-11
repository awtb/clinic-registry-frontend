<script lang="ts">
  import { resolve } from "$app/paths"
  import { getContext } from "svelte"
  import { SvelteURL, SvelteURLSearchParams } from "svelte/reactivity"
  import { toast } from "svelte-sonner"
  import { PatientCreateSchema, PatientUpdateSchema } from "$lib/schemas/patient"
  import { type ApiClient, apiClientKey } from "$lib/shared/api/context"
  import PatientCreateDialog from "./patient-create-dialog.svelte"
  import PatientsSearch from "./patients-search.svelte"
  import PatientsTable from "./patients-table.svelte"
  import { patientGenderOptions } from "../model/constants"
  import type { PatientsPageRouteData } from "../model/types"

  const apiClient = getContext<ApiClient>(apiClientKey)

  const props = $props<{ data: PatientsPageRouteData }>()
  let patientsResponse = $state(props.data.patientsResponse)
  let searchQuery = $state(props.data.searchQuery ?? "")

  let currentPage = $derived(patientsResponse?.ok ? patientsResponse.data.page : 1)
  const totalPages = $derived(patientsResponse?.ok ? patientsResponse.data.total_pages : 1)
  const pageSize = $derived(patientsResponse?.ok ? patientsResponse.data.page_size : 10)
  const totalItems = $derived(patientsResponse?.ok ? patientsResponse.data.total_items : 0)

  let isLoading = $state(false)
  let isUpdatingPatient = $state<Record<string, boolean>>({})
  let editFormErrors = $state<Record<string, string>>({})

  const updateQueryParams = (nextPage: number, nextSize: number, nextSearchQuery: string) => {
    const params = new SvelteURLSearchParams()
    params.set("page", String(nextPage))
    params.set("page_size", String(nextSize))
    if (nextSearchQuery.trim().length > 0) params.set("search_query", nextSearchQuery.trim())

    const nextUrl = new SvelteURL(resolve("/patients"), globalThis.location.origin)
    nextUrl.search = params.toString()
    globalThis.history.replaceState(globalThis.history.state, "", nextUrl)
  }

  const setEditFormError = (patientId: string, message: string) => {
    editFormErrors = { ...editFormErrors, [patientId]: message }
  }

  const parseBirthDate = (birthDateValue: FormDataEntryValue | null) => {
    if (typeof birthDateValue !== "string" || birthDateValue.length === 0) return undefined
    return new Date(birthDateValue)
  }

  async function createPatient(event: SubmitEvent, genderValue: string) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formData = new FormData(form)

    const payload = PatientCreateSchema.safeParse({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      birth_date: parseBirthDate(formData.get("birth_date")),
      phone_number: formData.get("phone"),
      passport_number: formData.get("passport"),
      gender: genderValue,
    })

    if (!payload.success) {
      globalThis.console.error("Validation failed:", payload.error)
      return
    }

    const response = await apiClient.patients.create(payload.data)

    if (response.ok) {
      await loadPatientsPage(1)
    } else {
      globalThis.console.error("Failed to create patient:", response)
    }
  }

  async function updatePatient(event: SubmitEvent, patientId: string, genderValue: string) {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    setEditFormError(patientId, "")
    const formData = new FormData(form)
    const newGender = genderValue.length > 0 ? genderValue : undefined

    const updatePayload = PatientUpdateSchema.safeParse({
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      birth_date: parseBirthDate(formData.get("birth_date")),
      phone_number: formData.get("phone") as string,
      passport_number: formData.get("passport") as string,
      gender: newGender,
    })

    if (!updatePayload.success) {
      setEditFormError(patientId, updatePayload.error.issues[0]?.message ?? "Проверьте поля формы.")
      return
    }

    isUpdatingPatient = { ...isUpdatingPatient, [patientId]: true }
    const response = await apiClient.patients.update(patientId, updatePayload.data)

    if (response.ok) {
      toast.success("Данные о пациенте успешно обновлены.")
      await loadPatientsPage(currentPage)
    } else {
      setEditFormError(patientId, response.error.message || "Не удалось обновить пациента.")
    }
    isUpdatingPatient = { ...isUpdatingPatient, [patientId]: false }
  }

  let requestSeq = 0
  async function loadPatientsPage(page: number) {
    const seq = ++requestSeq
    isLoading = true

    const response = await apiClient.patients.getAll(page, pageSize, searchQuery)

    if (!response.ok) {
      globalThis.console.error("Failed to load patients:", response.error)
      if (seq === requestSeq) isLoading = false
      return
    }

    if (seq !== requestSeq) return

    patientsResponse = { ok: true, status: response.status, data: response.data }
    updateQueryParams(page, pageSize, searchQuery)

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

  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  const scheduleSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchDebounce = globalThis.setTimeout(() => loadPatientsPage(1), 300)
  }

  const clearSearch = () => {
    searchQuery = ""
    loadPatientsPage(1)
  }
</script>

<div class="h-full min-h-0 flex flex-col">
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold mb-4">Пациенты</h1>
    <PatientCreateDialog genders={patientGenderOptions} onSubmit={createPatient} />
  </div>

  <PatientsSearch bind:searchQuery {isLoading} onSearchInput={scheduleSearch} onClear={clearSearch} />

  <PatientsTable
    {patientsResponse}
    genders={patientGenderOptions}
    {searchQuery}
    {editFormErrors}
    {isUpdatingPatient}
    {totalItems}
    {currentPage}
    {pageSize}
    onPrev={goPrev}
    onNext={goNext}
    onPageSelect={loadPatientsPage}
    onUpdatePatient={updatePatient}
  />
</div>
