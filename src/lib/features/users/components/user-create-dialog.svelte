<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import { UserCreateSchema } from "$lib/schemas/user"
  import { superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import type { RoleOption } from "../model/types"

  type CreateData = z.infer<typeof UserCreateSchema>

  const { roles, onCreate } = $props<{
    roles: RoleOption[]
    onCreate: (data: CreateData) => Promise<{ ok: boolean; error?: string }>
  }>()

  let open = $state(false)

  const initialData: CreateData = {
    first_name: "Исломджон",
    last_name: "Хушназаров",
    username: "",
    email: "",
    role: roles[0]?.value ?? "",
    password: "",
  }

  const sf = superForm<CreateData, string>(initialData, {
    SPA: true,
    validators: zod4Client(UserCreateSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return
      const result = await onCreate(form.data)
      if (!result.ok) {
        form.message = result.error ?? "Не удалось создать пользователя."
        return
      }
      sf.reset()
      open = false
    },
  })

  const { form, errors, message, enhance, submitting } = sf

  const triggerRole = $derived(
    roles.find((role: RoleOption) => role.value === $form.role)?.label ?? "Выберите роль",
  )
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить пользователя
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-106.25">
    <form method="POST" use:enhance>
      <Dialog.Header>
        <Dialog.Title>Добавление нового пользователя</Dialog.Title>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-user-first-name">Имя</Label>
          <Input
            id="create-user-first-name"
            name="first_name"
            bind:value={$form.first_name}
            aria-invalid={$errors.first_name ? "true" : undefined}
          />
          {#if $errors.first_name}
            <p class="text-sm text-destructive">{$errors.first_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-user-last-name">Фамилия</Label>
          <Input
            id="create-user-last-name"
            name="last_name"
            bind:value={$form.last_name}
            aria-invalid={$errors.last_name ? "true" : undefined}
          />
          {#if $errors.last_name}
            <p class="text-sm text-destructive">{$errors.last_name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-user-username">Имя пользователя</Label>
          <Input
            id="create-user-username"
            name="username"
            autocomplete="username"
            bind:value={$form.username}
            aria-invalid={$errors.username ? "true" : undefined}
          />
          {#if $errors.username}
            <p class="text-sm text-destructive">{$errors.username}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-user-email">Email</Label>
          <Input
            id="create-user-email"
            name="email"
            type="email"
            autocomplete="email"
            bind:value={$form.email}
            aria-invalid={$errors.email ? "true" : undefined}
          />
          {#if $errors.email}
            <p class="text-sm text-destructive">{$errors.email}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-user-password">Пароль</Label>
          <Input
            id="create-user-password"
            name="password"
            type="password"
            autocomplete="new-password"
            bind:value={$form.password}
            aria-invalid={$errors.password ? "true" : undefined}
          />
          {#if $errors.password}
            <p class="text-sm text-destructive">{$errors.password}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-user-role">Роль</Label>
          <Select.Root type="single" bind:value={$form.role}>
            <Select.Trigger id="create-user-role" class="w-45">{triggerRole}</Select.Trigger>
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
