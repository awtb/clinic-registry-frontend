<script lang="ts">
    import '../app.css'
    import favicon from '$lib/assets/favicon.svg'
    import {Button} from '$lib/components/ui/button'
    import {Badge} from '$lib/components/ui/badge'
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
    import {ClipboardPlus, Menu, Search, User} from 'lucide-svelte'


    let {data, children} = $props()
</script>

<svelte:head>
    <link rel="icon" href={favicon}/>
</svelte:head>
<div class="min-h-screen flex flex-col">

<header class="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
    <div class="h-16 w-full flex items-center gap-4 px-6">
        <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu class="h-5 w-5"/>
        </Button>

        <div class="flex items-center gap-3 min-w-0">
            <ClipboardPlus />
            <span class="text-lg font-semibold truncate">Реестр пациентов</span>
            <Badge variant="secondary">{data.currentUser.role}</Badge>
        </div>

        <div class="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Поиск">
                <Search class="h-5 w-5"/>

            </Button>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Аккаунт">
                        <User class="h-5 w-5"/>
                    </Button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content align="end" class="w-44">
                    <DropdownMenu.Item>Профиль</DropdownMenu.Item>
                    <DropdownMenu.Item>Настройки</DropdownMenu.Item>
                    <DropdownMenu.Separator/>
                    <DropdownMenu.Item class="text-destructive">Выйти</DropdownMenu.Item>
                </DropdownMenu.Content>
                <span class=" truncate">{data.currentUser.first_name}</span>

            </DropdownMenu.Root>
        </div>
    </div>
</header>
    <main class="flex-1 grid place-items-center p-6">
        {@render children()}
    </main>
</div>



