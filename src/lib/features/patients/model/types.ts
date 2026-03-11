import type { Page } from "$lib/schemas/base"
import { PatientSchema } from "$lib/schemas/patient"
import type { ApiResult } from "$lib/shared/api/types"
import type { z } from "zod"

export type Patient = z.infer<typeof PatientSchema>
export type PatientsPageData = Page<Patient>
export type PatientsPageResponse = ApiResult<PatientsPageData>

export type PatientsPageRouteData = {
  patientsResponse: PatientsPageResponse
  searchQuery?: string
}

export type GenderOption = {
  label: string
  value: "MALE" | "FEMALE"
}
