<script lang="ts">
  import LoginPage from "$lib/features/auth/components/login-page.svelte"
  import type { ActionData } from "./$types"

  const { form } = $props<{ form: ActionData }>()
</script>

<LoginPage {form} />
