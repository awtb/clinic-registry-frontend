import {fail} from '@sveltejs/kit'
import type {Actions} from './$types'
import {buildAuthApi} from "$lib/server/api/endpoints/auth";

export const actions: Actions = {
    login: async ({request, fetch, cookies}) => {
        const formData = await request.formData()

        const email = String(formData.get('email') ?? '')
        const password = String(formData.get('password') ?? '')

        if (!email || !password) {
            return fail(400, {message: 'Email и пароль обязательны'})
        }

        const auth = buildAuthApi(fetch)
        const res = await auth.token(email, password)

        if (!res.ok) {
            return fail(res.status || 401, { message: res.error.message })
        }

        cookies.set('access_token', res.data.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 15
        })
    }
}