<script lang="ts">
  import '../app.css'
  import favicon from '$lib/assets/favicon.svg'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { ClipboardPlus, Moon, Search, Sun, User } from 'lucide-svelte'
  import Sidebar from '$lib/layout/Sidebar.svelte'
  import {setContext} from "svelte";
  import {buildApiClient} from "$lib/shared/api/client";
  import {apiClientKey} from "$lib/shared/api/context";
  import { browser } from '$app/environment'
  import { Toaster } from '$lib/components/ui/sonner/index.js'
  import { ModeWatcher, mode, toggleMode } from "mode-watcher"
  import { resolve } from '$app/paths'
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'

  let { data, children } = $props()

  if (browser) {
    // eslint-disable-next-line no-undef
    const baseUrl = new URL("/api/", window.location.origin).toString()
    // eslint-disable-next-line no-undef
    setContext(apiClientKey, buildApiClient(fetch, baseUrl))
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: false,
      },
    },
  })

</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster position="bottom-right"/>


<QueryClientProvider client={queryClient}>
<div class="h-dvh flex flex-col overflow-hidden">
  <header class="h-16 shrink-0 z-50 border-b bg-background/80 backdrop-blur">
    <div class="h-16 w-full flex items-center gap-4 px-6">
      <a href={resolve("/")}>
        <ClipboardPlus />
      </a>

      <div class="flex items-center gap-3 min-w-0">
        <span class="text-lg font-semibold truncate">Реестр пациентов</span>
        <Badge variant="secondary">{data.currentUser.role}</Badge>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Сменить тему" onclick={toggleMode}>
          {#if mode.current === "dark"}
            <Sun class="h-5 w-5" />
          {:else}
            <Moon class="h-5 w-5" />
          {/if}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Поиск">
          <Search class="h-5 w-5" />
        </Button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="ghost" size="icon" aria-label="Аккаунт">
              <User class="h-5 w-5" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end" class="w-44">
            <DropdownMenu.Item>Профиль</DropdownMenu.Item>
            <DropdownMenu.Item>Настройки</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item class="text-destructive">Выйти</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <span class="truncate max-w-40">{data.currentUser.first_name}</span>
      </div>
    </div>
  </header>

  <div class="flex-1 min-h-0 flex">
    {#if data.currentUser.role !== 'guest'}
      <aside class="w-64 shrink-0 border-r bg-background overflow-hidden">
        <Sidebar />
      </aside>

      <main class="flex-1 min-w-0 min-h-0 overflow-auto p-6">
        {@render children()}
      </main>
    {:else}
      <main class="flex-1 min-w-0 min-h-0 overflow-auto grid place-items-center p-6">
        {@render children()}
      </main>
    {/if}
  </div>
</div>
</QueryClientProvider>
