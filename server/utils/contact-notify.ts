type ContactNotifyPayload = {
  id: string
  name: string
  email: string
  message: string
  createdAt: Date
}

export async function notifyContactMessage(payload: ContactNotifyPayload): Promise<boolean> {
  const config = useRuntimeConfig()
  const apiKey = config.resendApiKey
  const to = config.contactNotifyEmail
  const from = config.contactFromEmail

  if (!apiKey || !to || !from) {
    console.warn('[contact-notify] Resend not configured, skipping email')
    return false
  }

  const timestamp = payload.createdAt.toISOString()
  const text = [
    'New contact form message on WERKSCODE',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Message ID: ${payload.id}`,
    `Received: ${timestamp}`,
    '',
    '---',
    '',
    payload.message,
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `Contact form: ${payload.name}`,
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('[contact-notify] Resend error:', response.status, body)
    return false
  }

  return true
}
