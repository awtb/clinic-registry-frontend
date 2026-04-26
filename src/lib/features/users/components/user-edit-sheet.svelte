<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { UserUpdateSchema } from "$lib/schemas/user"
  import { superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import type { RoleOption, User } from "../model/types"

  type UpdateData = z.infer<typeof UserUpdateSchema>

  const { user, roles, onUpdate } = $props<{
    user: User
    roles: RoleOption[]
    onUpdate: (userId: string, data: UpdateData) => Promise<{ ok: boolean; error?: string }>
  }>()

  let open = $state(false)

  // svelte-ignore state_referenced_locally
  const initialData: UpdateData = {
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username ?? "",
    email: user.email,
    role: user.role,
    password: "",
  }

  const sf = superForm<UpdateData, string>(initialData, {
    SPA: true,
    validators: zod4Client(UserUpdateSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return

      const data: UpdateData = {
        ...form.data,
        password: form.data.password?.length ? form.data.password : undefined,
      }
      const result = await onUpdate(user.id, data)

      if (!result.ok) {
        form.message = result.error ?? "Не удалось обновить пользователя."
        return
      }

      open = false
    },
  })

  const { form, errors, message, enhance, submitting } = sf

  const triggerRole = $derived(
    roles.find((role: RoleOption) => role.value === $form.role)?.label ?? "Выберите роль",
  )
</script>

<Sheet.Root bind:open>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-106.25">
    <Sheet.Header>
      <Sheet.Title>Обновление профиля пользователя</Sheet.Title>
      <Sheet.Description>Внесите необходимые изменения в профиль пользователя.</Sheet.Description>
    </Sheet.Header>

    <form method="POST" class="flex flex-col w-full h-full p-4" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-user-first-name-${user.id}`}>Имя</Label>
          <Input
            id={`edit-user-first-name-${user.id}`}
            name="first_name"
            bind:value={$form.first_name}
            aria-invalid={$errors.first_name ? "true" : undefined}
          />
          {#if $errors.first_name}
            <p class="text-sm text-destructive">{$errors.first_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-last-name-${user.id}`}>Фамилия</Label>
          <Input
            id={`edit-user-last-name-${user.id}`}
            name="last_name"
            bind:value={$form.last_name}
            aria-invalid={$errors.last_name ? "true" : undefined}
          />
          {#if $errors.last_name}
            <p class="text-sm text-destructive">{$errors.last_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-username-${user.id}`}>Имя пользователя</Label>
          <Input
            id={`edit-user-username-${user.id}`}
            name="username"
            bind:value={$form.username}
            aria-invalid={$errors.username ? "true" : undefined}
          />
          {#if $errors.username}
            <p class="text-sm text-destructive">{$errors.username}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-email-${user.id}`}>Email</Label>
          <Input
            id={`edit-user-email-${user.id}`}
            name="email"
            type="email"
            bind:value={$form.email}
            aria-invalid={$errors.email ? "true" : undefined}
          />
          {#if $errors.email}
            <p class="text-sm text-destructive">{$errors.email}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-password-${user.id}`}>Новый пароль</Label>
          <Input
            id={`edit-user-password-${user.id}`}
            name="password"
            type="password"
            bind:value={$form.password}
            aria-invalid={$errors.password ? "true" : undefined}
          />
          {#if $errors.password}
            <p class="text-sm text-destructive">{$errors.password}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-user-role-${user.id}`}>Роль</Label>
          <Select.Root type="single" bind:value={$form.role}>
            <Select.Trigger id={`edit-user-role-${user.id}`} class="w-full">
              {triggerRole}
            </Select.Trigger>
            <Select.Content>
              {#each roles as role (role.value)}
                <Select.Item value={role.value}>{role.label}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          {#if $errors.role}
            <p class="text-sm text-destructive">{$errors.role}</p>
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
