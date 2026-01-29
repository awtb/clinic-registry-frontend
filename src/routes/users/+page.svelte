<script>
  import * as Table from "$lib/components/ui/table"
  import * as Sheet from "$lib/components/ui/sheet"
  import { buttonVariants } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  let { data } = $props()
</script>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head class="w-[100px]">Пользователь</Table.Head>
      <Table.Head>Роль</Table.Head>
      <Table.Head>Кол-во записей</Table.Head>
      <Table.Head>Статус</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>

    {#if !data.usersResponse.ok}
      <Table.Row>
        <Table.Cell colspan="5" class="text-center py-4">
          Нет данных для отображения
        </Table.Cell>
      </Table.Row>
    {:else}
    {#each data.usersResponse.data.items as user}
      <Table.Row>
        <Table.Cell class="font-medium">{user.first_name} {user.last_name}</Table.Cell>
        <Table.Cell>
          <Badge variant="secondary">{user.role}</Badge>
        </Table.Cell>
        <Table.Cell>15</Table.Cell>
        <Table.Cell>ACTIVE</Table.Cell>
        <Table.Cell class="text-end">
          <Sheet.Root>
            <Sheet.Trigger class={buttonVariants({ variant: "outline" })}>Изменить</Sheet.Trigger>
            <Sheet.Content>
              <Sheet.Header>
                <Sheet.Title>Обновление профиля пользователя</Sheet.Title>
                <Sheet.Description>
                  Внесите необходимые изменения в профиль пользователя.
                </Sheet.Description>
              </Sheet.Header>
            </Sheet.Content>
          </Sheet.Root>
        </Table.Cell>
      </Table.Row>
    {/each}
    {/if}
  </Table.Body>
</Table.Root>
