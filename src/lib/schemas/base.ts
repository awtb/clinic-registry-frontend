import { z } from "zod"

export const createPageSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
    total_pages: z.coerce.number().int().min(0),
    total_items: z.coerce.number().int().min(0),
    items: z.array(itemSchema),
  })

export type Page<T> = {
  page: number
  page_size: number
  total_pages: number
  total_items: number
  items: T[]
}

