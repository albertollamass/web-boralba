import { useEffect, useState } from 'react'
import { logError } from '../logging/logger.js'

/**
 * Crea el servicio de telemetría de lecturas (cuota diaria de la base de datos).
 * Orquesta los puertos inyectados; no conoce Firestore, Web3Forms ni localStorage.
 *
 * @param {object} deps
 * @param {import('../ports/telemetry.js').UsageRepository} deps.usageRepository
 * @param {import('../ports/telemetry.js').Mailer} deps.mailer
 * @param {import('../ports/telemetry.js').ContactDirectory} deps.contactDirectory
 */
export function createTelemetry({ usageRepository, mailer, contactDirectory }) {
  if (!usageRepository || !mailer || !contactDirectory) {
    throw new Error('createTelemetry necesita usageRepository, mailer y contactDirectory')
  }

  const dayKey = () => new Date().toISOString().slice(0, 10)

  // Registra una lectura real a la base de datos (nunca llamar en caché).
  // Como máximo 1 lectura + 1 escritura por sesión: despreciable frente a lo medido.
  async function trackReads(kind, count) {
    if (!Number.isFinite(count) || count <= 0) return
    const flag = `usage-tracked-${kind}-${dayKey()}`
    try {
      if (sessionStorage.getItem(flag)) return
      sessionStorage.setItem(flag, '1')
    } catch {
      return // sin sessionStorage no contamos (evita duplicar)
    }
    try {
      const day = dayKey()
      const data = (await usageRepository.getDay(day)) || {}
      const reads = (data.reads || 0) + count
      const payload = { reads, writes: (data.writes || 0) + 1 }
      if (reads >= READ_ALERT_AT && !data.alerted) {
        payload.alerted = true
        await usageRepository.saveDay(day, payload)
        sendAlertEmail(reads).catch(() => {})
      } else {
        await usageRepository.saveDay(day, payload)
      }
    } catch {
      // La telemetría nunca debe romper la app.
    }
  }

  async function sendAlertEmail(reads) {
    const message =
      `La web lleva ${reads} lecturas de la base de datos hoy ` +
      `(${Math.round((reads / DAILY_READ_LIMIT) * 100)}% de la cuota diaria gratuita de ${DAILY_READ_LIMIT}). ` +
      `Si se agota, la web dejará de cargar datos hasta mañana. Revisa el uso en la consola de la base de datos (pestaña Usage).`
    await mailer.sendMail({
      subject: `⚠ Boralba: ${reads.toLocaleString('es')} lecturas hoy (límite ${DAILY_READ_LIMIT.toLocaleString('es')})`,
      fromName: 'Monitor Boralba',
      replyTo: contactDirectory.getContactEmail(),
      message,
    })
  }

  async function getTodayReads() {
    try {
      const data = await usageRepository.getDay(dayKey())
      return data?.reads || 0
    } catch {
      return null
    }
  }

  return { trackReads, getTodayReads }
}

// Política de la cuota gratuita: tumbar estos números cambia el aviso.
export const DAILY_READ_LIMIT = 50000
export const READ_ALERT_AT = 40000 // 80%

// Hook de conveniencia para el panel admin (lectura única al montar).
export function useDailyReads(telemetry) {
  const [dailyReads, setDailyReads] = useState(null)
  useEffect(() => {
    if (!telemetry) return
    telemetry.getTodayReads().then((reads) => {
      if (reads != null) setDailyReads(reads)
    })
  }, [telemetry])
  return dailyReads
}
