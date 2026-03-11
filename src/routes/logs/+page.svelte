<script lang="ts">
  import LogsPage from "$lib/features/logs/components/logs-page.svelte"
  import type { PageData } from "./$types"

  const { data } = $props<{ data: PageData }>()
</script>

<LogsPage {data} />
