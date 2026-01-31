import { z } from "zod"

export const PatientSchema = z.object({
    id: z.string(), 
    first_name: z.string(),
    last_name: z.string(),
    phone_number: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    last_visit: z.string().nullable().optional(),
    birth_date: z.string().optional(),
    passport_number: z.string(),
    gender: z.enum(["MALE", "FEMALE"]),
})


export const PatientCreateSchema = z.object({
    first_name: z.string().min(1, "Имя обязательно"),
    last_name: z.string().min(1, "Фамилия обязательна"),
    phone_number: z.string().optional(),
    birth_date: z.date().optional(),
    passport_number: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE"]),
    notes: z.string().optional(),
})