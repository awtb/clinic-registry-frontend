import { z } from "zod"

export const UserSchema = z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    username: z.string().optional(),
    email: z.string(),
    role: z.string(),
})

export const UserCreateSchema = z.object({
    first_name: z.string().min(1, "Имя обязательно"),
    last_name: z.string().min(1, "Фамилия обязательна"),
    username: z.string().min(1, "Имя пользователя обязательно"),
    email: z.email("Введите корректный email"),
    role: z.string().min(1, "Роль обязательна"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов"),
})
