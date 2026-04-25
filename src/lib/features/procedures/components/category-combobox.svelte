<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import * as Command from "$lib/components/ui/command/index.js"
  import * as Popover from "$lib/components/ui/popover/index.js"
  import { cn } from "$lib/utils.js"
  import { CheckIcon, ChevronsUpDownIcon } from "lucide-svelte"
  import type { CategoryOption } from "../model/types"

  let {
    selectedId = $bindable(""),
    selectedLabel = $bindable(""),
    triggerId,
    placeholder = "Выберите категорию",
    onSearch,
    triggerClass = "w-[260px] justify-between",
  } = $props<{
    selectedId?: string
    selectedLabel?: string
    triggerId?: string
    placeholder?: string
    onSearch: (query: string) => Promise<CategoryOption[]>
    triggerClass?: string
  }>()

  let open = $state(false)
  let inputValue = $state("")
  let options = $state<CategoryOption[]>([])
  let searchDebounce: ReturnType<typeof globalThis.setTimeout> | null = null
  let latestRequestId = 0

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
</script>

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
        {selectedLabel || placeholder}
        <ChevronsUpDownIcon class="opacity-50" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content class="w-65 p-0">
    <Command.Root shouldFilter={false}>
      <Command.Input
        placeholder="Поиск категории"
        bind:value={inputValue}
        oninput={scheduleSearch}
      />
      <Command.List>
        <Command.Empty>Категории не найдены</Command.Empty>
        <Command.Group value="categories">
          {#each options as option (option.value)}
            <Command.Item
              value={option.value}
              onSelect={() => {
                selectedId = option.value
                selectedLabel = option.label
                open = false
              }}
            >
              <CheckIcon class={cn(selectedId !== option.value && "text-transparent")} />
              {option.label}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
