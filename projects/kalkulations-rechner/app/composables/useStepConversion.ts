import type { StepConvertResult } from '#shared/types/step-model'

export function useStepConversion() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<StepConvertResult | null>(null)

  async function upload(file: File): Promise<StepConvertResult | null> {
    loading.value = true
    error.value = null

    const formData = new FormData()
    formData.append('file', file)

    try {
      const data = await $fetch<StepConvertResult>('/api/step/convert', {
        method: 'POST',
        body: formData,
      })
      result.value = data
      return data
    }
    catch (err: unknown) {
      const fetchError = err as {
        data?: { message?: string; detail?: string }
        message?: string
      }
      error.value = fetchError.data?.message
        ?? fetchError.data?.detail
        ?? fetchError.message
        ?? 'Upload fehlgeschlagen.'
      result.value = null
      return null
    }
    finally {
      loading.value = false
    }
  }

  function reset() {
    loading.value = false
    error.value = null
    result.value = null
  }

  return {
    loading,
    error,
    result,
    upload,
    reset,
  }
}
