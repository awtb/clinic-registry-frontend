<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Command from "$lib/components/ui/command/index.js"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Popover from "$lib/components/ui/popover/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import { cn } from "$lib/utils.js"
  import { CheckIcon, ChevronsUpDownIcon } from "lucide-svelte"
  import type { PatientOption } from "../model/types"

  const {
    createFormError = "",
    onSubmit,
    onSearchPatients,
  } = $props<{
    createFormError?: string
    onSubmit: (event: SubmitEvent, selectedPatientId: string) => void | Promise<boolean>
    onSearchPatients: (query: string) => Promise<PatientOption[]>
  }>()

  let open = $state(false)
  let patientInputValue = $state("")
  let selectedPatientId = $state("")
  let selectedPatientLabel = $state("")
  let patientOptions = $state<PatientOption[]>([])
  let searchDebounceTimeout: ReturnType<typeof globalThis.setTimeout> | null = null
  let latestSearchRequestId = 0

  const selectedValue = $derived(selectedPatientLabel)

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

  async function handleSubmit(event: SubmitEvent) {
    const result = await onSubmit(event, selectedPatientId)

    if (result !== true) return

    const form = event.target as HTMLFormElement
    form.reset()
    patientInputValue = ""
    selectedPatientId = ""
    selectedPatientLabel = ""
    patientOptions = []
    open = false
  }
</script>

<Dialog.Root>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить запись
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[560px]">
    <form method="POST" onsubmit={handleSubmit}>
      <Dialog.Header>
        <Dialog.Title>Добавление медицинской записи</Dialog.Title>
        <Dialog.Description>Заполните данные по пациенту и лечению.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-medical-record-patient">Пациент</Label>

          <Popover.Root bind:open>
            <Popover.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  variant="outline"
                  class="w-[200px] justify-between"
                  role="combobox"
                  aria-expanded={open}
                  id="create-medical-record-patient"
                >
                  {selectedValue || "Выберите пациента"}
                  <ChevronsUpDownIcon class="opacity-50" />
                </Button>
              {/snippet}
            </Popover.Trigger>
            <Popover.Content class="w-[200px] p-0">
              <Command.Root>
                <Command.Input
                  placeholder="Поиск пациента"
                  bind:value={patientInputValue}
                  oninput={schedulePatientSearch}
                />
                <Command.List>
                  <Command.Empty>Пациент не найден</Command.Empty>
                  <Command.Group value="patients">
                    {#each patientOptions as patient (patient.value)}
                      <Command.Item
                        value={patient.value}
                        onSelect={() => {
                          selectedPatientId = patient.value
                          selectedPatientLabel = patient.label
                          patientInputValue = patient.label
                          open = false
                        }}
                      >
                        <CheckIcon class={cn(selectedPatientId !== patient.value && "text-transparent")} />
                        {patient.label}
                      </Command.Item>
                    {/each}
                  </Command.Group>
                </Command.List>
              </Command.Root>
            </Popover.Content>
          </Popover.Root>
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
          <Textarea id="create-medical-record-procedures" name="procedures" rows={3} />
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
