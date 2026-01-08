import {fail, redirect} from "@sveltejs/kit"
import {z} from "zod"

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
})

export const actions = {
    default: async ({request, cookies, locals}) => {
        const formData = await request.formData()
        const email = String(formData.get("email") ?? "")
        const password = String(formData.get("password") ?? "")

        const parsed = loginSchema.safeParse({email, password})
        if (!parsed.success) {
            return fail(400, {
                email,
                message: "Пожалуйста, введите корректный email"
            })
        }

        const response = await locals.apiClient.auth.token(email, password)

        if (!response.ok) {
            return fail(401, {
                email,
                message: "Неверный email или пароль"
            })
        }

        cookies.set("access_token", response.data.access_token, {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 60 * 60 * 24
        })

        throw redirect(302, "/")
    }
}