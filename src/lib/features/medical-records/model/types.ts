import type { Page } from "$lib/schemas/base"
import { MedicalRecordSchema } from "$lib/schemas/medical-record"
import type { ApiResult } from "$lib/shared/api/types"
import type { z } from "zod"

export type MedicalRecord = z.infer<typeof MedicalRecordSchema>
export type MedicalRecordsPageData = Page<MedicalRecord>
export type MedicalRecordsPageResponse = ApiResult<MedicalRecordsPageData>

export type MedicalRecordsPageRouteData = {
  medicalRecordsResponse: MedicalRecordsPageResponse
}

export type PatientOption = {
  value: string
  label: string
  birth_date?: string
  passport_number: string
  phone_number?: string
}
