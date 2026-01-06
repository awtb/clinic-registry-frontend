import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import {buildApiClient} from "$lib/server/api/client";

export const load: LayoutServerLoad = async ({ fetch, cookies, url }) => {
    const token = cookies.get('access_token')
    if (!token && url.pathname !== '/login') {
        throw redirect(302, '/login')
    }
    else if (token && url.pathname !== '/login') {
        let apiClient = buildApiClient(fetch)
        let currentUser = await apiClient.users.me()

        if (!currentUser.ok) {
            throw redirect(302, '/login')
        }

        return {
            currentUser: currentUser.data,
        }
    }


    return {
        currentUser: {
            'role': "guest",
            "first_name": "Войти",
            "last_name": "Guest",
            "id": "$1"
        }
    }

}