<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import { ProcedureCategoryCreateSchema } from "$lib/schemas/procedure-category"
  import { superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"

  type CreateData = z.infer<typeof ProcedureCategoryCreateSchema>

  const { onCreate } = $props<{
    onCreate: (data: CreateData) => Promise<{ ok: boolean; error?: string }>
  }>()

  let open = $state(false)

  const initialData: CreateData = {
    code: "",
    name: "",
    description: null,
    is_active: true,
  }

  const { form, errors, message, enhance, submitting, reset } = superForm<CreateData, string>(
    initialData,
    {
      SPA: true,
      validators: zod4Client(ProcedureCategoryCreateSchema),
      resetForm: false,
      onUpdate: async ({ form }) => {
        if (!form.valid) return

        const description = form.data.description?.trim() ? form.data.description : null
        const result = await onCreate({ ...form.data, description })

        if (!result.ok) {
          form.message = result.error ?? "Не удалось создать категорию."
          return
        }

        reset()
        open = false
      },
    },
  )
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить категорию
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-120">
    <form method="POST" use:enhance>
      <Dialog.Header>
        <Dialog.Title>Новая категория процедур</Dialog.Title>
        <Dialog.Description>Заполните данные категории.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-category-code">Код</Label>
          <Input
            id="create-category-code"
            name="code"
            bind:value={$form.code}
            aria-invalid={$errors.code ? "true" : undefined}
          />
          {#if $errors.code}
            <p class="text-sm text-destructive">{$errors.code}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-category-name">Название</Label>
          <Input
            id="create-category-name"
            name="name"
            bind:value={$form.name}
            aria-invalid={$errors.name ? "true" : undefined}
          />
          {#if $errors.name}
            <p class="text-sm text-destructive">{$errors.name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-category-description">Описание</Label>
          <Textarea
            id="create-category-description"
            name="description"
            rows={3}
            bind:value={$form.description}
          />
          {#if $errors.description}
            <p class="text-sm text-destructive">{$errors.description}</p>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="create-category-is-active" bind:checked={$form.is_active} />
          <Label for="create-category-is-active">Активна</Label>
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
