import { z } from "zod"

export const ProcedureCategorySchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ProcedureCategoryCreateSchema = z.object({
  code: z.string().min(1, "Код обязателен"),
  name: z.string().min(1, "Название обязательно"),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

export const ProcedureCategoryUpdateSchema = z.object({
  code: z.string().min(1, "Код обязателен").optional(),
  name: z.string().min(1, "Название обязательно").optional(),
  description: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})
