import { z } from "zod"

export const PatientSchema = z.object({
    id: z.string(), 
    first_name: z.string(),
    last_name: z.string(),
    phone_number: z.string().optional(),
    created_at: z.date(),
    updated_at: z.date(),
    last_visit: z.date().optional(),
    birth_date: z.date().optional(),
    passport_number: z.string(),
    gender: z.enum(["MALE", "FEMALE"]),
})
