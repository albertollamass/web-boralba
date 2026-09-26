// Adaptador del puerto ContactDirectory: a quién avisar (email de contacto
// guardado por los ajustes del sitio en este mismo navegador).
export const localContactDirectory = {
  getContactEmail() {
    try {
      return JSON.parse(localStorage.getItem('boralba-settings') || '{}').email || ''
    } catch {
      return ''
    }
  },
}
