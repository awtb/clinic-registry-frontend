<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import { ProcedureCategoryUpdateSchema } from "$lib/schemas/procedure-category"
  import { superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import type { ProcedureCategory } from "../model/types"

  type UpdateData = z.infer<typeof ProcedureCategoryUpdateSchema>

  const { category, onUpdate } = $props<{
    category: ProcedureCategory
    onUpdate: (categoryId: string, data: UpdateData) => Promise<{ ok: boolean; error?: string }>
  }>()

  let open = $state(false)

  const initialData: UpdateData = {
    code: category.code,
    name: category.name,
    description: category.description,
    is_active: category.is_active,
  }

  const { form, errors, message, enhance, submitting } = superForm<UpdateData, string>(
    initialData,
    {
      SPA: true,
      validators: zod4Client(ProcedureCategoryUpdateSchema),
      resetForm: false,
      onUpdate: async ({ form }) => {
        if (!form.valid) return

        const description = form.data.description?.trim() ? form.data.description : null
        const result = await onUpdate(category.id, { ...form.data, description })

        if (!result.ok) {
          form.message = result.error ?? "Не удалось обновить категорию."
          return
        }

        open = false
      },
    },
  )
</script>

<Sheet.Root bind:open>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-120">
    <Sheet.Header>
      <Sheet.Title>Редактирование категории</Sheet.Title>
      <Sheet.Description>Внесите изменения в категорию процедур.</Sheet.Description>
    </Sheet.Header>

    <form method="POST" class="flex flex-col w-full h-full p-4" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-category-code-${category.id}`}>Код</Label>
          <Input
            id={`edit-category-code-${category.id}`}
            name="code"
            bind:value={$form.code}
            aria-invalid={$errors.code ? "true" : undefined}
          />
          {#if $errors.code}
            <p class="text-sm text-destructive">{$errors.code}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-category-name-${category.id}`}>Название</Label>
          <Input
            id={`edit-category-name-${category.id}`}
            name="name"
            bind:value={$form.name}
            aria-invalid={$errors.name ? "true" : undefined}
          />
          {#if $errors.name}
            <p class="text-sm text-destructive">{$errors.name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-category-description-${category.id}`}>Описание</Label>
          <Textarea
            id={`edit-category-description-${category.id}`}
            name="description"
            rows={3}
            bind:value={$form.description}
          />
          {#if $errors.description}
            <p class="text-sm text-destructive">{$errors.description}</p>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id={`edit-category-is-active-${category.id}`} bind:checked={$form.is_active} />
          <Label for={`edit-category-is-active-${category.id}`}>Активна</Label>
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
