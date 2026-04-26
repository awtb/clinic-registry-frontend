<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { PatientUpdateSchema } from "$lib/schemas/patient"
  import { dateProxy, superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import type { GenderOption, Patient } from "../model/types"

  type UpdateData = z.infer<typeof PatientUpdateSchema>

  const { patient, genders, onUpdate } = $props<{
    patient: Patient
    genders: GenderOption[]
    onUpdate: (patientId: string, data: UpdateData) => Promise<{ ok: boolean; error?: string }>
  }>()

  let open = $state(false)

  // svelte-ignore state_referenced_locally
  const initialData: UpdateData = {
    first_name: patient.first_name,
    last_name: patient.last_name,
    phone_number: patient.phone_number ?? "",
    birth_date: patient.birth_date ? new Date(patient.birth_date) : undefined,
    passport_number: patient.passport_number,
    gender: patient.gender,
  }

  const sf = superForm<UpdateData, string>(initialData, {
    SPA: true,
    validators: zod4Client(PatientUpdateSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return

      const data: UpdateData = {
        ...form.data,
        phone_number: form.data.phone_number?.trim() || undefined,
        passport_number: form.data.passport_number?.trim() || undefined,
      }
      const result = await onUpdate(patient.id, data)

      if (!result.ok) {
        form.message = result.error ?? "Не удалось обновить пациента."
        return
      }

      open = false
    },
  })

  const { form, errors, message, enhance, submitting } = sf
  const birthDate = dateProxy(sf, "birth_date", { format: "date" })

  const triggerGender = $derived(
    genders.find((option: GenderOption) => option.value === $form.gender)?.label ?? "Выберите пол",
  )
</script>

<Sheet.Root bind:open>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-106.25">
    <Sheet.Header>
      <Sheet.Title>Обновление данных пациента</Sheet.Title>
      <Sheet.Description>Внесите необходимые изменения в профиль пациента.</Sheet.Description>
    </Sheet.Header>

    <form method="POST" class="flex flex-col w-full h-full p-4" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-patient-first-name-${patient.id}`}>Имя</Label>
          <Input
            id={`edit-patient-first-name-${patient.id}`}
            name="first_name"
            bind:value={$form.first_name}
            aria-invalid={$errors.first_name ? "true" : undefined}
          />
          {#if $errors.first_name}
            <p class="text-sm text-destructive">{$errors.first_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-last-name-${patient.id}`}>Фамилия</Label>
          <Input
            id={`edit-patient-last-name-${patient.id}`}
            name="last_name"
            bind:value={$form.last_name}
            aria-invalid={$errors.last_name ? "true" : undefined}
          />
          {#if $errors.last_name}
            <p class="text-sm text-destructive">{$errors.last_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-birth-date-${patient.id}`}>Дата рождения</Label>
          <Input
            id={`edit-patient-birth-date-${patient.id}`}
            name="birth_date"
            type="date"
            bind:value={$birthDate}
          />
          {#if $errors.birth_date}
            <p class="text-sm text-destructive">{$errors.birth_date}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-phone-${patient.id}`}>Номер телефона</Label>
          <Input
            id={`edit-patient-phone-${patient.id}`}
            name="phone"
            type="tel"
            bind:value={$form.phone_number}
          />
          {#if $errors.phone_number}
            <p class="text-sm text-destructive">{$errors.phone_number}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-passport-${patient.id}`}>Паспорт</Label>
          <Input
            id={`edit-patient-passport-${patient.id}`}
            name="passport"
            bind:value={$form.passport_number}
          />
          {#if $errors.passport_number}
            <p class="text-sm text-destructive">{$errors.passport_number}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-gender-${patient.id}`}>Пол</Label>
          <Select.Root type="single" bind:value={$form.gender}>
            <Select.Trigger id={`edit-patient-gender-${patient.id}`} class="w-full">
              {triggerGender}
            </Select.Trigger>
            <Select.Content>
              {#each genders as gender (gender.value)}
                <Select.Item value={gender.value}>{gender.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          {#if $errors.gender}
            <p class="text-sm text-destructive">{$errors.gender}</p>
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
