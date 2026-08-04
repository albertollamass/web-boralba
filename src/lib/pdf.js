// Abre un PDF en una pestaña nueva usando un Blob URL.
// Los navegadores bloquean la navegación directa a URLs data:application/pdf,
// así que convertimos el base64 a un blob y abrimos blob:... que sí renderiza
// el visor de PDF del navegador sin descargar el archivo.
export async function openPdfDataUrl(dataUrl) {
  const res = await fetch(dataUrl)
  if (!res.ok) throw new Error('No se pudo leer el PDF')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  // Liberamos el objeto cuando ya no se necesite (la pestaña ya lo ha cargado).
  setTimeout(() => URL.revokeObjectURL(url), 60 * 1000)
}