<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar'
  import { page } from '$app/stores'

  export type SidebarItem = {
    title: string
    href: string
    icon?: typeof import('lucide-svelte').Icon
    badge?: string
    disabled?: boolean
  }

  export type SidebarGroup = {
    title?: string
    items: SidebarItem[]
  }

  export let groups: SidebarGroup[]
  export let footerTitle: string | null = null
  export let footerSubtitle: string | null = null

  $: pathname = $page.url.pathname

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(href + '/')
</script>

<Sidebar.Root>
  <Sidebar.Header />

  <Sidebar.Content>
    {#each groups as group}
      <Sidebar.Group>
        {#if group.title}
          <Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
        {/if}

        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {#each group.items as item}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  href={item.disabled ? undefined : item.href}
                  isActive={isActive(item.href)}
                  disabled={item.disabled}
                >
                  {#if item.icon}
                    <svelte:component this={item.icon} class="h-4 w-4" />
                  {/if}
                  <span>{item.title}</span>

                  {#if item.badge}
                    <Sidebar.MenuBadge>{item.badge}</Sidebar.MenuBadge>
                  {/if}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            {/each}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    {/each}
  </Sidebar.Content>

  <Sidebar.Footer>
    {#if footerTitle}
      <div class="px-2 py-2">
        <div class="text-sm font-medium truncate">{footerTitle}</div>
        {#if footerSubtitle}
          <div class="text-xs text-muted-foreground truncate">{footerSubtitle}</div>
        {/if}
      </div>
    {/if}
  </Sidebar.Footer>
</Sidebar.Root>
