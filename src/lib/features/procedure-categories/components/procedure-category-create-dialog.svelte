<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Checkbox } from "$lib/components/ui/checkbox/index.js"
  import * as Dialog from "$lib/components/ui/dialog"
  import { Input } from "$lib/components/ui/input/index.js"
  import { Label } from "$lib/components/ui/label/index.js"
  import { Textarea } from "$lib/components/ui/textarea/index.js"

  const { createFormError = "", onSubmit } = $props<{
    createFormError?: string
    onSubmit: (event: SubmitEvent, isActive: boolean) => void | Promise<boolean>
  }>()

  let open = $state(false)
  let isActive = $state(true)

  async function handleSubmit(event: SubmitEvent) {
    const result = await onSubmit(event, isActive)
    if (result !== true) return

    const form = event.target as HTMLFormElement
    form.reset()
    isActive = true
    open = false
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
    Добавить категорию
  </Dialog.Trigger>

  <Dialog.Content class="sm:max-w-120">
    <form method="POST" onsubmit={handleSubmit}>
      <Dialog.Header>
        <Dialog.Title>Новая категория процедур</Dialog.Title>
        <Dialog.Description>Заполните данные категории.</Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 mt-4">
        <div class="grid gap-3">
          <Label for="create-category-code">Код</Label>
          <Input id="create-category-code" name="code" />
        </div>

        <div class="grid gap-3">
          <Label for="create-category-name">Название</Label>
          <Input id="create-category-name" name="name" />
        </div>

        <div class="grid gap-3">
          <Label for="create-category-description">Описание</Label>
          <Textarea id="create-category-description" name="description" rows={3} />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="create-category-is-active" bind:checked={isActive} />
          <Label for="create-category-is-active">Активна</Label>
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
