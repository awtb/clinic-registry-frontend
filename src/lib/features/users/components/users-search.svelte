<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"

  let {
    searchQuery = $bindable(""),
    isLoading = false,
    onSearchInput,
    onClear,
  } = $props<{
    searchQuery?: string
    isLoading?: boolean
    onSearchInput: () => void
    onClear: () => void | Promise<void>
  }>()
</script>

<div class="flex items-center gap-2 mb-4">
  <Input placeholder="Поиск по имени, логину, email" bind:value={searchQuery} oninput={onSearchInput} />
  {#if isLoading}
    <span class="text-sm text-muted-foreground whitespace-nowrap">Загрузка...</span>
  {/if}
  {#if searchQuery.trim().length > 0}
    <Button type="button" variant="outline" onclick={onClear} disabled={isLoading}>
      Очистить
    </Button>
  {/if}
</div>
