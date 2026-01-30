// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type {buildApiClient} from "$lib/shared/api/client";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      apiClient: ReturnType<typeof buildApiClient>
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
