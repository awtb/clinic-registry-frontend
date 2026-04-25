<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import ProcedureMultiSelect from "$lib/features/procedures/components/procedure-multi-select.svelte"
  import type { Procedure } from "$lib/features/procedures/model/types"
  import { MedicalRecordUpdateSchema } from "$lib/schemas/medical-record"
  import { superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import type { MedicalRecord } from "../model/types"

  type UpdateData = z.infer<typeof MedicalRecordUpdateSchema>
  type SelectedProcedure = { id: string; label: string }

  const { record, onUpdate, onSearchProcedures } = $props<{
    record: MedicalRecord
    onUpdate: (recordId: string, data: UpdateData) => Promise<{ ok: boolean; error?: string }>
    onSearchProcedures: (query: string) => Promise<Procedure[]>
  }>()

  let open = $state(false)
  let selectedProcedures = $state<SelectedProcedure[]>(
    record.procedures.map((procedure: Procedure) => ({
      id: procedure.id,
      label: `${procedure.code} — ${procedure.name}`,
    })),
  )

  const initialData: UpdateData = {
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    procedure_ids: record.procedure_ids,
    chief_complaint: record.chief_complaint,
  }

  const sf = superForm<UpdateData, string>(initialData, {
    SPA: true,
    validators: zod4Client(MedicalRecordUpdateSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return

      const data: UpdateData = {
        ...form.data,
        chief_complaint: form.data.chief_complaint?.trim() ? form.data.chief_complaint : null,
      }
      const result = await onUpdate(record.id, data)

      if (!result.ok) {
        form.message = result.error ?? "Не удалось обновить запись."
        return
      }

      open = false
    },
  })

  const { form, errors, message, enhance, submitting } = sf
</script>

<Sheet.Root bind:open>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-140">
    <Sheet.Header>
      <Sheet.Title>Редактирование медицинской записи</Sheet.Title>
      <Sheet.Description>Измените данные диагноза и лечения.</Sheet.Description>
    </Sheet.Header>

    <form method="POST" class="flex flex-col w-full h-full p-4" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-medical-record-chief-complaint-${record.id}`}>Жалоба</Label>
          <Textarea
            id={`edit-medical-record-chief-complaint-${record.id}`}
            name="chief_complaint"
            rows={3}
            bind:value={$form.chief_complaint}
          />
          {#if $errors.chief_complaint}
            <p class="text-sm text-destructive">{$errors.chief_complaint}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-medical-record-diagnosis-${record.id}`}>Диагноз</Label>
          <Input
            id={`edit-medical-record-diagnosis-${record.id}`}
            name="diagnosis"
            bind:value={$form.diagnosis}
            aria-invalid={$errors.diagnosis ? "true" : undefined}
          />
          {#if $errors.diagnosis}
            <p class="text-sm text-destructive">{$errors.diagnosis}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-medical-record-treatment-${record.id}`}>Лечение</Label>
          <Textarea
            id={`edit-medical-record-treatment-${record.id}`}
            name="treatment"
            rows={3}
            bind:value={$form.treatment}
            aria-invalid={$errors.treatment ? "true" : undefined}
          />
          {#if $errors.treatment}
            <p class="text-sm text-destructive">{$errors.treatment}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-medical-record-procedures-${record.id}`}>Процедуры</Label>
          <ProcedureMultiSelect
            triggerId={`edit-medical-record-procedures-${record.id}`}
            bind:selectedIds={$form.procedure_ids}
            bind:selectedProcedures
            onSearch={onSearchProcedures}
          />
          {#if $errors.procedure_ids}
            <p class="text-sm text-destructive">{$errors.procedure_ids}</p>
          {/if}
        </div>

        {#if $message}
          <p class="text-sm text-destructive">{$message}</p>
        {/if}

        <Sheet.Footer class="mt-4">
          <Sheet.Close type="button" class={buttonVariants({ variant: "outline" })}>
            Отменить
          </Sheet.Close>
          <Button type="submit" disabled={$submitting}>
            {$submitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </Sheet.Footer>
      </div>
    </form>
  </Sheet.Content>
</Sheet.Root>
