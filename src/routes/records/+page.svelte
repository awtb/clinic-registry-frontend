<script lang="ts">
  import MedicalRecordsPage from "$lib/features/medical-records/components/medical-records-page.svelte"
  import type { PageData } from "./$types"

  const { data } = $props<{ data: PageData }>()
</script>

<MedicalRecordsPage {data} />
