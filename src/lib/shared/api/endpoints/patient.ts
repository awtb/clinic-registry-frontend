import { createPageSchema } from "$lib/schemas/base"
import { PatientSchema } from "$lib/schemas/patient"
import type { buildHttpClient } from "../client"

type Client = ReturnType<typeof buildHttpClient>
const PatientPageSchema = createPageSchema(PatientSchema)

const buildGetAllPatientsMethod = (httpClient: Client) => {
    return async (page: number, page_size: number) => {
        return await httpClient.request({
            path: "patients/",
            method: "GET",
            params: {
                page,
                page_size
            },
            schema: PatientPageSchema
        })
    }
}

export const buildPatientsClient = (httpClient: ReturnType<typeof buildHttpClient>) => {
    return {
        getAll: buildGetAllPatientsMethod(httpClient)
    }
}