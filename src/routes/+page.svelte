<script lang="ts">
  let { data } = $props()
</script>

{#if data.currentUser.role !== 'guest'}
  <div>Добро пожаловать, вы точно авторизованы в системе.</div>
{:else}
  <p>
    Гость, добро пожаловать!<br />
    Для авторизации, пожалуйста перейдите <a href="/login" class="underline">сюда</a>
  </p>
{/if}