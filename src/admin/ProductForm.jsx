import { useState } from 'react'
import { useCategories } from '../context/CategoriesContext'
import { openPdfDataUrl } from '../lib/pdf'

function fileToDataUrl(file, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/webp', quality))
      }
      img.onerror = reject
      img.src = reader.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const fileToPdfDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const itemText = (value) => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : value && typeof value === 'object' ? String(value.text ?? value.title ?? value.name ?? value.label ?? value.body ?? '').trim() : ''
const list = (value) => (Array.isArray(value) ? value : (value || '').split(/\n/)).map(itemText).filter(Boolean)
const csv = (value) => (Array.isArray(value) ? value : (value || '').split(',')).map((x) => String(x || '').trim()).filter(Boolean)
const text = (value) => (Array.isArray(value) ? value.join('\n') : value || '')
const commaText = (value) => (Array.isArray(value) ? value.join(', ') : value || '')
const dataUrl = (value) => typeof value === 'string' && value.startsWith('data:')

function normalizeApplications(value) {
  return (Array.isArray(value) ? value : list(value)).map((item) => typeof item === 'string' ? { title: item, description: '' } : { title: item?.text || item?.title || item?.name || item?.application || '', description: item?.description || item?.detail || '' })
}

function normalizeAdvantages(value) {
  return (Array.isArray(value) ? value : list(value)).map((item) => typeof item === 'string' ? { title: item, description: '', icon: '' } : { title: item?.text || item?.title || item?.name || '', description: item?.description || item?.detail || '', icon: item?.icon || '' })
}

export default function ProductForm({ initial, onSubmit, onCancel }) {
  const { getChildren, getCategoryPathLabel, getDescendantSlugs, ROOT } = useCategories()
  const [product, setProduct] = useState(() => ({
    ...initial,
    specs: (initial.specs || []).map((s) => ({ label: s.label || '', value: s.value || '', unit: s.unit || '', featured: Boolean(s.featured) })),
    applications: normalizeApplications(initial.applications),
    advantages: normalizeAdvantages(initial.advantages),
    gallery: Array.isArray(initial.gallery) ? initial.gallery : csv(initial.gallery),
  }))
  const [uploading, setUploading] = useState(false)
  const [fileKeys, setFileKeys] = useState({})
  const topCats = getChildren(ROOT.slug)
  const set = (key) => (e) => setProduct((p) => ({ ...p, [key]: e.target.value }))
  const setCheck = (key) => (e) => setProduct((p) => ({ ...p, [key]: e.target.checked }))

  const uploadImage = async (e, key, index = null) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const value = await fileToDataUrl(file)
      setProduct((p) => {
        if (index == null) return { ...p, [key]: value }
        const values = [...(p[key] || [])]
        values[index] = value
        return { ...p, [key]: values }
      })
    } catch { alert('No se pudo procesar la imagen.') }
    finally {
      setUploading(false)
      setFileKeys((keys) => ({ ...keys, [`${key}-${index ?? 'main'}`]: (keys[`${key}-${index ?? 'main'}`] || 0) + 1 }))
    }
  }

  const addGallery = () => setProduct((p) => ({ ...p, gallery: [...(p.gallery || []), ''] }))
  const updateGallery = (i, value) => setProduct((p) => ({ ...p, gallery: p.gallery.map((g, index) => index === i ? value : g) }))
  const removeGallery = (i) => setProduct((p) => ({ ...p, gallery: p.gallery.filter((_, index) => index !== i) }))
  const moveGallery = (i, direction) => setProduct((p) => {
    const gallery = [...(p.gallery || [])]
    const target = i + direction
    if (target < 0 || target >= gallery.length) return p
    ;[gallery[i], gallery[target]] = [gallery[target], gallery[i]]
    return { ...p, gallery }
  })

  const updateList = (key, index, field, value) => setProduct((p) => ({ ...p, [key]: p[key].map((item, i) => i === index ? { ...item, [field]: value } : item) }))
  const addList = (key, item) => setProduct((p) => ({ ...p, [key]: [...(p[key] || []), item] }))
  const removeList = (key, i) => setProduct((p) => ({ ...p, [key]: p[key].filter((_, index) => index !== i) }))
  const moveList = (key, i, direction) => setProduct((p) => {
    const next = [...p[key]]
    const target = i + direction
    if (target < 0 || target >= next.length) return p
    ;[next[i], next[target]] = [next[target], next[i]]
    return { ...p, [key]: next }
  })
  const reorderList = (key, from, to) => setProduct((p) => {
    const next = [...p[key]]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    return { ...p, [key]: next }
  })

  const updateSpec = (i, field, value) => setProduct((p) => ({ ...p, specs: p.specs.map((s, index) => index === i ? { ...s, [field]: value } : s) }))
  const moveSpec = (i, direction) => moveList('specs', i, direction)

  const submit = (e) => {
    e.preventDefault()
    if (!product.name || !product.category) return alert('El nombre y la categoría son obligatorios.')
    onSubmit({
      ...product,
      price: product.price === '' || product.price == null ? null : Number(product.price),
      image: product.image || 'images/placeholder.svg',
      longDescription: list(product.longDescription),
      features: list(product.features),
      applications: product.applications.filter((a) => a.title || a.description),
      advantages: product.advantages.filter((a) => a.title || a.description),
      tags: csv(product.tags),
      gallery: product.gallery.filter(Boolean),
      specs: product.specs.filter((s) => s.label || s.value).map((s) => ({ label: s.label, value: s.value, unit: s.unit, featured: Boolean(s.featured) })),
    })
  }

  const ImageInput = ({ value, onChange, name, index }) => (
    <div className="admin-media-field">
      <input type="file" accept="image/*" key={fileKeys[`${name}-${index ?? 'main'}`] || 0} onChange={(e) => uploadImage(e, name, index)} />
      <input value={dataUrl(value) ? '' : value || ''} onChange={(e) => onChange(e.target.value)} placeholder="o pega una URL" />
      {value && <img src={value} alt="Vista previa" />}
    </div>
  )

  return (
    <form className="form product-admin-form" onSubmit={submit}>
      <section className="admin-form-section">
        <h3>Información principal</h3>
        <div className="admin-form-grid two">
          <div><label>Nombre *</label><input value={product.name || ''} onChange={set('name')} required /></div>
          <div><label>Referencia</label><input value={product.ref || ''} onChange={set('ref')} /></div>
        </div>
        <label>Categoría *</label>
        <select value={product.category || ''} onChange={set('category')} required>
          <option value="">Selecciona una categoría...</option>
          {topCats.map((top) => <optgroup key={top.slug} label={top.name}>{getDescendantSlugs(top.slug).map((s) => <option key={s} value={s}>{getCategoryPathLabel(s)}</option>)}</optgroup>)}
        </select>
        <div className="admin-form-grid two">
          <div><label>Descripción corta</label><textarea value={product.description || ''} onChange={set('description')} /></div>
          <div><label>Descripción larga <small>(un párrafo por línea)</small></label><textarea value={text(product.longDescription)} onChange={set('longDescription')} /></div>
        </div>
        <label>Imagen principal</label>
        <ImageInput value={product.image} name="image" onChange={(value) => setProduct((p) => ({ ...p, image: value }))} />
        <label>Galería de imágenes</label>
         {(product.gallery || []).map((image, i) => <div className="admin-repeater-row" key={i}><ImageInput value={image} name="gallery" index={i} onChange={(value) => updateGallery(i, value)} /><div className="repeater-actions"><button type="button" onClick={() => moveGallery(i, -1)} aria-label="Subir imagen">↑</button><button type="button" onClick={() => moveGallery(i, 1)} aria-label="Bajar imagen">↓</button><button type="button" className="btn btn-danger btn-sm" onClick={() => removeGallery(i)}>Eliminar</button></div></div>)}
        <button type="button" className="btn btn-ghost btn-sm" onClick={addGallery}>+ Añadir imagen</button>
      </section>

      <section className="admin-form-section">
        <h3>Aplicaciones recomendadas</h3>
        <p className="admin-help">Cada aplicación puede tener un título y una explicación breve.</p>
        <Repeater items={product.applications} itemClass="application" onMove={(i, d) => moveList('applications', i, d)} onReorder={(from, to) => reorderList('applications', from, to)} onRemove={(i) => removeList('applications', i)}>
          {(item, i) => <><input value={item.title} onChange={(e) => updateList('applications', i, 'title', e.target.value)} placeholder="Título de la aplicación" /><textarea value={item.description} onChange={(e) => updateList('applications', i, 'description', e.target.value)} placeholder="Descripción opcional" /></>}
        </Repeater>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => addList('applications', { title: '', description: '' })}>+ Añadir aplicación</button>
      </section>

      <section className="admin-form-section">
        <h3>Ventajas técnicas</h3>
        <Repeater items={product.advantages} itemClass="advantage" onMove={(i, d) => moveList('advantages', i, d)} onReorder={(from, to) => reorderList('advantages', from, to)} onRemove={(i) => removeList('advantages', i)}>
          {(item, i) => <><input value={item.title} onChange={(e) => updateList('advantages', i, 'title', e.target.value)} placeholder="Título" /><textarea value={item.description} onChange={(e) => updateList('advantages', i, 'description', e.target.value)} placeholder="Descripción" /><ImageInput value={item.icon} name="advantage-icon" index={i} onChange={(value) => updateList('advantages', i, 'icon', value)} /></>}
        </Repeater>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => addList('advantages', { title: '', description: '', icon: '' })}>+ Añadir ventaja</button>
      </section>

      <section className="admin-form-section">
        <h3>Datos técnicos</h3>
        <p className="admin-help">La unidad se guarda separada del valor. Por ejemplo: valor <b>21</b>, unidad <b>mm</b>.</p>
        <Repeater items={product.specs} onMove={moveSpec} onReorder={(from, to) => reorderList('specs', from, to)} onRemove={(i) => setProduct((p) => ({ ...p, specs: p.specs.filter((_, index) => index !== i) }))}>
          {(spec, i) => <><input value={spec.label} onChange={(e) => updateSpec(i, 'label', e.target.value)} placeholder="Característica" /><input value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} placeholder="Valor" /><input value={spec.unit} onChange={(e) => updateSpec(i, 'unit', e.target.value)} placeholder="Unidad (mm, m, V...)" /><label className="check spec-featured-check"><input type="checkbox" checked={Boolean(spec.featured)} onChange={(e) => updateSpec(i, 'featured', e.target.checked)} /> Mostrar como característica destacada</label></>}
        </Repeater>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct((p) => ({ ...p, specs: [...p.specs, { label: '', value: '', unit: '', featured: false }] }))}>+ Añadir especificación</button>
        <div className="admin-form-grid two admin-technical-media">
          <div><label>Dibujo técnico</label><ImageInput value={product.technicalDrawing} name="technicalDrawing" onChange={(value) => setProduct((p) => ({ ...p, technicalDrawing: value }))} /></div>
          <label className="check"><input type="checkbox" checked={Boolean(product.showTechnicalDrawing)} onChange={setCheck('showTechnicalDrawing')} /> Mostrar dibujo técnico dentro de Datos técnicos</label>
        </div>
        <label>Aviso técnico</label><textarea value={product.technicalNotice || ''} onChange={set('technicalNotice')} placeholder="Se mostrará al final de Datos técnicos si tiene contenido." />
      </section>

      <section className="admin-form-section">
        <h3>Buscador y opciones</h3>
        <label>Etiquetas <small>(separadas por comas; se usan para buscador, filtros y SEO)</small></label>
        <input value={commaText(product.tags)} onChange={set('tags')} />
        <label className="check"><input type="checkbox" checked={Boolean(product.showTags)} onChange={setCheck('showTags')} /> Mostrar etiquetas públicamente</label>
        <div className="admin-form-grid two"><div><label>Precio (€)</label><input type="number" step="0.01" min="0" value={product.price ?? ''} onChange={set('price')} /></div><div><label>Unidad de venta</label><input value={product.unit || ''} onChange={set('unit')} /></div></div>
        <div className="admin-check-row"><label className="check"><input type="checkbox" checked={Boolean(product.featured)} onChange={setCheck('featured')} /> Destacado</label><label className="check"><input type="checkbox" checked={Boolean(product.outlet)} onChange={setCheck('outlet')} /> Outlet</label></div>
        <label>Ficha técnica PDF</label>
        <div className="admin-pdf-row"><input type="file" accept="application/pdf,.pdf" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { const value = await fileToPdfDataUrl(file); setProduct((p) => ({ ...p, datasheet: value })) } catch { alert('No se pudo procesar el PDF.') } finally { setUploading(false) } }} />{product.datasheet && <><button type="button" className="btn btn-outline btn-sm" onClick={() => openPdfDataUrl(product.datasheet)}>Ver PDF</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setProduct((p) => ({ ...p, datasheet: '' }))}>Quitar</button></>}</div>
      </section>
      {uploading && <p className="admin-help">Procesando archivo...</p>}
      <div style={{ display: 'flex', gap: 10 }}><button type="submit" className="btn btn-primary">{initial.id ? 'Guardar cambios' : 'Crear producto'}</button><button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button></div>
    </form>
  )
}

function Repeater({ items, children, onMove, onReorder, onRemove, itemClass = '' }) {
  const [dragged, setDragged] = useState(null)
  return <div className={`admin-repeater ${itemClass}`}>
    {items.map((item, i) => <div key={i} className="admin-repeater-row" draggable onDragStart={() => setDragged(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragged != null && dragged !== i) { onReorder(dragged, i); setDragged(null) } }}>
      <span className="drag-handle" title="Arrastra para ordenar">⠿</span><div className="admin-repeater-fields">{children(item, i)}</div><div className="repeater-actions"><button type="button" onClick={() => onMove(i, -1)} aria-label="Subir">↑</button><button type="button" onClick={() => onMove(i, 1)} aria-label="Bajar">↓</button><button type="button" className="btn btn-danger btn-sm" onClick={() => { if (confirm('¿Eliminar este elemento?')) onRemove(i) }}>Eliminar</button></div>
    </div>)}
  </div>
}
