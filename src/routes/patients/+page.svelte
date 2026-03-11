<script lang="ts">
  import PatientsPage from "$lib/features/patients/components/patients-page.svelte"
  import type { PageData } from "./$types"

  const { data } = $props<{ data: PageData }>()
</script>

<PatientsPage {data} />
