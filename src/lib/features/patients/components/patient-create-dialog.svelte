<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import type { GenderOption } from "../model/types"

  const { genders, onSubmit } = $props<{
    genders: GenderOption[]
    onSubmit: (event: SubmitEvent, genderValue: string) => void | Promise<void>
  }>()

  let genderValue = $state("")
  const triggerGender = $derived(
    genders.find((gender: GenderOption) => gender.value === genderValue)?.label ?? "Выберите пол",
  )
</script>

<Dialog.Root>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить пациента
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[425px]">
    <form method="POST" onsubmit={(event) => onSubmit(event, genderValue)}>
      <Dialog.Header>
        <Dialog.Title>Добавление нового пациента</Dialog.Title>
        <Dialog.Description>Внесите необходимые данные нового пациента.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-patient-first-name">Имя</Label>
          <Input id="create-patient-first-name" name="first_name" defaultValue="Исломджон" />
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-last-name">Фамилия</Label>
          <Input id="create-patient-last-name" name="last_name" defaultValue="Хушназаров" />
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-birth-date">Дата рождения</Label>
          <Input
            id="create-patient-birth-date"
            name="birth_date"
            type="date"
            defaultValue="2004-11-13"
          />
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-phone">Номер телефона</Label>
          <Input id="create-patient-phone" name="phone" type="tel" defaultValue="+992901234567" />
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-passport">Паспорт</Label>
          <Input id="create-patient-passport" name="passport" defaultValue="AA1234567" />
        </div>

        <div class="grid gap-3">
          <Label for="create-patient-gender">Пол</Label>
          <Select.Root type="single" bind:value={genderValue}>
            <Select.Trigger id="create-patient-gender" class="w-[180px]">{triggerGender}</Select.Trigger>
            <Select.Content>
              {#each genders as gender (gender.value)}
                <Select.Item value={gender.value}>{gender.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

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
