<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar"
  import { page } from "$app/stores"
  import { BriefcaseMedical, History, Home, NotepadText, Settings, Users } from "lucide-svelte"
    import { goto } from "$app/navigation"

  export type SidebarItem = {
    title: string
    href: string
    icon?: typeof import("lucide-svelte").Icon
    badge?: string
    disabled?: boolean
  }

  export type SidebarGroup = {
    title?: string
    items: SidebarItem[]
  }

  export const groups = [
    {
      title: "Основное",
      items: [
        {
          title: "Главная",
          href: "/",
          icon: Home,
        },
        {
          title: "Пациенты",
          href: "/patients",
          icon: Users,
        },
        {
            icon: BriefcaseMedical,
            title: "Пользователи",
            href: "/users"
        },
        {
            icon: NotepadText,
            title: "Записи",
            href: "/records"
        },
        {
            icon: History,
            title: "Логи",
            href: "/logs"
        }
      ],
    },
    {
      title: "Система",
      items: [
        {
          title: "Настройки",
          href: "/settings",
          icon: Settings,
          badge: "NEW",
        },
      ],
    },
  ]
  let footerTitle: string | null = null
  let footerSubtitle: string | null = null

  const pathname = $derived($page.url.pathname)

  const isActive = (href: string) => {
    return href == pathname
  }
</script>

<Sidebar.Provider>
  <Sidebar.Root class="md:top-16 md:h-[calc(100svh-4rem)]">
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
                    on:click={() => goto(item.href)}
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
</Sidebar.Provider>
