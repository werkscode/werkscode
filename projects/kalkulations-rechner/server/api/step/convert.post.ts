function extractStepConvertError(error: unknown): { statusCode: number; message: string } {
  const fetchError = error as {
    statusCode?: number
    status?: number
    message?: string
    data?: {
      detail?: string | Array<{ msg?: string; loc?: unknown[] }>
      message?: string
    }
    cause?: { code?: string; message?: string }
  }

  const statusCode = fetchError.statusCode ?? fetchError.status ?? 422
  const data = fetchError.data

  if (typeof data?.detail === 'string' && data.detail.length > 0) {
    return { statusCode, message: data.detail }
  }

  if (Array.isArray(data?.detail) && data.detail.length > 0) {
    const message = data.detail
      .map(entry => entry.msg ?? JSON.stringify(entry))
      .join('; ')
    return { statusCode, message }
  }

  if (typeof data?.message === 'string' && data.message.length > 0) {
    return { statusCode, message: data.message }
  }

  const causeCode = fetchError.cause?.code
  if (causeCode === 'ECONNREFUSED' || causeCode === 'ENOTFOUND') {
    return {
      statusCode: 503,
      message: 'STEP-Konverter nicht erreichbar. Bitte Administrator kontaktieren.',
    }
  }

  if (causeCode === 'ETIMEDOUT' || causeCode === 'UND_ERR_CONNECT_TIMEOUT') {
    return {
      statusCode: 504,
      message: 'STEP-Konverter antwortet nicht (Zeitüberschreitung).',
    }
  }

  const rawMessage = fetchError.message ?? ''
  if (rawMessage.includes('fetch failed') || rawMessage.includes('ECONNREFUSED')) {
    return {
      statusCode: 503,
      message: 'STEP-Konverter nicht erreichbar. Bitte Administrator kontaktieren.',
    }
  }

  if (rawMessage.length > 0 && !rawMessage.startsWith('[')) {
    return { statusCode, message: rawMessage }
  }

  return { statusCode, message: 'Konvertierung fehlgeschlagen.' }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const form = await readMultipartFormData(event)

  if (!form) {
    throw createError({ statusCode: 400, message: 'Keine Datei hochgeladen.' })
  }

  const filePart = form.find(part => part.name === 'file')
  if (!filePart?.data) {
    throw createError({ statusCode: 400, message: 'Keine Datei hochgeladen.' })
  }

  const body = new FormData()
  const filename = filePart.filename ?? 'upload.step'
  body.append('file', new Blob([new Uint8Array(filePart.data)]), filename)

  try {
    const response = await $fetch<{
      modelId: string
      glbUrl: string
      fileName: string
      assemblyTree: unknown
      surfaceAreaM2: number
      totalSurfaceAreaM2: number
      boundingBoxMm: { x: number; y: number; z: number }
      faces: import('#shared/types/step-model').StepFace[]
    }>(`${config.stepConverterUrl}/api/convert`, {
      method: 'POST',
      body,
      timeout: 120_000,
    })

    return {
      ...response,
      glbUrl: `/api/step/download/${response.modelId}`,
    }
  }
  catch (error: unknown) {
    const { statusCode, message } = extractStepConvertError(error)
    throw createError({ statusCode, message })
  }
})
