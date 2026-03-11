<script lang="ts">
  import { Alert, AlertDescription } from "$lib/components/ui/alert"
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { Label } from "$lib/components/ui/label"

  type LoginFormData =
    | {
        email?: string
        message?: string
      }
    | null
    | undefined

  const { form } = $props<{ form: LoginFormData }>()
</script>

<div class="w-full flex items-center justify-center min-h-[calc(100dvh-4rem)]">
  <div class="w-full max-w-xl space-y-6">
    <h1 class="text-3xl font-bold text-center">Вход в систему</h1>
    <form method="POST" class="space-y-3">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" name="email" autocomplete="username" value={form?.email ?? ""} />
      </div>

      <div class="space-y-2">
        <Label for="password">Пароль</Label>
        <Input id="password" name="password" type="password" autocomplete="current-password" />
      </div>

      <Button type="submit" class="w-full">Войти</Button>

      {#if form?.message}
        <Alert variant="destructive">
          <AlertDescription>{form.message}</AlertDescription>
        </Alert>
      {/if}
    </form>
  </div>
</div>
