<script lang="ts">
  import { Badge } from "$lib/components/ui/badge"
  import { Button } from "$lib/components/ui/button"
  import * as Command from "$lib/components/ui/command/index.js"
  import * as Popover from "$lib/components/ui/popover/index.js"
  import { cn } from "$lib/utils.js"
  import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-svelte"
  import type { Procedure } from "../model/types"

  type SelectedProcedure = {
    id: string
    label: string
  }

  let {
    selectedIds = $bindable<string[]>([]),
    selectedProcedures = $bindable<SelectedProcedure[]>([]),
    triggerId,
    placeholder = "Выберите процедуры",
    onSearch,
    triggerClass = "w-full justify-between",
  } = $props<{
    selectedIds?: string[]
    selectedProcedures?: SelectedProcedure[]
    triggerId?: string
    placeholder?: string
    onSearch: (query: string) => Promise<Procedure[]>
    triggerClass?: string
  }>()

  let open = $state(false)
  let inputValue = $state("")
  let options = $state<Procedure[]>([])
  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  let latestRequestId = 0

  const formatLabel = (procedure: { code: string; name: string }) =>
    `${procedure.code} — ${procedure.name}`

  async function loadOptions(query: string) {
    const requestId = ++latestRequestId
    const result = await onSearch(query)
    if (requestId !== latestRequestId) return
    options = result
  }

  const scheduleSearch = () => {
    if (searchDebounce) globalThis.clearTimeout(searchDebounce)
    searchDebounce = globalThis.setTimeout(() => loadOptions(inputValue), 300)
  }

  const handleOpenChange = (next: boolean) => {
    open = next
    if (next && options.length === 0) loadOptions("")
  }

  const isSelected = (id: string) => selectedIds.includes(id)

  const toggleProcedure = (procedure: Procedure) => {
    if (isSelected(procedure.id)) {
      selectedIds = selectedIds.filter((existingId: string) => existingId !== procedure.id)
      selectedProcedures = selectedProcedures.filter(
        (existing: SelectedProcedure) => existing.id !== procedure.id,
      )
      return
    }
    selectedIds = [...selectedIds, procedure.id]
    selectedProcedures = [
      ...selectedProcedures,
      { id: procedure.id, label: formatLabel(procedure) },
    ]
  }

  const removeSelected = (id: string) => {
    selectedIds = selectedIds.filter((existingId: string) => existingId !== id)
    selectedProcedures = selectedProcedures.filter((existing: SelectedProcedure) => existing.id !== id)
  }

  const triggerLabel = $derived(
    selectedProcedures.length === 0 ? placeholder : `Выбрано: ${selectedProcedures.length}`,
  )
</script>

<div class="grid gap-2">
  <Popover.Root {open} onOpenChange={handleOpenChange}>
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          class={triggerClass}
          role="combobox"
          aria-expanded={open}
          id={triggerId}
        >
          {triggerLabel}
          <ChevronsUpDownIcon class="opacity-50" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-(--bits-popover-anchor-width) min-w-[320px] p-0">
      <Command.Root shouldFilter={false}>
        <Command.Input
          placeholder="Поиск процедуры"
          bind:value={inputValue}
          oninput={scheduleSearch}
        />
        <Command.List>
          <Command.Empty>Процедуры не найдены</Command.Empty>
          <Command.Group value="procedures">
            {#each options as option (option.id)}
              <Command.Item value={option.id} onSelect={() => toggleProcedure(option)}>
                <CheckIcon class={cn(!isSelected(option.id) && "text-transparent")} />
                {formatLabel(option)}
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>

  {#if selectedProcedures.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each selectedProcedures as item (item.id)}
        <Badge variant="secondary" class="gap-1">
          {item.label}
          <button
            type="button"
            class="ml-1 inline-flex items-center"
            aria-label="Удалить процедуру"
            onclick={() => removeSelected(item.id)}
          >
            <XIcon class="h-3 w-3" />
          </button>
        </Badge>
      {/each}
    </div>
  {/if}
</div>
