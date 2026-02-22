import type { LayoutServerLoad } from "./$types"
import { getPaginationParams } from "$lib/shared/pagination"

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url)

  const medicalRecordsResponse = await locals.apiClient.medicalRecords.getAll(page, pageSize)

  return {
    medicalRecordsResponse,
  }
}
