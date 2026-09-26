// Adaptador Web3Forms: avisos por email (puerto Mailer) y envío del formulario
// "Diseña tu luminaria" (puerto QuoteSender). Todo el tráfico con el servicio
// externo vive aquí; la aplicación solo ve los puertos.

const ENDPOINT = 'https://api.web3forms.com/submit'
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || ''

export const webformsMailer = {
  isConfigured: Boolean(ACCESS_KEY),

  async sendMail({ subject, fromName, replyTo, message }) {
    if (!ACCESS_KEY) return
    const data = new FormData()
    data.append('access_key', ACCESS_KEY)
    data.append('subject', subject)
    data.append('from_name', fromName)
    if (replyTo) data.append('email', replyTo)
    data.append('message', message)
    await fetch(ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
  },
}

export const webformsQuoteSender = {
  isConfigured: Boolean(ACCESS_KEY),

  async submitQuoteRequest(payload) {
    payload.append('access_key', ACCESS_KEY)
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' },
    })
    const json = await res.json().catch(() => ({
      success: false,
      message: 'El servicio no respondió correctamente.',
    }))
    return json
  },
}
