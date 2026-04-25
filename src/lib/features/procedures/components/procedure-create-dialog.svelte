<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import CategoryCombobox from "./category-combobox.svelte"
  import type { CategoryOption } from "../model/types"

  const { createFormError = "", onSubmit, onSearchCategories } = $props<{
    createFormError?: string
    onSubmit: (event: SubmitEvent, categoryId: string, isActive: boolean) => void | Promise<boolean>
    onSearchCategories: (query: string) => Promise<CategoryOption[]>
  }>()

  let open = $state(false)
  let isActive = $state(true)
  let categoryId = $state("")
  let categoryLabel = $state("")

  async function handleSubmit(event: SubmitEvent) {
    const result = await onSubmit(event, categoryId, isActive)
    if (result !== true) return

    const form = event.target as HTMLFormElement
    form.reset()
    isActive = true
    categoryId = ""
    categoryLabel = ""
    open = false
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить процедуру
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-120">
    <form method="POST" onsubmit={handleSubmit}>
      <Dialog.Header>
        <Dialog.Title>Новая процедура</Dialog.Title>
        <Dialog.Description>Заполните данные процедуры.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-procedure-code">Код</Label>
          <Input id="create-procedure-code" name="code" />
        </div>

        <div class="grid gap-3">
          <Label for="create-procedure-name">Название</Label>
          <Input id="create-procedure-name" name="name" />
        </div>

        <div class="grid gap-3">
          <Label for="create-procedure-category">Категория</Label>
          <CategoryCombobox
            triggerId="create-procedure-category"
            bind:selectedId={categoryId}
            bind:selectedLabel={categoryLabel}
            onSearch={onSearchCategories}
          />
        </div>

        <div class="grid gap-3">
          <Label for="create-procedure-price">Цена (TJS)</Label>
          <Input
            id="create-procedure-price"
            name="default_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0.00"
          />
        </div>

        <div class="grid gap-3">
          <Label for="create-procedure-description">Описание</Label>
          <Textarea id="create-procedure-description" name="description" rows={3} />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="create-procedure-is-active" bind:checked={isActive} />
          <Label for="create-procedure-is-active">Активна</Label>
        </div>

        {#if createFormError}
          <p class="text-sm text-destructive">{createFormError}</p>
        {/if}

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
