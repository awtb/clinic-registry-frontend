export const actions = {
  new: async ({ request }) => {
    const form = await request.formData()
    const payload = Object.fromEntries(form)

    return { ok: true, payload }
  },
}