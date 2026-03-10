<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import type { RoleOption } from "../model/types"

  const { roles, onSubmit } = $props<{
    roles: RoleOption[]
    onSubmit: (event: SubmitEvent, roleValue: string) => void | Promise<void>
  }>()

  let roleValue = $state("")
  const triggerRole = $derived(
    roles.find((role: RoleOption) => role.value === roleValue)?.label ?? "Выберите роль",
  )
</script>

<Dialog.Root>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить пользователя
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-[425px]">
    <form method="POST" onsubmit={(event) => onSubmit(event, roleValue)}>
      <Dialog.Header>
        <Dialog.Title>Добавление нового пользователя</Dialog.Title>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-user-first-name">Имя</Label>
          <Input id="create-user-first-name" name="first_name" defaultValue="Исломджон" />
        </div>

        <div class="grid gap-3">
          <Label for="create-user-last-name">Фамилия</Label>
          <Input id="create-user-last-name" name="last_name" defaultValue="Хушназаров" />
        </div>

        <div class="grid gap-3">
          <Label for="create-user-username">Имя пользователя</Label>
          <Input id="create-user-username" name="username" autocomplete="username" />
        </div>

        <div class="grid gap-3">
          <Label for="create-user-email">Email</Label>
          <Input id="create-user-email" name="email" type="email" autocomplete="email" />
        </div>

        <div class="grid gap-3">
          <Label for="create-user-password">Пароль</Label>
          <Input
            id="create-user-password"
            name="password"
            type="password"
            autocomplete="new-password"
          />
        </div>

        <div class="grid gap-3">
          <Label for="create-user-role">Роль</Label>
          <Select.Root type="single" bind:value={roleValue}>
            <Select.Trigger id="create-user-role" class="w-[180px]">{triggerRole}</Select.Trigger>
            <Select.Content>
              {#each roles as role (role.value)}
                <Select.Item value={role.value}>{role.label}</Select.Item>
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
