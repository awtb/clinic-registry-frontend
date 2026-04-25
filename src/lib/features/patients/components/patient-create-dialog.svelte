<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import { PatientCreateSchema } from "$lib/schemas/patient"
  import { dateProxy, superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import type { GenderOption } from "../model/types"

  type CreateData = z.infer<typeof PatientCreateSchema>

  const { genders, onCreate } = $props<{
    genders: GenderOption[]
    onCreate: (data: CreateData) => Promise<{ ok: boolean; error?: string }>
  }>()

  let open = $state(false)

  const initialData: CreateData = {
    first_name: "Исломджон",
    last_name: "Хушназаров",
    phone_number: "+992901234567",
    birth_date: new Date("2004-11-13"),
    passport_number: "AA1234567",
    gender: "MALE",
  }

  const sf = superForm<CreateData, string>(initialData, {
    SPA: true,
    validators: zod4Client(PatientCreateSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return

      const data: CreateData = {
        ...form.data,
        phone_number: form.data.phone_number?.trim() || undefined,
        passport_number: form.data.passport_number?.trim() || undefined,
      }
      const result = await onCreate(data)

      if (!result.ok) {
        form.message = result.error ?? "Не удалось создать пациента."
        return
      }

      sf.reset()
      open = false
    },
  })

  const { form, errors, message, enhance, submitting } = sf
  const birthDate = dateProxy(sf, "birth_date", { format: "date" })

  const triggerGender = $derived(
    genders.find((option: GenderOption) => option.value === $form.gender)?.label ?? "Выберите пол",
  )
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить пациента
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-106.25">
    <form method="POST" use:enhance>
      <Dialog.Header>
        <Dialog.Title>Добавление нового пациента</Dialog.Title>
        <Dialog.Description>Внесите необходимые данные нового пациента.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-patient-first-name">Имя</Label>
          <Input
            id="create-patient-first-name"
            name="first_name"
            bind:value={$form.first_name}
            aria-invalid={$errors.first_name ? "true" : undefined}
          />
          {#if $errors.first_name}
            <p class="text-sm text-destructive">{$errors.first_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-last-name">Фамилия</Label>
          <Input
            id="create-patient-last-name"
            name="last_name"
            bind:value={$form.last_name}
            aria-invalid={$errors.last_name ? "true" : undefined}
          />
          {#if $errors.last_name}
            <p class="text-sm text-destructive">{$errors.last_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-birth-date">Дата рождения</Label>
          <Input
            id="create-patient-birth-date"
            name="birth_date"
            type="date"
            bind:value={$birthDate}
          />
          {#if $errors.birth_date}
            <p class="text-sm text-destructive">{$errors.birth_date}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-phone">Номер телефона</Label>
          <Input
            id="create-patient-phone"
            name="phone"
            type="tel"
            bind:value={$form.phone_number}
          />
          {#if $errors.phone_number}
            <p class="text-sm text-destructive">{$errors.phone_number}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-passport">Паспорт</Label>
          <Input
            id="create-patient-passport"
            name="passport"
            bind:value={$form.passport_number}
          />
          {#if $errors.passport_number}
            <p class="text-sm text-destructive">{$errors.passport_number}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-gender">Пол</Label>
          <Select.Root type="single" bind:value={$form.gender}>
            <Select.Trigger id="create-patient-gender" class="w-45">{triggerGender}</Select.Trigger>
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

        <Dialog.Footer class="mt-4">
          <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>
            Отменить
          </Dialog.Close>
          <Button type="submit" disabled={$submitting}>
            {$submitting ? "Сохранение..." : "Сохранить"}
          </Button>
        </Dialog.Footer>
      </div>
    </form>
  </Dialog.Content>
</Dialog.Root>
