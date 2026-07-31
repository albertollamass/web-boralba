import { useState } from 'react'
import {
  getChildren,
  getCategoryPathLabel,
  getDescendantSlugs,
  ROOT,
} from '../data/categories'

function fileToDataUrl(file, maxDim = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
        const format = supportsWebp ? 'image/webp' : 'image/jpeg'
        resolve(canvas.toDataURL(format, quality))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [product, setProduct] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const [fileKey, setFileKey] = useState(0)

  const topCats = getChildren(ROOT.slug)

  const set = (key) => (e) => setProduct((p) => ({ ...p, [key]: e.target.value }))
  const setCheck = (key) => (e) => setProduct((p) => ({ ...p, [key]: e.target.checked }))

  const addSpec = () => {
    setProduct((p) => ({ ...p, specs: [...p.specs, { label: '', value: '' }] }))
  }

  const updateSpec = (i, key) => (e) => {
    setProduct((p) => {
      const specs = p.specs.map((s, idx) => (idx === i ? { ...s, [key]: e.target.value } : s))
      return { ...p, specs }
    })
  }

  const removeSpec = (i) => {
    setProduct((p) => ({ ...p, specs: p.specs.filter((_, idx) => idx !== i) }))
  }

  const onFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      setProduct((p) => ({ ...p, image: dataUrl }))
    } catch {
      alert('No se pudo procesar la imagen.')
    } finally {
      setUploading(false)
      setFileKey((k) => k + 1)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!product.name || !product.category) {
      alert('El nombre y la categoría son obligatorios.')
      return
    }
    const clean = {
      ...product,
      price: product.price === '' || product.price == null ? null : Number(product.price),
      specs: product.specs.filter((s) => s.label || s.value),
      image: product.image || '/images/placeholder.svg',
    }
    onSubmit(clean)
  }

  const isDataUrl = (img) => typeof img === 'string' && img.startsWith('data:')

  return (
    <form className="form" onSubmit={submit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label>Nombre *</label>
          <input value={product.name} onChange={set('name')} required />
        </div>
        <div>
          <label>Referencia</label>
          <input value={product.ref} onChange={set('ref')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label>Categoría *</label>
          <select value={product.category} onChange={set('category')} required>
            <option value="">Selecciona una categoría...</option>
            {topCats.map((top) => (
              <optgroup key={top.slug} label={top.name}>
                {getDescendantSlugs(top.slug).map((s) => (
                  <option key={s} value={s}>
                    {getCategoryPathLabel(s)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Se muestra la ruta completa (ej. Tiras LED › Tiras LED 24V › CRI80).
          </span>
        </div>
        <div>
          <label>Imagen</label>
          <input
            type="file"
            accept="image/*"
            key={fileKey}
            onChange={onFileSelected}
            style={{ padding: 8 }}
          />
          <input
            value={isDataUrl(product.image) ? '' : product.image}
            onChange={set('image')}
            placeholder="o pega una URL: /images/xxx.jpg o https://..."
            style={{ marginTop: 8 }}
          />
          {uploading && (
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Procesando imagen...
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div>
          <label>Precio (€)</label>
          <input type="number" step="0.01" min="0" value={product.price} onChange={set('price')} />
        </div>
        <div>
          <label>Unidad</label>
          <input value={product.unit} onChange={set('unit')} placeholder="rollo 5m, unidad..." />
        </div>
        <div>
          <label>Etiquetas</label>
          <div style={{ display: 'flex', gap: 16, paddingTop: 10 }}>
            <label className="check" style={{ alignItems: 'center' }}>
              <input type="checkbox" checked={product.featured} onChange={setCheck('featured')} />
              Destacado
            </label>
            <label className="check" style={{ alignItems: 'center' }}>
              <input type="checkbox" checked={product.outlet} onChange={setCheck('outlet')} />
              Outlet
            </label>
          </div>
        </div>
      </div>

      <div>
        <label>Descripción</label>
        <textarea value={product.description} onChange={set('description')} />
      </div>

      <div>
        <label>Especificaciones</label>
        {product.specs.map((spec, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={spec.label}
              onChange={updateSpec(i, 'label')}
              placeholder="Etiqueta (ej. Potencia)"
            />
            <input value={spec.value} onChange={updateSpec(i, 'value')} placeholder="Valor (ej. 24V)" />
            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSpec(i)}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={addSpec}>
          + Añadir especificación
        </button>
      </div>

      {product.image && (
        <div>
          <label>Vista previa</label>
          <img
            src={product.image}
            alt="Vista previa"
            style={{ width: 180, aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8 }}
          />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="btn btn-primary">
          {initial.id ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
