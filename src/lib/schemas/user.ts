import { z } from "zod"

export const UserSchema = z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    role: z.string(),
})

export const UserCreateSchema = z.object({
    first_name: z.string().min(1, "Имя обязательно"),
    last_name: z.string().min(1, "Фамилия обязательна"),
    email: z.string().email("Введите корректный email"),
    role: z.string().min(1, "Роль обязательна"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
})
