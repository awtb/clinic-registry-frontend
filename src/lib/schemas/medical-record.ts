import { z } from "zod"
import { UserSchema } from "$lib/schemas/user"

export const MedicalRecordPatientSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
})

export const MedicalRecordSchema = z.object({
  id: z.string(),
  patient_id: z.string().optional(),
  patient: MedicalRecordPatientSchema,
  diagnosis: z.string(),
  treatment: z.string(),
  procedures: z.string(),
  chief_complaint: z.string().nullable(),
  creator_id: z.string(),
  creator: UserSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

export const MedicalRecordCreateSchema = z.object({
  patient_id: z.string().min(1, "Пациент обязателен"),
  diagnosis: z.string().min(1, "Диагноз обязателен"),
  treatment: z.string().min(1, "Лечение обязательно"),
  procedures: z.string().min(1, "Процедуры обязательны"),
  chief_complaint: z.string().nullable().optional(),
})

export const MedicalRecordUpdateSchema = z.object({
  diagnosis: z.string().min(1, "Диагноз обязателен").optional(),
  treatment: z.string().min(1, "Лечение обязательно").optional(),
  procedures: z.string().min(1, "Процедуры обязательны").optional(),
  chief_complaint: z.string().nullable().optional(),
})
