<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input/index.js"
  import * as Select from "$lib/components/ui/select/index.js"
  import type { LogAction, LogEntity } from "$lib/schemas/log"
  import type { ActorOption } from "../model/types"

  let {
    actorId = $bindable(""),
    entityType = $bindable<LogEntity | "">(""),
    actionType = $bindable<LogAction | "">(""),
    entityId = $bindable(""),
    createdFrom = $bindable(""),
    createdTo = $bindable(""),
    actorOptions = [],
    triggerEntity = "Все сущности",
    triggerAction = "Все действия",
    hasActiveFilters = false,
    isLoading = false,
    actionOptions,
    entityOptions,
    onSubmit,
    onClear,
    onSearchActor,
  } = $props<{
    actorId?: string
    entityType?: LogEntity | ""
    actionType?: LogAction | ""
    entityId?: string
    createdFrom?: string
    createdTo?: string
    actorOptions?: ActorOption[]
    triggerEntity?: string
    triggerAction?: string
    hasActiveFilters?: boolean
    isLoading?: boolean
    actionOptions: Array<{ label: string; value: LogAction | "" }>
    entityOptions: Array<{ label: string; value: LogEntity | "" }>
    onSubmit: (event: SubmitEvent) => void | Promise<void>
    onClear: () => void | Promise<void>
    onSearchActor: (query: string) => void | Promise<void>
  }>()
</script>

<form class="grid gap-2 md:grid-cols-2 xl:grid-cols-4" onsubmit={onSubmit}>
  <Input
    placeholder="Пользователь"
    bind:value={actorId}
    oninput={() => onSearchActor(actorId)}
    list="logs-actors"
  />
  <datalist id="logs-actors">
    {#each actorOptions as option (option.id)}
      <option value={option.id}>{option.name}</option>
    {/each}
  </datalist>
  <Input placeholder="Entity ID" bind:value={entityId} />

  <Select.Root type="single" bind:value={entityType}>
    <Select.Trigger class="w-full">{triggerEntity}</Select.Trigger>
    <Select.Content>
      {#each entityOptions as option (option.value)}
        <Select.Item value={option.value}>{option.label}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>

  <Select.Root type="single" bind:value={actionType}>
    <Select.Trigger class="w-full">{triggerAction}</Select.Trigger>
    <Select.Content>
      {#each actionOptions as option (option.value)}
        <Select.Item value={option.value}>{option.label}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>

  <Input type="datetime-local" bind:value={createdFrom} />
  <Input type="datetime-local" bind:value={createdTo} />

  <div class="flex items-center gap-2 md:col-span-2">
    <Button type="submit" disabled={isLoading}>Применить</Button>
    <Button type="button" variant="outline" onclick={onClear} disabled={!hasActiveFilters || isLoading}>
      Сбросить
    </Button>
    {#if isLoading}
      <span class="text-sm text-muted-foreground whitespace-nowrap">Загрузка...</span>
    {/if}
  </div>
</form>
