// Puerto de aplicación · Identidad.
//
// Lo que la aplicación necesita para el panel de administración, sin saber si
// detrás hay Firebase Auth u otro sistema.

/**
 * @typedef {object} AuthUser
 * @property {string} uid
 */

/**
 * Puerto del servicio de identidad.
 * @typedef {object} AuthService
 * @property {() => boolean} isConfigured
 * @property {(onChange: (user: AuthUser|null) => void) => () => void} observeAuth - devuelve función para desuscribir
 * @property {(email: string, password: string) => Promise<AuthUser>} signIn
 * @property {() => Promise<void>} signOut
 * @property {(user: AuthUser) => Promise<'admin'|null>} getRole
 */
