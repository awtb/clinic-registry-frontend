<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button/index.js"

  let { data } = $props()
</script>

{#if data.currentUser.role !== "guest"}
  <div>Добро пожаловать, Вы авторизованы в системе.</div>
{:else}
  <div class="flex flex-col items-center justify-center text-center w-2/3 mx-auto mb-20">
    <h3 class='text-2xl font-bold'>Вход в систему</h3>
  </div>
  <div class="flex-col flex items-center justify-center text-center w-2/3 mb-60">
    Гость, добро пожаловать! <br />
    Для доступа к реестру пациентов, пожалуйста, авторизуйтесь или зарегистрируйтесь. Если у вас нет учетной
    записи, обратитесь к администратору для получения доступа.
    <a href="/login" class={buttonVariants({ variant: "outline", class: "mt-6" })}>Авторизоваться</a
    >
  </div>
{/if}
