import { error, redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

const guestUser = {
  first_name: "Guest",
  last_name: "User",
  username: "guest",
  role: "GUEST",
  email: "guest@guest.clinic",
}

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const currentUserResponse = await locals.apiClient.users.me()

  if (url.pathname === "/login" && currentUserResponse.ok) {
    throw redirect(302, "/")
  }

  if (url.pathname === "/login" && !currentUserResponse.ok) {
    return {
      currentUser: guestUser,
    }
  }

  if (!currentUserResponse.ok) {
    if (currentUserResponse.status === 401 || currentUserResponse.status === 403) {
      throw redirect(302, "/login")
    }
    throw error(503, {
      message: "Backend problem",
      code: currentUserResponse.status,
    })
  }

  return { currentUser: currentUserResponse.data }
}
