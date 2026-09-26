// Adaptador de documentos del panel /admin (puerto DocumentStorage).
//
// Por qué no van a Firestore ni a Firebase Storage:
// - Firestore limita cada documento a 1 MiB (un PDF no cabe).
// - Firebase Storage exige plan Blaze (con tarjeta) desde 2026.
// Solución: Cloudinary (plan gratuito, sin tarjeta) con un "unsigned preset".
// El producto (texto, imágenes, URL del PDF) sigue guardado 100% en Firestore.
//
// Configuración (una sola vez, ver .env.example):
//   1. Crea cuenta en https://cloudinary.com/ (gratis).
//   2. Settings > Upload > Upload presets > Add upload preset con Signing Mode = Unsigned
//      (p. ej. nombre `boralba-docs`).
//   3. VITE_CLOUDINARY_CLOUD_NAME=<tu cloud> y VITE_CLOUDINARY_UPLOAD_PRESET=boralba-docs
const MAX_INLINE_BYTES = 500_000 // solo sin Cloudinary: data-URL que quepa en Firestore

function fileToDataUrlRaw(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function uploadToCloudinary(file, cloud, preset) {
  // Los PDF van por el endpoint `raw` (descarga directa). Por `image/auto`,
  // Cloudinary deniega la entrega ("deny or ACL failure").
  const endpoint =
    file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
      ? 'raw'
      : (file.type || '').startsWith('image/')
        ? 'image'
        : 'auto'
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/${endpoint}/upload`, {
    method: 'POST',
    body: form,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.secure_url) {
    throw new Error(
      `La subida a Cloudinary ha fallado (${json?.error?.message || `HTTP ${res.status}`}). Revisa el Cloud name y el preset unsigned.`,
    )
  }
  return json.secure_url
}

export const cloudinaryDocumentStorage = {
  async uploadDocument(file) {
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (cloud && preset) return uploadToCloudinary(file, cloud, preset)

    // Sin Cloudinary: solo se admite inline si cabe en el documento de Firestore.
    if (file.size > MAX_INLINE_BYTES) {
      throw new Error(
        'PDF demasiado grande para guardarlo en la base de datos. Configura Cloudinary gratis (ver .env.example) o usa un PDF menor de 500 KB.',
      )
    }
    return fileToDataUrlRaw(file)
  },
}
