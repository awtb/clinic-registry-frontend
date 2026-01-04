<form method="POST" action="?/login">
    <input name="email" type="email" required>
    <input name="password" type="password" required>
    <button type="submit">Log in</button>
</form>

<script lang="ts">
    export let form
</script>

{#if form?.message}
    <p>{form.message}</p>
{/if}