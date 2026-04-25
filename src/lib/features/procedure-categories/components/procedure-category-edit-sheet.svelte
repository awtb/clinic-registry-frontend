<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import * as Sheet from "$lib/components/ui/sheet"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import type { ProcedureCategory } from "../model/types"

  const {
    category,
    errorMessage = "",
    isSubmitting = false,
    onSubmit,
  } = $props<{
    category: ProcedureCategory
    errorMessage?: string
    isSubmitting?: boolean
    onSubmit: (event: SubmitEvent, categoryId: string, isActive: boolean) => void | Promise<void>
  }>()

  let isActive = $derived(category.is_active)
</script>

<Sheet.Root>
  <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
  <Sheet.Content class="sm:max-w-120">
    <Sheet.Header>
      <Sheet.Title>Редактирование категории</Sheet.Title>
      <Sheet.Description>Внесите изменения в категорию процедур.</Sheet.Description>
    </Sheet.Header>

    <form
      onsubmit={(event) => onSubmit(event, category.id, isActive)}
      class="flex flex-col w-full h-full p-4"
    >
      <div class="grid gap-4">
        <div class="grid gap-3">
          <Label for={`edit-category-code-${category.id}`}>Код</Label>
          <Input
            id={`edit-category-code-${category.id}`}
            name="code"
            defaultValue={category.code}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-category-name-${category.id}`}>Название</Label>
          <Input
            id={`edit-category-name-${category.id}`}
            name="name"
            defaultValue={category.name}
          />
        </div>

        <div class="grid gap-3">
          <Label for={`edit-category-description-${category.id}`}>Описание</Label>
          <Textarea
            id={`edit-category-description-${category.id}`}
            name="description"
            rows={3}
            defaultValue={category.description ?? ""}
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id={`edit-category-is-active-${category.id}`} bind:checked={isActive} />
          <Label for={`edit-category-is-active-${category.id}`}>Активна</Label>
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
