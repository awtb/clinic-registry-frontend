import { z } from "zod"
import { ProcedureCategorySchema } from "$lib/schemas/procedure-category"

const decimalString = z.string().regex(/^(?!^[-+.]*$)[+-]?0*\d*\.?\d*$/, "Неверный формат цены")

export const ProcedureSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  category_id: z.string(),
  category: ProcedureCategorySchema,
  description: z.string().nullable(),
  default_price: decimalString,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const ProcedureCreateSchema = z.object({
  code: z.string().min(1, "Код обязателен"),
  name: z.string().min(1, "Название обязательно"),
  category_id: z.string().min(1, "Категория обязательна"),
  description: z.string().nullable().optional(),
  default_price: decimalString.optional(),
  is_active: z.boolean().optional(),
})

export const ProcedureUpdateSchema = z.object({
  code: z.string().min(1, "Код обязателен").optional(),
  name: z.string().min(1, "Название обязательно").optional(),
  category_id: z.string().min(1, "Категория обязательна").optional(),
  description: z.string().nullable().optional(),
  default_price: decimalString.nullable().optional(),
  is_active: z.boolean().optional(),
})
