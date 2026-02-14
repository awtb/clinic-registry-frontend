import { z } from "zod"

export const MedicalRecordSchema = z.object({
  id: z.string(),
  patient_id: z.string(),
  diagnosis: z.string(),
  treatment: z.string(),
  procedures: z.string(),
  chief_complaint: z.string().nullable(),
  creator_id: z.string(),
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
