<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Command from "$lib/components/ui/command/index.js"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import ProcedureMultiSelect from "$lib/features/procedures/components/procedure-multi-select.svelte"
  import type { Procedure } from "$lib/features/procedures/model/types"
  import type { PatientOption } from "../model/types"

  type SelectedProcedure = { id: string; label: string }

  const {
    createFormError = "",
    onSubmit,
    onSearchPatients,
    onSearchProcedures,
  } = $props<{
    createFormError?: string
    onSubmit: (
      event: SubmitEvent,
      selectedPatientId: string,
      selectedProcedureIds: string[],
    ) => void | Promise<boolean>
    onSearchPatients: (query: string) => Promise<PatientOption[]>
    onSearchProcedures: (query: string) => Promise<Procedure[]>
  }>()

  let patientInputValue = $state("")
  let selectedPatient = $state<PatientOption | null>(null)
  let patientOptions = $state<PatientOption[]>([])
  let searchDebounceTimeout: ReturnType<typeof globalThis.setTimeout> | null = null
  let latestSearchRequestId = 0

  let selectedProcedureIds = $state<string[]>([])
  let selectedProcedures = $state<SelectedProcedure[]>([])

  function formatPatientDetails(patient: PatientOption): string {
    return [patient.passport_number, patient.birth_date, patient.phone_number]
      .filter((value): value is string => Boolean(value && value.length > 0))
      .join(" · ")
  }

  async function loadPatientOptions(query: string) {
    const requestId = ++latestSearchRequestId

    if (query.trim().length === 0) {
      patientOptions = []
      return
    }

    const options = await onSearchPatients(query)

    if (requestId !== latestSearchRequestId) return
    patientOptions = options
  }

  const schedulePatientSearch = () => {
    if (searchDebounceTimeout) globalThis.clearTimeout(searchDebounceTimeout)
    searchDebounceTimeout = globalThis.setTimeout(() => {
      loadPatientOptions(patientInputValue)
    }, 300)
  }

  function selectPatient(patient: PatientOption) {
    selectedPatient = patient
    patientInputValue = ""
    patientOptions = []
  }

  function clearSelectedPatient() {
    selectedPatient = null
  }

  async function handleSubmit(event: SubmitEvent) {
    const result = await onSubmit(event, selectedPatient?.value ?? "", selectedProcedureIds)

    if (result !== true) return

    const form = event.target as HTMLFormElement
    form.reset()
    patientInputValue = ""
    selectedPatient = null
    patientOptions = []
    selectedProcedureIds = []
    selectedProcedures = []
  }
</script>

<Dialog.Root>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить запись
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-140">
    <form method="POST" onsubmit={handleSubmit}>
      <Dialog.Header>
        <Dialog.Title>Добавление медицинской записи</Dialog.Title>
        <Dialog.Description>Заполните данные по пациенту и лечению.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-medical-record-patient">Пациент</Label>

          {#if selectedPatient}
            <div
              id="create-medical-record-patient"
              class="flex items-start justify-between gap-3 rounded-md border bg-muted/30 p-3"
            >
              <div class="min-w-0 flex-1">
                <p class="font-medium truncate">{selectedPatient.label}</p>
                {#if formatPatientDetails(selectedPatient)}
                  <p class="text-xs text-muted-foreground truncate">
                    {formatPatientDetails(selectedPatient)}
                  </p>
                {/if}
              </div>
              <Button type="button" variant="ghost" size="sm" onclick={clearSelectedPatient}>
                Сменить
              </Button>
            </div>
          {:else}
            <Command.Root shouldFilter={false} class="rounded-md border">
              <Command.Input
                id="create-medical-record-patient"
                placeholder="Поиск пациента (имя, фамилия)"
                bind:value={patientInputValue}
                oninput={schedulePatientSearch}
              />
              <Command.List class="max-h-56">
                <Command.Empty>
                  {patientInputValue.trim().length === 0
                    ? "Начните вводить имя пациента"
                    : "Пациент не найден"}
                </Command.Empty>
                <Command.Group value="patients">
                  {#each patientOptions as patient (patient.value)}
                    <Command.Item value={patient.value} onSelect={() => selectPatient(patient)}>
                      <div class="flex flex-col gap-0.5">
                        <span class="font-medium">{patient.label}</span>
                        {#if formatPatientDetails(patient)}
                          <span class="text-xs text-muted-foreground">
                            {formatPatientDetails(patient)}
                          </span>
                        {/if}
                      </div>
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.List>
            </Command.Root>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-medical-record-chief-complaint">Жалоба</Label>
          <Textarea id="create-medical-record-chief-complaint" name="chief_complaint" rows={3} />
        </div>

        <div class="grid gap-3">
          <Label for="create-medical-record-diagnosis">Диагноз</Label>
          <Input id="create-medical-record-diagnosis" name="diagnosis" />
        </div>

        <div class="grid gap-3">
          <Label for="create-medical-record-treatment">Лечение</Label>
          <Textarea id="create-medical-record-treatment" name="treatment" rows={3} />
        </div>

        <div class="grid gap-3">
          <Label for="create-medical-record-procedures">Процедуры</Label>
          <ProcedureMultiSelect
            triggerId="create-medical-record-procedures"
            bind:selectedIds={selectedProcedureIds}
            bind:selectedProcedures
            onSearch={onSearchProcedures}
          />
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
