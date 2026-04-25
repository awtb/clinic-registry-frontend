<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import CategoryCombobox from "./category-combobox.svelte"
  import type { CategoryOption, Procedure } from "../model/types"

  const {
    procedure,
    errorMessage = "",
    isSubmitting = false,
    onSubmit,
    onSearchCategories,
  } = $props<{
    procedure: Procedure
    errorMessage?: string
    isSubmitting?: boolean
    onSubmit: (event: SubmitEvent, procedureId: string, categoryId: string, isActive: boolean) => void | Promise<void>
    onSearchCategories: (query: string) => Promise<CategoryOption[]>
  }>()

  let isActive = $state(procedure.is_active)
  let categoryId = $state(procedure.category_id)
  let categoryLabel = $state(`${procedure.category.code} — ${procedure.category.name}`)

  $effect(() => {
    isActive = procedure.is_active
    categoryId = procedure.category_id
    categoryLabel = `${procedure.category.code} — ${procedure.category.name}`
  })
</script>

<Sheet.Root>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-[480px]">
    <Sheet.Header>
      <Sheet.Title>Редактирование процедуры</Sheet.Title>
      <Sheet.Description>Внесите изменения в процедуру.</Sheet.Description>
    </Sheet.Header>

    <form
      onsubmit={(event) => onSubmit(event, procedure.id, categoryId, isActive)}
      class="flex flex-col w-full h-full p-4"
    >
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-procedure-code-${procedure.id}`}>Код</Label>
          <Input
            id={`edit-procedure-code-${procedure.id}`}
            name="code"
            defaultValue={procedure.code}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-name-${procedure.id}`}>Название</Label>
          <Input
            id={`edit-procedure-name-${procedure.id}`}
            name="name"
            defaultValue={procedure.name}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-category-${procedure.id}`}>Категория</Label>
          <CategoryCombobox
            triggerId={`edit-procedure-category-${procedure.id}`}
            bind:selectedId={categoryId}
            bind:selectedLabel={categoryLabel}
            onSearch={onSearchCategories}
            triggerClass="w-full justify-between"
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-price-${procedure.id}`}>Цена (TJS)</Label>
          <Input
            id={`edit-procedure-price-${procedure.id}`}
            name="default_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={procedure.default_price}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-procedure-description-${procedure.id}`}>Описание</Label>
          <Textarea
            id={`edit-procedure-description-${procedure.id}`}
            name="description"
            rows={3}
            defaultValue={procedure.description ?? ""}
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id={`edit-procedure-is-active-${procedure.id}`} bind:checked={isActive} />
          <Label for={`edit-procedure-is-active-${procedure.id}`}>Активна</Label>
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
