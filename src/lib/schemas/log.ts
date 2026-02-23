import { z } from "zod"
import { createPageSchema } from "$lib/schemas/base"
import { PatientSchema } from "$lib/schemas/patient"
import { UserSchema } from "$lib/schemas/user"
import { MedicalRecordSchema } from "$lib/schemas/medical-record"

const JsonObjectSchema = z.record(z.string(), z.unknown())

export const LogActionSchema = z.enum(["CREATE", "UPDATE", "DELETE"])
export const LogEntitySchema = z.enum(["PATIENT", "USER", "MEDICAL_RECORD"])

const LogBaseSchema = z.object({
  id: z.string(),
  actor_id: z.string(),
  action: LogActionSchema,
  entity_id: z.string(),
  metadata: JsonObjectSchema.nullable(),
  created_at: z.string(),
})

const PatientLogSchema = LogBaseSchema.extend({
  entity_type: z.literal("PATIENT"),
  entity_before: PatientSchema.nullable(),
  entity_after: PatientSchema.nullable(),
})

const UserLogSchema = LogBaseSchema.extend({
  entity_type: z.literal("USER"),
  entity_before: UserSchema.nullable(),
  entity_after: UserSchema.nullable(),
})

const MedicalRecordLogSchema = LogBaseSchema.extend({
  entity_type: z.literal("MEDICAL_RECORD"),
  entity_before: MedicalRecordSchema.nullable(),
  entity_after: MedicalRecordSchema.nullable(),
})

export const LogSchema = z.discriminatedUnion("entity_type", [
  PatientLogSchema,
  UserLogSchema,
  MedicalRecordLogSchema,
])

export const LogPageSchema = createPageSchema(LogSchema)

export type Log = z.infer<typeof LogSchema>
export type LogAction = z.infer<typeof LogActionSchema>
export type LogEntity = z.infer<typeof LogEntitySchema>
