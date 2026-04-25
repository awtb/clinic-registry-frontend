<script lang="ts">
  import ProcedureCategoriesPage from "$lib/features/procedure-categories/components/procedure-categories-page.svelte"
  import type { PageData } from "./$types"

  const { data } = $props<{ data: PageData }>()
</script>

<ProcedureCategoriesPage {data} />
