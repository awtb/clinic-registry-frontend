import type { LayoutServerLoad } from "./$types"
import { getPaginationParams } from "$lib/shared/pagination"

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const { page, pageSize } = getPaginationParams(url)
  const r = await locals.apiClient.patients.getAll(page, pageSize)
  console.log(r)
  console.log(r.ok)
  if(r.ok){
    console.log(r.data)
  }
  return {
    patientsResponse: r,
  }
}
