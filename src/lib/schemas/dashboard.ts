import { z } from "zod"

export const DashboardCountSchema = z.object({
  users_count: z.coerce.number().int().min(0),
  patients_count: z.coerce.number().int().min(0),
  medical_records_count: z.coerce.number().int().min(0),
  logs_count: z.coerce.number().int().min(0),
})

export const DashboardBreakdownSchema = z.object({
  users_by_role: z.record(z.string(), z.coerce.number().int().min(0)),
  logs_by_entity: z.record(z.string(), z.coerce.number().int().min(0)),
  logs_by_action: z.record(z.string(), z.coerce.number().int().min(0)),
})

export const DashboardOverviewSchema = z.object({
  totals: DashboardCountSchema,
  today: DashboardCountSchema,
  last_7_days: DashboardCountSchema,
  active_users_count: z.coerce.number().int().min(0),
  breakdown: DashboardBreakdownSchema,
})

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>
