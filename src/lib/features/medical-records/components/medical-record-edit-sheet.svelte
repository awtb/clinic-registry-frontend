<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import ProcedureMultiSelect from "$lib/features/procedures/components/procedure-multi-select.svelte"
  import type { Procedure } from "$lib/features/procedures/model/types"
  import { untrack } from "svelte"
  import type { MedicalRecord } from "../model/types"

  type SelectedProcedure = { id: string; label: string }

  const {
    record,
    errorMessage = "",
    isSubmitting = false,
    onSubmit,
    onSearchProcedures,
  } = $props<{
    record: MedicalRecord
    errorMessage?: string
    isSubmitting?: boolean
    onSubmit: (
      event: SubmitEvent,
      recordId: string,
      selectedProcedureIds: string[],
    ) => void | Promise<void>
    onSearchProcedures: (query: string) => Promise<Procedure[]>
  }>()

  let selectedProcedureIds = $state<string[]>(untrack(() => (record as MedicalRecord).procedure_ids))
  let selectedProcedures = $state<SelectedProcedure[]>(
    untrack(() =>
      (record as MedicalRecord).procedures.map((procedure) => ({
        id: procedure.id,
        label: `${procedure.code} — ${procedure.name}`,
      })),
    ),
  )
</script>

<Sheet.Root>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-140">
    <Sheet.Header>
      <Sheet.Title>Редактирование медицинской записи</Sheet.Title>
      <Sheet.Description>Измените данные диагноза и лечения.</Sheet.Description>
    </Sheet.Header>

    <form
      class="flex flex-col w-full h-full p-4"
      onsubmit={(event) => onSubmit(event, record.id, selectedProcedureIds)}
    >
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-medical-record-chief-complaint-${record.id}`}>Жалоба</Label>
          <Textarea
            id={`edit-medical-record-chief-complaint-${record.id}`}
            name="chief_complaint"
            rows={3}
            defaultValue={record.chief_complaint ?? ""}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-medical-record-diagnosis-${record.id}`}>Диагноз</Label>
          <Input
            id={`edit-medical-record-diagnosis-${record.id}`}
            name="diagnosis"
            defaultValue={record.diagnosis}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-medical-record-treatment-${record.id}`}>Лечение</Label>
          <Textarea
            id={`edit-medical-record-treatment-${record.id}`}
            name="treatment"
            rows={3}
            defaultValue={record.treatment}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-medical-record-procedures-${record.id}`}>Процедуры</Label>
          <ProcedureMultiSelect
            triggerId={`edit-medical-record-procedures-${record.id}`}
            bind:selectedIds={selectedProcedureIds}
            bind:selectedProcedures
            onSearch={onSearchProcedures}
          />
        </div>

        {#if errorMessage}
          <p class="text-sm text-destructive">{errorMessage}</p>
        {/if}

        <Sheet.Footer class="mt-4">
          <Sheet.Close type="button" class={buttonVariants({ variant: "outline" })}>
            Отменить
          </Sheet.Close>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </Sheet.Footer>
      </div>
    </form>
  </Sheet.Content>
</Sheet.Root>
