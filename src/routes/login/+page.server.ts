import { superValidate } from "sveltekit-superforms/server"
import { z } from "zod"
import { zod } from "sveltekit-superforms/adapters"
import {buildApiClient} from "$lib/server/api/client";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})



export const actions = {
  default: async ({ request }) => {
    console.log("Executing")
    let requestBody = await request.formData()
    if (!requestBody) {
      console.error("Request body", requestBody)
    }

    console.log("OK, body found");

    let email = requestBody.get("email") ;

    if (!email) {
      return;
    }

    email = email.toString();



    let password = requestBody.get("password");

    if (!password) {
      return;
    }

    password = password.toString();



    console.log("Current login", email);
    console.log("Current password", password);

    const apiClient = buildApiClient(fetch);
    console.log("Building a client")
    const response= await apiClient.auth.token(email, password);
    console.log("Response is OK", response.ok)
    console.log("full response", response)

    if (response.status === 403){
      console.log("Authentication failed")
    }


  }
}