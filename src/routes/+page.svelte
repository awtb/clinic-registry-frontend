<script lang="ts">
  import { invalidateAll } from "$app/navigation"
  import * as Alert from "$lib/components/ui/alert"
  import { Button } from "$lib/components/ui/button"
  import type { DashboardOverview } from "$lib/schemas/dashboard"
  import {
    Activity,
    FileText,
    NotebookPen,
    RefreshCw,
    Shield,
    Users,
  } from "lucide-svelte"
  import type { PageData } from "./$types"

  type DashboardCountKey = keyof DashboardOverview["totals"]
  type DashboardRangeKey = "totals" | "today" | "last_7_days"

  type BreakdownRow = {
    key: string
    label: string
    value: number
    ratio: number
  }

  const props = $props<{ data: PageData }>()
  let isRefreshing = $state(false)

  const overview = $derived(props.data.dashboardResponse.ok ? props.data.dashboardResponse.data : null)
  const requestStatus = $derived(props.data.dashboardResponse.status)
  const requestError = $derived(props.data.dashboardResponse.ok ? null : props.data.dashboardResponse.error)

  const countMetrics: Array<{
    key: DashboardCountKey
    label: string
    icon: typeof import("lucide-svelte").Icon
  }> = [
    { key: "users_count", label: "Пользователи", icon: Users },
    { key: "patients_count", label: "Пациенты", icon: Shield },
    { key: "medical_records_count", label: "Мед. записи", icon: NotebookPen },
    { key: "logs_count", label: "Логи", icon: FileText },
  ]

  const countSections: Array<{
    key: DashboardRangeKey
    title: string
    description: string
  }> = [
    {
      key: "totals",
      title: "Общие показатели",
      description: "Суммарные значения за все время.",
    },
    {
      key: "today",
      title: "За сегодня",
      description: "Новые данные за текущий день.",
    },
    {
      key: "last_7_days",
      title: "За 7 дней",
      description: "Динамика за последнюю неделю.",
    },
  ]

  const roleLabels: Record<string, string> = {
    admin: "Администраторы",
    user: "Врачи",
  }

  const genderLabels: Record<string, string> = {
    MALE: "Мужчины",
    FEMALE: "Женщины",
  }

  const entityLabels: Record<string, string> = {
    PATIENT: "Пациенты",
    USER: "Пользователи",
    MEDICAL_RECORD: "Мед. записи",
  }

  const actionLabels: Record<string, string> = {
    CREATE: "Создание",
    UPDATE: "Обновление",
    DELETE: "Удаление",
  }

  const formatNumber = (value: number) => new Intl.NumberFormat("ru-RU").format(value)

  const toBreakdownRows = (source: Record<string, number>, labels: Record<string, string>) => {
    const rows = Object.entries(source)
      .map(([key, value]) => ({
        key,
        label: labels[key] ?? key,
        value,
      }))
      .sort((left, right) => right.value - left.value)

    const maxValue = rows[0]?.value ?? 0

    return rows.map((row): BreakdownRow => ({
      ...row,
      ratio: maxValue > 0 ? Math.round((row.value / maxValue) * 100) : 0,
    }))
  }

  const breakdownSections = $derived.by(() => {
    if (!overview) return []

    return [
      {
        title: "Пользователи по ролям",
        rows: toBreakdownRows(overview.breakdown.users_by_role, roleLabels),
      },
      {
        title: "Логи по сущности",
        rows: toBreakdownRows(overview.breakdown.logs_by_entity, entityLabels),
      },
      {
        title: "Логи по действию",
        rows: toBreakdownRows(overview.breakdown.logs_by_action, actionLabels),
      },
    ]
  })

  async function refreshDashboard() {
    if (isRefreshing) return
    isRefreshing = true
    await invalidateAll()
    isRefreshing = false
  }
</script>

<div class="flex h-full min-h-0 flex-col gap-6">
  <section class="flex flex-col gap-4 rounded-xl border bg-card p-5 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Главная панель</h1>
      <p class="text-sm text-muted-foreground">
        Сводка по активности клиники и ключевым сущностям реестра.
      </p>
    </div>

    <Button variant="outline" onclick={refreshDashboard} disabled={isRefreshing}>
      <RefreshCw class={isRefreshing ? "animate-spin" : ""} />
      Обновить
    </Button>
  </section>

  {#if requestError}
    <Alert.Root variant="destructive">
      <Alert.Title>Не удалось загрузить данные дашборда</Alert.Title>
      <Alert.Description>
        <p>Статус запроса: {requestStatus}.</p>
        <p>{requestError.message || "Попробуйте обновить страницу позже."}</p>
      </Alert.Description>
    </Alert.Root>
  {:else if overview}
    <section class="grid gap-4 lg:grid-cols-4">
      <article class="rounded-xl border bg-card p-5 lg:col-span-2">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted-foreground">Активные пользователи</p>
          <Activity class="h-5 w-5 text-primary" />
        </div>
        <p class="mt-3 text-3xl font-bold">{formatNumber(overview.active_users_count)}</p>
        <p class="mt-1 text-xs text-muted-foreground">Количество пользователей с недавней активностью.</p>
      </article>

      <article class="rounded-xl border bg-card p-5">
        <p class="text-sm text-muted-foreground">Всего пациентов</p>
        <p class="mt-3 text-3xl font-bold">{formatNumber(overview.totals.patients_count)}</p>
      </article>

      <article class="rounded-xl border bg-card p-5">
        <p class="text-sm text-muted-foreground">Всего записей</p>
        <p class="mt-3 text-3xl font-bold">{formatNumber(overview.totals.medical_records_count)}</p>
      </article>
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      {#each countSections as section (section.key)}
        <article class="rounded-xl border bg-card p-5">
          <h2 class="text-base font-semibold">{section.title}</h2>
          <p class="text-xs text-muted-foreground">{section.description}</p>

          <dl class="mt-4 space-y-2">
            {#each countMetrics as metric (metric.key)}
              <div class="flex items-center justify-between rounded-md border bg-background/60 px-3 py-2">
                <dt class="flex items-center gap-2 text-sm text-muted-foreground">
                  <metric.icon class="h-4 w-4" />
                  {metric.label}
                </dt>
                <dd class="text-sm font-semibold">{formatNumber(overview[section.key][metric.key])}</dd>
              </div>
            {/each}
          </dl>
        </article>
      {/each}
    </section>

    <section class="grid gap-4 xl:grid-cols-3">
      {#each breakdownSections as section (section.title)}
        <article class="rounded-xl border bg-card p-5">
          <h2 class="text-base font-semibold">{section.title}</h2>

          {#if section.rows.length === 0}
            <p class="mt-4 text-sm text-muted-foreground">Нет данных для отображения.</p>
          {:else}
            <div class="mt-4 space-y-3">
              {#each section.rows as row (row.key)}
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-sm">
                    <p>{row.label}</p>
                    <p class="font-semibold">{formatNumber(row.value)}</p>
                  </div>
                  <div class="h-2 w-full rounded-full bg-muted">
                    <div
                      class="h-full rounded-full bg-primary"
                      style={`width: ${Math.max(row.ratio, row.value > 0 ? 8 : 0)}%`}
                    ></div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </article>
      {/each}
    </section>
  {/if}
</div>
