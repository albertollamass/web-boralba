import { useState } from 'react'
import { getLeafCategories } from '../data/categories'

export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [product, setProduct] = useState(initial)
  const leaves = getLeafCategories()

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
            {leaves.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Imagen (URL)</label>
          <input
            value={product.image}
            onChange={set('image')}
            placeholder="/images/producto.jpg o https://..."
          />
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
