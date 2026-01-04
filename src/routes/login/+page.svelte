<script lang="ts">
    import { Button } from "$lib/components/ui/button"
    import { Input } from "$lib/components/ui/input"
    import { Label } from "$lib/components/ui/label"

    let email = ""
    let password = ""
</script>

<div class="w-full max-w-sm space-y-6">
    <h1 class="text-3xl font-bold text-center">
        Вход в систему
    </h1>

    <form method="POST" class="space-y-2">
        <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input id="email" name="email" bind:value={email} />
        </div>

        <div class="space-y-3">
            <Label for="password">Пароль</Label>
            <Input id="password" name="password" type="password" bind:value={password} />
        </div>

        <Button type="submit" class="w-full">
            Войти
        </Button>
    </form>
</div>