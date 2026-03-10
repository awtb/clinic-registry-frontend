<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import type { RoleOption, User } from "../model/types"

  const {
    user,
    roles,
    errorMessage = "",
    isSubmitting = false,
    onSubmit,
  } = $props<{
    user: User
    roles: RoleOption[]
    errorMessage?: string
    isSubmitting?: boolean
    onSubmit: (event: SubmitEvent, userId: string, roleValue: string) => void | Promise<void>
  }>()

  let roleValue = $state(user.role ?? "")
  const triggerRole = $derived(
    roles.find((role: RoleOption) => role.value === roleValue)?.label ?? "Выберите роль",
  )
</script>

<Sheet.Root>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-[425px]">
    <Sheet.Header>
      <Sheet.Title>Обновление профиля пользователя</Sheet.Title>
      <Sheet.Description>Внесите необходимые изменения в профиль пользователя.</Sheet.Description>
    </Sheet.Header>

    <form onsubmit={(event) => onSubmit(event, user.id, roleValue)} class="flex flex-col w-full h-full p-4">
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-user-first-name-${user.id}`}>Имя</Label>
          <Input id={`edit-user-first-name-${user.id}`} name="first_name" defaultValue={user.first_name} />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-last-name-${user.id}`}>Фамилия</Label>
          <Input id={`edit-user-last-name-${user.id}`} name="last_name" defaultValue={user.last_name} />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-username-${user.id}`}>Имя пользователя</Label>
          <Input id={`edit-user-username-${user.id}`} name="username" defaultValue={user.username} />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-email-${user.id}`}>Email</Label>
          <Input id={`edit-user-email-${user.id}`} name="email" type="email" defaultValue={user.email} />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-password-${user.id}`}>Новый пароль</Label>
          <Input id={`edit-user-password-${user.id}`} name="password" type="password" />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-role-${user.id}`}>Роль</Label>
          <Select.Root type="single" bind:value={roleValue}>
            <Select.Trigger id={`edit-user-role-${user.id}`} class="w-full">{triggerRole}</Select.Trigger>
            <Select.Content>
              {#each roles as role (role.value)}
                <Select.Item value={role.value}>{role.label}</Select.Item>
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
