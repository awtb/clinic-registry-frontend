<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import type { GenderOption, Patient } from "../model/types"

  const {
    patient,
    genders,
    errorMessage = "",
    isSubmitting = false,
    onSubmit,
  } = $props<{
    patient: Patient
    genders: GenderOption[]
    errorMessage?: string
    isSubmitting?: boolean
    onSubmit: (event: SubmitEvent, patientId: string, genderValue: string) => void | Promise<void>
  }>()

  let genderValue = $state("")
  $effect(() => {
    genderValue = patient.gender
  })
  const triggerGender = $derived(
    genders.find((gender: GenderOption) => gender.value === genderValue)?.label ?? "Выберите пол",
  )
</script>

<Sheet.Root>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-106.25">
    <Sheet.Header>
      <Sheet.Title>Обновление данных пациента</Sheet.Title>
      <Sheet.Description>Внесите необходимые изменения в профиль пациента.</Sheet.Description>
    </Sheet.Header>

    <form
      onsubmit={(event) => onSubmit(event, patient.id, genderValue)}
      class="flex flex-col w-full h-full p-4"
    >
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-patient-first-name-${patient.id}`}>Имя</Label>
          <Input
            id={`edit-patient-first-name-${patient.id}`}
            name="first_name"
            defaultValue={patient.first_name}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-last-name-${patient.id}`}>Фамилия</Label>
          <Input
            id={`edit-patient-last-name-${patient.id}`}
            name="last_name"
            defaultValue={patient.last_name}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-birth-date-${patient.id}`}>Дата рождения</Label>
          <Input
            id={`edit-patient-birth-date-${patient.id}`}
            name="birth_date"
            type="date"
            defaultValue={patient.birth_date ?? ""}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-phone-${patient.id}`}>Номер телефона</Label>
          <Input
            id={`edit-patient-phone-${patient.id}`}
            name="phone"
            type="tel"
            defaultValue={patient.phone_number ?? ""}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-passport-${patient.id}`}>Паспорт</Label>
          <Input
            id={`edit-patient-passport-${patient.id}`}
            name="passport"
            defaultValue={patient.passport_number}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-patient-gender-${patient.id}`}>Пол</Label>
          <Select.Root type="single" bind:value={genderValue}>
            <Select.Trigger id={`edit-patient-gender-${patient.id}`} class="w-full">
              {triggerGender}
            </Select.Trigger>
            <Select.Content>
              {#each genders as gender (gender.value)}
                <Select.Item value={gender.value}>{gender.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
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
