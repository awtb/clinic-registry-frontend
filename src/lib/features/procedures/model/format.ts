export const formatPrice = (priceValue: string | number | null | undefined) => {
  if (priceValue === null || priceValue === undefined || priceValue === "") return "—"

  const numericPrice = typeof priceValue === "string" ? Number.parseFloat(priceValue) : priceValue
  if (Number.isNaN(numericPrice)) return String(priceValue)

  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice)

  return `${formatted} TJS`
}
