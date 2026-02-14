<script lang="ts">
  import { page } from "$app/stores"
  import { goto } from "$app/navigation"
  import { buttonVariants } from "$lib/components/ui/button"
  import { CircleX, Home, ArrowLeft } from "lucide-svelte"

  export let error: App.Error
  export let status: number

  const goBack = () => history.length > 1 ? history.back() : goto("/")
</script>

{#if status === 404}
  <main class="min-h-[calc(100dvh-4rem)] grid place-items-center px-6">
    <section class="w-full max-w-xl text-center">
      <div class="mx-auto mb-6 grid place-items-center">
        <CircleX class="h-14 w-14" />
      </div>

      <h1 class="text-5xl font-bold tracking-tight">404</h1>
      <p class="mt-3 text-lg text-muted-foreground">
        Страница не найдена.
      </p>

      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          class={buttonVariants({ variant: "default" })}
          onclick={() => goto("/")}
        >
          <Home class="mr-2 h-4 w-4" />
          На главную
        </button>

        <button
          class={buttonVariants({ variant: "secondary" })}
          onclick={goBack}
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Назад
        </button>
      </div>
    </section>
  </main>
{:else}
  <h1>{status}</h1>
  <pre>{error}</pre>
{/if}