const CALCULATION_TIME_ZONE = 'Europe/Berlin'

const calculationDateTimeFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: CALCULATION_TIME_ZONE,
})

export function formatCalculationDateTime(value: string | Date): string {
  return calculationDateTimeFormatter.format(
    typeof value === 'string' ? new Date(value) : value,
  )
}
