<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"
  import { ProcedureCreateSchema } from "$lib/schemas/procedure"
  import { superForm } from "sveltekit-superforms"
  import { zod4Client } from "sveltekit-superforms/adapters"
  import type { z } from "zod"
  import CategoryCombobox from "./category-combobox.svelte"
  import type { CategoryOption } from "../model/types"

  type CreateData = z.infer<typeof ProcedureCreateSchema>

  const { onCreate, onSearchCategories } = $props<{
    onCreate: (data: CreateData) => Promise<{ ok: boolean; error?: string }>
    onSearchCategories: (query: string) => Promise<CategoryOption[]>
  }>()

  let open = $state(false)
  let categoryLabel = $state("")

  const initialData: CreateData = {
    code: "",
    name: "",
    category_id: "",
    description: null,
    default_price: "0.00",
    is_active: true,
  }

  const sf = superForm<CreateData, string>(initialData, {
    SPA: true,
    validators: zod4Client(ProcedureCreateSchema),
    resetForm: false,
    onUpdate: async ({ form }) => {
      if (!form.valid) return

      const data: CreateData = {
        ...form.data,
        description: form.data.description?.trim() ? form.data.description : null,
        default_price: form.data.default_price?.trim() ? form.data.default_price : undefined,
      }
      const result = await onCreate(data)

      if (!result.ok) {
        form.message = result.error ?? "Не удалось создать процедуру."
        return
      }

      sf.reset()
      categoryLabel = ""
      open = false
    },
  })

  const { form, errors, message, enhance, submitting } = sf
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить процедуру
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-120">
    <form method="POST" use:enhance>
      <Dialog.Header>
        <Dialog.Title>Новая процедура</Dialog.Title>
        <Dialog.Description>Заполните данные процедуры.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-procedure-code">Код</Label>
          <Input
            id="create-procedure-code"
            name="code"
            bind:value={$form.code}
            aria-invalid={$errors.code ? "true" : undefined}
          />
          {#if $errors.code}
            <p class="text-sm text-destructive">{$errors.code}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-procedure-name">Название</Label>
          <Input
            id="create-procedure-name"
            name="name"
            bind:value={$form.name}
            aria-invalid={$errors.name ? "true" : undefined}
          />
          {#if $errors.name}
            <p class="text-sm text-destructive">{$errors.name}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-procedure-category">Категория</Label>
          <CategoryCombobox
            triggerId="create-procedure-category"
            bind:selectedId={$form.category_id}
            bind:selectedLabel={categoryLabel}
            onSearch={onSearchCategories}
          />
          {#if $errors.category_id}
            <p class="text-sm text-destructive">{$errors.category_id}</p>
          {/if}
        </div>

        <div class="grid gap-3">
          <Label for="create-procedure-price">Цена (TJS)</Label>
          <Input
            id="create-procedure-price"
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
          <Label for="create-procedure-description">Описание</Label>
          <Textarea
            id="create-procedure-description"
            name="description"
            rows={3}
            bind:value={$form.description}
          />
          {#if $errors.description}
            <p class="text-sm text-destructive">{$errors.description}</p>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="create-procedure-is-active" bind:checked={$form.is_active} />
          <Label for="create-procedure-is-active">Активна</Label>
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
