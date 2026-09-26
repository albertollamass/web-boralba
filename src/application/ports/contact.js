// Puerto de aplicación · Solicitudes de presupuesto ("Diseña tu luminaria").
//
// La página construye el formulario; el envío (servicio externo) lo implementa
// la infraestructura.

/**
 * Puerto del enviador de solicitudes.
 * @typedef {object} QuoteSender
 * @property {boolean} isConfigured
 * @property {(payload: FormData) => Promise<{success: boolean, message?: string}>} submitQuoteRequest
 */
