<script lang="ts">
  import ProceduresPage from "$lib/features/procedures/components/procedures-page.svelte"
  import type { PageData } from "./$types"

  const { data } = $props<{ data: PageData }>()
</script>

<ProceduresPage {data} />
