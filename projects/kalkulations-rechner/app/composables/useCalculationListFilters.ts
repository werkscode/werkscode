import type { CalculationListItem } from '#shared/types/powder-coating-calculation'
import { formatCalculationLabel } from '#shared/types/powder-coating-calculation'

const ALL_FILTER = '__all__'

function uniqueSortedValues(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, 'de'))
}

export function useCalculationListFilters(calculations: Ref<CalculationListItem[]>) {
  const searchQuery = ref('')
  const customerFilter = ref(ALL_FILTER)
  const createdByFilter = ref(ALL_FILTER)

  const customerOptions = computed(() => uniqueSortedValues(
    calculations.value.map(item => item.customer),
  ))

  const createdByOptions = computed(() => uniqueSortedValues(
    calculations.value.map(item => item.createdBy),
  ))

  const filteredCalculations = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    return calculations.value.filter((item) => {
      if (customerFilter.value !== ALL_FILTER && item.customer !== customerFilter.value) {
        return false
      }

      if (createdByFilter.value !== ALL_FILTER && item.createdBy !== createdByFilter.value) {
        return false
      }

      if (!query) {
        return true
      }

      const haystack = [
        item.title,
        item.artikelNumber,
        item.description,
        item.customer,
        item.createdBy,
        formatCalculationLabel(item),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  })

  const hasActiveFilters = computed(() =>
    searchQuery.value.trim().length > 0
    || customerFilter.value !== ALL_FILTER
    || createdByFilter.value !== ALL_FILTER,
  )

  function resetFilters() {
    searchQuery.value = ''
    customerFilter.value = ALL_FILTER
    createdByFilter.value = ALL_FILTER
  }

  return {
    searchQuery,
    customerFilter,
    createdByFilter,
    customerOptions,
    createdByOptions,
    filteredCalculations,
    hasActiveFilters,
    resetFilters,
    allFilterValue: ALL_FILTER,
  }
}
