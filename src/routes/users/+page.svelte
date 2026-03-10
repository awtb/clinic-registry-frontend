<script lang="ts">
  import UsersPage from "$lib/features/users/components/users-page.svelte"
  import type { PageData } from "./$types"

  const { data } = $props<{ data: PageData }>()
</script>

<UsersPage {data} />
