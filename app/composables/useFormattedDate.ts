export function useFormattedDate() {
  const { locale } = useI18n()

  function formatDate(value: string | Date) {
    const date = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' ? value : ''
    }

    return new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  return { formatDate }
}
