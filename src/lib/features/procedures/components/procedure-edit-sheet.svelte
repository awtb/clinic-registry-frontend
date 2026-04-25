<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import { ProcedureUpdateSchema } from "$lib/schemas/procedure"
  import { superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import CategoryCombobox from "./category-combobox.svelte"
  import type { CategoryOption, Procedure } from "../model/types"

  type UpdateData = z.infer<typeof ProcedureUpdateSchema>

  const { procedure, onUpdate, onSearchCategories } = $props<{
    procedure: Procedure
    onUpdate: (procedureId: string, data: UpdateData) => Promise<{ ok: boolean; error?: string }>
    onSearchCategories: (query: string) => Promise<CategoryOption[]>
  }>()

  let open = $state(false)
  let categoryLabel = $state(`${procedure.category.code} — ${procedure.category.name}`)

  const initialData: UpdateData = {
    code: procedure.code,
    name: procedure.name,
    category_id: procedure.category_id,
    description: procedure.description,
    default_price: procedure.default_price,
    is_active: procedure.is_active,
  }

  const sf = superForm<UpdateData, string>(initialData, {
    SPA: true,
    validators: zod4Client(ProcedureUpdateSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return

      const data: UpdateData = {
        ...form.data,
        description: form.data.description?.trim() ? form.data.description : null,
        default_price: form.data.default_price?.trim() ? form.data.default_price : null,
      }
      const result = await onUpdate(procedure.id, data)

      if (!result.ok) {
        form.message = result.error ?? "Не удалось обновить процедуру."
        return
      }

      open = false
    },
  })

  const { form, errors, message, enhance, submitting } = sf
</script>

<Sheet.Root bind:open>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-120">
    <Sheet.Header>
      <Sheet.Title>Редактирование процедуры</Sheet.Title>
      <Sheet.Description>Внесите изменения в процедуру.</Sheet.Description>
    </Sheet.Header>

    <form method="POST" class="flex flex-col w-full h-full p-4" use:enhance>
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-procedure-code-${procedure.id}`}>Код</Label>
          <Input
            id={`edit-procedure-code-${procedure.id}`}
            name="code"
            bind:value={$form.code}
            aria-invalid={$errors.code ? "true" : undefined}
          />
          {#if $errors.code}
            <p class="text-sm text-destructive">{$errors.code}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-name-${procedure.id}`}>Название</Label>
          <Input
            id={`edit-procedure-name-${procedure.id}`}
            name="name"
            bind:value={$form.name}
            aria-invalid={$errors.name ? "true" : undefined}
          />
          {#if $errors.name}
            <p class="text-sm text-destructive">{$errors.name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-category-${procedure.id}`}>Категория</Label>
          <CategoryCombobox
            triggerId={`edit-procedure-category-${procedure.id}`}
            bind:selectedId={$form.category_id}
            bind:selectedLabel={categoryLabel}
            onSearch={onSearchCategories}
            triggerClass="w-full justify-between"
          />
          {#if $errors.category_id}
            <p class="text-sm text-destructive">{$errors.category_id}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-price-${procedure.id}`}>Цена (TJS)</Label>
          <Input
            id={`edit-procedure-price-${procedure.id}`}
            name="default_price"
            type="number"
            min="0"
            step="0.01"
            bind:value={$form.default_price}
            aria-invalid={$errors.default_price ? "true" : undefined}
          />
          {#if $errors.default_price}
            <p class="text-sm text-destructive">{$errors.default_price}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-description-${procedure.id}`}>Описание</Label>
          <Textarea
            id={`edit-procedure-description-${procedure.id}`}
            name="description"
            rows={3}
            bind:value={$form.description}
          />
          {#if $errors.description}
            <p class="text-sm text-destructive">{$errors.description}</p>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id={`edit-procedure-is-active-${procedure.id}`} bind:checked={$form.is_active} />
          <Label for={`edit-procedure-is-active-${procedure.id}`}>Активна</Label>
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
