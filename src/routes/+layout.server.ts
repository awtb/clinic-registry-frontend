import {redirect} from '@sveltejs/kit'
import type {LayoutServerLoad} from './$types'

type CurrentUser = {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
}

const guestUser: CurrentUser = {
    role: 'guest',
    first_name: 'Войти',
    last_name: 'Guest',
    id: '$1',
    email: 'guest@clinica.local'
}

export const load: LayoutServerLoad = async ({url, locals}) => {
    const currentUserResponse = await locals.apiClient.users.me()
    let currentUser: CurrentUser

    if (url.pathname == '/login') {
        if (currentUserResponse.ok) {
            throw redirect(302, '/')
        }
    }

    if (currentUserResponse.ok) {
        currentUser = currentUserResponse.data
    } else {
        currentUser = guestUser
    }
    

    return {
        currentUser: currentUser,
    }

}