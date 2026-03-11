import type { LogAction, LogEntity } from "$lib/schemas/log"

export const actionOptions: Array<{ label: string; value: LogAction | "" }> = [
  { label: "Все действия", value: "" },
  { label: "Создание", value: "CREATE" },
  { label: "Обновление", value: "UPDATE" },
  { label: "Удаление", value: "DELETE" },
]

export const entityOptions: Array<{ label: string; value: LogEntity | "" }> = [
  { label: "Все сущности", value: "" },
  { label: "Пациент", value: "PATIENT" },
  { label: "Пользователь", value: "USER" },
  { label: "Медицинская запись", value: "MEDICAL_RECORD" },
]

export const entityLabelMap: Record<LogEntity, string> = {
  PATIENT: "Пациент",
  USER: "Пользователь",
  MEDICAL_RECORD: "Медицинская запись",
}

export const actionLabelMap: Record<LogAction, string> = {
  CREATE: "Создание",
  UPDATE: "Обновление",
  DELETE: "Удаление",
}

export const logFieldMap: Record<LogEntity, Array<{ key: string; label: string }>> = {
  PATIENT: [
    { key: "id", label: "ID" },
    { key: "first_name", label: "Имя" },
    { key: "last_name", label: "Фамилия" },
    { key: "birth_date", label: "Дата рождения" },
    { key: "gender", label: "Пол" },
    { key: "passport_number", label: "Паспорт" },
    { key: "phone_number", label: "Телефон" },
    { key: "notes", label: "Примечание" },
    { key: "last_visit", label: "Последний визит" },
  ],
  USER: [
    { key: "id", label: "ID" },
    { key: "first_name", label: "Имя" },
    { key: "last_name", label: "Фамилия" },
    { key: "username", label: "Логин" },
    { key: "email", label: "Email" },
    { key: "role", label: "Роль" },
  ],
  MEDICAL_RECORD: [
    { key: "id", label: "ID" },
    { key: "patient_id", label: "Пациент ID" },
    { key: "diagnosis", label: "Диагноз" },
    { key: "treatment", label: "Лечение" },
    { key: "procedures", label: "Процедуры" },
    { key: "chief_complaint", label: "Жалоба" },
    { key: "creator_id", label: "Создатель ID" },
  ],
}
