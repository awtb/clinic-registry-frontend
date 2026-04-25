<script lang="ts">
  import { browser } from "$app/environment"
  import { goto } from "$app/navigation"
  import { resolve } from "$app/paths"
  import { page } from "$app/stores"
  import { buttonVariants } from "$lib/components/ui/button"
  import { CircleX, Home, ArrowLeft, RefreshCcw } from "lucide-svelte"

  const status = $derived($page.status)
  const err = $derived($page.error)

  const isNotFound = $derived(status === 404)
  const title = $derived(isNotFound ? "Страница не найдена" : "Произошла ошибка")
  const description = $derived(
    isNotFound
      ? "Похоже, ссылка устарела или страница была перемещена."
      : err?.message || "Во время обработки запроса произошла непредвиденная ошибка."
  )

  const goHome = () => goto(resolve("/"))

  const goBack = () => {
    if (!browser) return
    if (globalThis.history.length > 1) {
      globalThis.history.back()
      return
    }
    goHome()
  }

  const reloadPage = () => {
    if (!browser) return
    globalThis.location.reload()
  }
</script>

<main class="relative min-h-[calc(100dvh-4rem)] overflow-hidden px-6 py-10">
  <div class="pointer-events-none absolute inset-0 -z-10">
    <div class="absolute -left-20 top-10 h-72 w-72 rounded-full bg-destructive/8 blur-3xl"></div>
    <div class="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-primary/8 blur-3xl"></div>
  </div>

  <section class="mx-auto grid min-h-full w-full max-w-3xl place-items-center">
    <article class="w-full rounded-2xl border bg-card/90 p-7 shadow-sm backdrop-blur md:p-10">
      <div class="mb-7 flex items-center justify-between gap-4 border-b pb-5">
        <div class="flex items-center gap-3">
          <span
            class="grid h-11 w-11 place-items-center rounded-xl bg-destructive/10 text-destructive"
          >
            <CircleX class="h-5 w-5" />
          </span>
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-muted-foreground">Ошибка</p>
            <p class="text-sm font-medium text-muted-foreground">Clinic Registry</p>
          </div>
        </div>
        <p class="rounded-md border bg-background px-3 py-1 font-mono text-sm">{status}</p>
      </div>

      <h1 class="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      <p class="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>

      <div class="mt-6 flex flex-wrap items-center gap-3 text-sm">
        <span class="rounded-full border px-3 py-1">Код: {status}</span>
        <span class="rounded-full border px-3 py-1">Путь: {$page.url.pathname || "/"}</span>
      </div>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button class={buttonVariants({ variant: "default" })} onclick={goHome}>
          <Home class="mr-2 h-4 w-4" />
          На главную
        </button>

        <button class={buttonVariants({ variant: "secondary" })} onclick={goBack}>
          <ArrowLeft class="mr-2 h-4 w-4" />
          Назад
        </button>

        {#if !isNotFound}
          <button class={buttonVariants({ variant: "outline" })} onclick={reloadPage}>
            <RefreshCcw class="mr-2 h-4 w-4" />
            Обновить страницу
          </button>
        {/if}
      </div>
    </article>
  </section>
</main>
