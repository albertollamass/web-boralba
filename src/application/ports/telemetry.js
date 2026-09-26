// Puertos de aplicación · Telemetría (cuota de lecturas).
//
// Contador diario + aviso por email. La política (límites) vive en la aplicación;
// el almacenamiento, el envío y el directorio de contacto los aporta la
// infraestructura.

/**
 * Puerto del repositorio del contador diario (`usage/YYYY-MM-DD`).
 * @typedef {object} UsageRepository
 * @property {(day: string) => Promise<{reads?: number, writes?: number, alerted?: boolean}|null>} getDay
 * @property {(day: string, data: {reads: number, writes: number, alerted?: boolean}) => Promise<void>} saveDay
 */

/**
 * Puerto del enviador de correo (alertas).
 * @typedef {object} Mailer
 * @property {(mail: {subject: string, fromName: string, replyTo?: string, message: string}) => Promise<void>} sendMail
 */

/**
 * Puerto del directorio de contacto (a quién avisar).
 * @typedef {object} ContactDirectory
 * @property {() => string} getContactEmail
 */
