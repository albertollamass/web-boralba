import { useState } from 'react'
import { useCategories } from '../../application/catalog/CategoriesContext'
import { openPdf } from '../utils/pdf'

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

const itemText = (value) => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : value && typeof value === 'object' ? String(value.text ?? value.title ?? value.name ?? value.label ?? value.body ?? '').trim() : ''
const list = (value) => (Array.isArray(value) ? value : (value || '').split(/\n/)).map(itemText).filter(Boolean)
const csv = (value) => (Array.isArray(value) ? value : (value || '').split(',')).map((x) => String(x || '').trim()).filter(Boolean)
const text = (value) => (Array.isArray(value) ? value.join('\n') : value || '')
const commaText = (value) => (Array.isArray(value) ? value.join(', ') : value || '')
const dataUrl = (value) => typeof value === 'string' && value.startsWith('data:')
const uniqueValues = (values) => [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))]

function normalizeApplications(value, example = {}) {
  const applications = (Array.isArray(value) ? value : list(value)).map((item) => typeof item === 'string' ? { title: item, description: '' } : { title: item?.text || item?.title || item?.name || item?.application || '', description: item?.description || item?.detail || '', image: item?.image || '', spaceType: item?.spaceType || '', inspiration: Boolean(item?.inspiration) })
  const exampleHasContent = example.image || example.title || example.description || example.spaceType
  const alreadyIntegrated = applications.some((item) => (example.image && item.image === example.image) || (example.title && item.title === example.title && item.description === example.description))
  return exampleHasContent && !alreadyIntegrated
    ? [...applications, { title: example.title || example.spaceType || 'Aplicación', description: example.description || '', image: example.image || '', spaceType: example.spaceType || '', inspiration: Boolean(example.inspiration) }]
    : applications
}

function normalizeAdvantages(value) {
  return (Array.isArray(value) ? value : list(value)).map((item) => typeof item === 'string' ? { title: item, description: '', icon: '' } : { title: item?.text || item?.title || item?.name || '', description: item?.description || item?.detail || '', icon: item?.icon || '' })
}

function normalizeGallery(value) {
  return (Array.isArray(value) ? value : csv(value)).map((item) => typeof item === 'string' ? { src: item, category: 'Detalle del producto' } : { src: item?.src || item?.image || '', category: item?.category || 'Detalle del producto' }).filter((item) => item.src)
}

const technicalRow = (row = {}) => ({ label: row.label || '', value: row.value || '' })
const technicalCode = (row = {}) => ({
  code: row.code || '',
  power: row.power || '',
  temperature: row.temperature || '',
  cri: row.cri || '',
  luminousFlux: row.luminousFlux || '',
  dimensions: row.dimensions || '',
  dimming: row.dimming || '',
  ip: row.ip || '',
  finish: row.finish || '',
})
const normalizeTechnicalInfo = (value = {}) => {
  const codes = (value.codes || []).map(technicalCode)
  const temperatures = Array.isArray(value.temperatures) ? uniqueValues(value.temperatures) : []
  const protections = Array.isArray(value.protections) ? uniqueValues(value.protections) : []
  return {
  type: value.type || '',
  general: (value.general || []).map(technicalRow),
  temperatures: [...new Set([...temperatures, ...codes.map((code) => code.temperature).filter(Boolean)])],
  protections: [...new Set([...protections, ...codes.map((code) => code.ip).filter(Boolean)])],
  ledBasic: (value.ledBasic || []).map(technicalRow),
  ledDimensions: (value.ledDimensions || []).map(technicalRow),
  profileFinishes: (value.profileFinishes || []).map((finish) => ({ name: finish.name || '', color: finish.color || '' })),
  profileDimensions: (value.profileDimensions || []).map(technicalRow),
  codes,
  }
}
const categoryFamily = (categories, product = {}) => {
  const values = Array.isArray(categories) ? categories : [categories]
  const categoryText = [...values, product.name, product.description].filter(Boolean).join(' ').toLowerCase()
  if (categoryText.includes('perfil')) return 'profile'
  if (categoryText.includes('tira') && !categoryText.includes('neon') && !categoryText.includes('neón')) return 'led-strip'
  return ''
}

export default function ProductForm({ initial, onSubmit, onCancel, allProducts = [], documentStorage }) {
  if (!documentStorage) throw new Error('ProductForm necesita documentStorage (puerto DocumentStorage)')
  const { getChildren, getCategoryPathLabel, getDescendantSlugs, ROOT } = useCategories()
  const [product, setProduct] = useState(() => ({
    ...initial,
    categories: [...new Set((Array.isArray(initial.categories) && initial.categories.length ? initial.categories : [initial.category]).filter(Boolean))],
    specs: (initial.specs || []).map((s) => ({ label: s.label || '', value: s.value || '', unit: s.unit || '', featured: Boolean(s.featured) })),
    applications: normalizeApplications(initial.applications, initial.applicationExample),
    advantages: normalizeAdvantages(initial.advantages),
    gallery: normalizeGallery(initial.gallery),
    includedItems: Array.isArray(initial.includedItems) ? initial.includedItems.map((item) => ({ quantity: item.quantity || '', name: item.name || item.title || '', description: item.description || '', icon: item.icon || '', })) : [],
    applicationExample: { image: '', title: '', description: '', spaceType: '', inspiration: false, ...(initial.applicationExample || {}) },
    compatibleProducts: Array.isArray(initial.compatibleProducts) ? initial.compatibleProducts : [],
    similarProductIds: Array.isArray(initial.similarProductIds) ? initial.similarProductIds : [],
    documents: Array.isArray(initial.documents) ? initial.documents : [],
    technicalInfo: normalizeTechnicalInfo(initial.technicalInfo),
  }))
  const [uploading, setUploading] = useState(false)
  const [fileKeys, setFileKeys] = useState({})
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryTop, setCategoryTop] = useState('')
  const topCats = getChildren(ROOT.slug)
  const selectedCategory = product.categories?.[0] || product.category || ''
  const selectedTop = topCats.find((top) => getDescendantSlugs(top.slug).includes(selectedCategory))?.slug || topCats[0]?.slug || ''
  const activeCategoryTop = categoryTop || selectedTop
  const categoryChildren = getDescendantSlugs(activeCategoryTop).filter((slug) => slug !== activeCategoryTop)
  const set = (key) => (e) => setProduct((p) => ({ ...p, [key]: e.target.value }))
  const setCheck = (key) => (e) => setProduct((p) => ({ ...p, [key]: e.target.checked }))
  const chooseCategory = (slug) => setProduct((p) => {
    const categories = [slug, ...(p.categories || []).filter((category) => category !== slug)]
    return { ...p, category: slug, categories }
  })

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

  const updateGallery = (i, field, value) => setProduct((p) => ({ ...p, gallery: p.gallery.map((g, index) => index === i ? { ...g, [field]: value } : g) }))
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
      category: product.categories?.[0] || product.category,
      categories: [...new Set((product.categories || [product.category]).filter(Boolean))],
      price: product.price === '' || product.price == null ? null : Number(product.price),
       image: product.image || 'images/placeholder.svg',
      longDescription: list(product.longDescription),
      features: list(product.features),
      applications: product.applications.filter((a) => a.title || a.description),
      advantages: product.advantages.filter((a) => a.title || a.description),
      tags: csv(product.tags),
       gallery: product.gallery.filter((item) => item.src),
       specs: product.specs.filter((s) => s.label || s.value).map((s) => ({ label: s.label, value: s.value, unit: s.unit, featured: Boolean(s.featured) })),
       includedItems: product.includedItems.filter((item) => item.name || item.quantity).map((item, order) => ({ ...item, order })),
       compatibleProducts: product.compatibleProducts.map((item, order) => ({ productId: item.productId, reason: item.reason || '', recommended: Boolean(item.recommended), order })),
       similarProductIds: product.similarProductIds.filter(Boolean),
       documents: product.documents.filter((item) => item.name || item.file).map((item, order) => ({ ...item, order })),
         technicalInfo: {
          type: categoryFamily(product.categories, product) || product.technicalInfo.type || 'generic',
          general: product.technicalInfo.general.filter((row) => row.label || row.value),
          temperatures: uniqueValues(product.technicalInfo.temperatures),
          protections: uniqueValues(product.technicalInfo.protections),
         ledBasic: product.technicalInfo.ledBasic.filter((row) => row.label || row.value),
         ledDimensions: product.technicalInfo.ledDimensions.filter((row) => row.label || row.value),
         profileFinishes: product.technicalInfo.profileFinishes.filter((finish) => finish.name || finish.color),
         profileDimensions: product.technicalInfo.profileDimensions.filter((row) => row.label || row.value),
         codes: product.technicalInfo.codes.filter((row) => Object.values(row).some(Boolean)),
       },
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
      <details className="admin-form-section admin-collapsible" open>
        <summary>Información principal <small>Nombre, referencia, categoría y descripciones</small></summary>
        <div className="admin-collapsible-content">
        <div className="admin-form-grid two">
          <div><label>Nombre *</label><input value={product.name || ''} onChange={set('name')} required /></div>
          <div><label>Referencia</label><input value={product.ref || ''} onChange={set('ref')} /></div>
        </div>
        <label>Categoría *</label>
        <div className={`admin-category-picker${categoryOpen ? ' is-open' : ''}`}>
          <button type="button" className="admin-category-current" onClick={() => { setCategoryTop(selectedTop); setCategoryOpen((open) => !open) }} aria-expanded={categoryOpen}>
            <span>{selectedCategory ? getCategoryPathLabel(selectedCategory) : 'Selecciona una categoría...'}</span><b>{categoryOpen ? 'Cerrar' : 'Cambiar'}</b>
          </button>
          {categoryOpen && <div className="admin-category-options">
            <select value={activeCategoryTop} onChange={(event) => { const slug = event.target.value; const children = getDescendantSlugs(slug).filter((item) => item !== slug); setCategoryTop(slug); if (!children.length) { chooseCategory(slug); setCategoryOpen(false) } }} required>
              <option value="">Selecciona una familia...</option>
              {topCats.map((top) => <option key={top.slug} value={top.slug}>{top.name}</option>)}
            </select>
            {categoryChildren.length > 0 && <select value={categoryChildren.includes(selectedCategory) ? selectedCategory : ''} onChange={(event) => { if (event.target.value) { chooseCategory(event.target.value); setCategoryOpen(false) } }} required>
              <option value="">Selecciona una subcategoría...</option>
              {categoryChildren.map((slug) => <option key={slug} value={slug}>{getCategoryPathLabel(slug)}</option>)}
            </select>}
          </div>}
        </div>
        <p className="admin-help">Opcional si el producto aún no tiene categoría. Las asignaciones adicionales guardadas se conservan.</p>
         <div className="admin-form-grid two">
           <div><label>Descripción corta</label><textarea value={product.description || ''} onChange={set('description')} /></div>
           <div><label>Descripción larga <small>(un párrafo por línea)</small></label><textarea value={text(product.longDescription)} onChange={set('longDescription')} /></div>
         </div>
          <label>Imagen principal</label>
        <ImageInput value={product.image} name="image" onChange={(value) => setProduct((p) => ({ ...p, image: value }))} />
        <label>Galería de imágenes</label>
         {(product.gallery || []).map((image, i) => <div className="admin-repeater-row" key={i}><ImageInput value={image.src} name="gallery" index={i} onChange={(value) => updateGallery(i, 'src', value)} /><select value={image.category} onChange={(e) => updateGallery(i, 'category', e.target.value)}><option>Detalle del producto</option><option>Sección o dimensiones</option><option>Dibujo técnico</option><option>Accesorios</option><option>Ejemplo de aplicación</option><option>Imagen principal</option></select><div className="repeater-actions"><button type="button" onClick={() => moveGallery(i, -1)} aria-label="Subir imagen">↑</button><button type="button" onClick={() => moveGallery(i, 1)} aria-label="Bajar imagen">↓</button><button type="button" className="btn btn-danger btn-sm" onClick={() => removeGallery(i)}>Eliminar</button></div></div>)}
         <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct((p) => ({ ...p, gallery: [...(p.gallery || []), { src: '', category: 'Detalle del producto' }] }))}>+ Añadir imagen</button>
        </div>
      </details>

      <details className="admin-form-section admin-collapsible" open>
        <summary>Opciones y códigos <small>Según el tipo de producto</small></summary>
        <div className="admin-collapsible-content">
          <TechnicalSection product={product} setProduct={setProduct} />
        </div>
      </details>

        <details className="admin-form-section admin-collapsible">
          <summary>Información complementaria <small>Campos opcionales</small></summary>
          <div className="admin-collapsible-content">
          <section className="admin-form-subsection">
          <h3>Qué incluye <small>(opcional)</small></h3>
        <p className="admin-help">Solo se mostrará en la ficha si hay elementos con contenido.</p>
        <Repeater items={product.includedItems} onMove={(i, d) => moveList('includedItems', i, d)} onReorder={(a, b) => reorderList('includedItems', a, b)} onRemove={(i) => removeList('includedItems', i)}>
          {(item, i) => <><input value={item.quantity} onChange={(e) => updateList('includedItems', i, 'quantity', e.target.value)} placeholder="Cantidad (ej. 1)" /><input value={item.name} onChange={(e) => updateList('includedItems', i, 'name', e.target.value)} placeholder="Nombre del elemento" /><input value={item.description} onChange={(e) => updateList('includedItems', i, 'description', e.target.value)} placeholder="Descripción opcional" /><ImageInput value={item.icon} name="included-icon" index={i} onChange={(value) => updateList('includedItems', i, 'icon', value)} /></>}
        </Repeater>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => addList('includedItems', { quantity: '', name: '', description: '', icon: '' })}>+ Añadir elemento incluido</button>
          </section>

       <section className="admin-form-subsection">
         <h3>Productos compatibles y similares <small>(opcional)</small></h3>
        <p className="admin-help">Busca productos existentes; no se crean relaciones automáticas.</p>
        <CompatibleEditor items={product.compatibleProducts} products={allProducts.filter((p) => p.id !== initial.id)} onChange={(items) => setProduct((p) => ({ ...p, compatibleProducts: items }))} />
        <h4>Productos similares</h4>
        <select multiple value={product.similarProductIds} onChange={(e) => setProduct((p) => ({ ...p, similarProductIds: [...e.target.selectedOptions].map((option) => option.value) }))}>{allProducts.filter((p) => p.id !== initial.id).map((item) => <option key={item.id} value={item.id}>{item.name}{item.ref ? ` · ${item.ref}` : ''}</option>)}</select>
       </section>

       <section className="admin-form-subsection">
          <h3>Aplicaciones <small>(opcional)</small></h3>
          <p className="admin-help">Añade cada aplicación con un título y una explicación breve. Los datos del antiguo ejemplo de aplicación se han integrado aquí.</p>
         <Repeater items={product.applications} itemClass="application" onMove={(i, d) => moveList('applications', i, d)} onReorder={(from, to) => reorderList('applications', from, to)} onRemove={(i) => removeList('applications', i)}>
           {(item, i) => <><input value={item.title} onChange={(e) => updateList('applications', i, 'title', e.target.value)} placeholder="Título de la aplicación" /><textarea value={item.description} onChange={(e) => updateList('applications', i, 'description', e.target.value)} placeholder="Descripción opcional" /></>}
         </Repeater>
         <button type="button" className="btn btn-ghost btn-sm" onClick={() => addList('applications', { title: '', description: '' })}>+ Añadir aplicación</button>
       </section>

       <section className="admin-form-subsection">
         <h3>Ventajas técnicas <small>(opcional)</small></h3>
         <Repeater items={product.advantages} itemClass="advantage" onMove={(i, d) => moveList('advantages', i, d)} onReorder={(from, to) => reorderList('advantages', from, to)} onRemove={(i) => removeList('advantages', i)}>
           {(item, i) => <><input value={item.title} onChange={(e) => updateList('advantages', i, 'title', e.target.value)} placeholder="Título" /><textarea value={item.description} onChange={(e) => updateList('advantages', i, 'description', e.target.value)} placeholder="Descripción" /><ImageInput value={item.icon} name="advantage-icon" index={i} onChange={(value) => updateList('advantages', i, 'icon', value)} /></>}
         </Repeater>
         <button type="button" className="btn btn-ghost btn-sm" onClick={() => addList('advantages', { title: '', description: '', icon: '' })}>+ Añadir ventaja</button>
       </section>

       <section className="admin-form-subsection">
         <h3>Datos técnicos y avisos <small>(opcional)</small></h3>
         <p className="admin-help">La unidad se guarda separada del valor. Por ejemplo: valor <b>21</b>, unidad <b>mm</b>.</p>
         <Repeater items={product.specs} onMove={moveSpec} onReorder={(from, to) => reorderList('specs', from, to)} onRemove={(i) => setProduct((p) => ({ ...p, specs: p.specs.filter((_, index) => index !== i) }))}>
           {(spec, i) => <><input value={spec.label} onChange={(e) => updateSpec(i, 'label', e.target.value)} placeholder="Característica" /><input value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} placeholder="Valor" /><input value={spec.unit} onChange={(e) => updateSpec(i, 'unit', e.target.value)} placeholder="Unidad (mm, m, V...)" /><label className="check spec-featured-check"><input type="checkbox" checked={Boolean(spec.featured)} onChange={(e) => updateSpec(i, 'featured', e.target.checked)} /> Mostrar como característica destacada</label></>}
         </Repeater>
         <button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct((p) => ({ ...p, specs: [...p.specs, { label: '', value: '', unit: '', featured: false }] }))}>+ Añadir especificación</button>
         <div className="admin-form-grid two admin-technical-media">
           <div><label>Dibujo técnico</label><ImageInput value={product.technicalDrawing} name="technicalDrawing" onChange={(value) => setProduct((p) => ({ ...p, technicalDrawing: value }))} /></div>
           <label className="check"><input type="checkbox" checked={Boolean(product.showTechnicalDrawing)} onChange={setCheck('showTechnicalDrawing')} /> Mostrar dibujo técnico dentro de Datos técnicos</label>
         </div>
         <label>Aviso técnico <small>(opcional)</small></label><textarea value={product.technicalNotice || ''} onChange={set('technicalNotice')} placeholder="Se mostrará al final de Datos técnicos si tiene contenido." />
       </section>
          </div>
        </details>

       <details className="admin-form-section admin-collapsible">
         <summary>Documentación y buscador <small>Archivos, etiquetas y clasificación</small></summary>
         <div className="admin-collapsible-content">
       <section className="admin-form-subsection">
          <h3>Documentación <small>(opcional)</small></h3>
        <Repeater items={product.documents} onMove={(i, d) => moveList('documents', i, d)} onReorder={(a, b) => reorderList('documents', a, b)} onRemove={(i) => removeList('documents', i)}>
          {(item, i) => <><input value={item.name || ''} onChange={(e) => updateList('documents', i, 'name', e.target.value)} placeholder="Nombre del documento" /><select value={item.type || 'Otros documentos'} onChange={(e) => updateList('documents', i, 'type', e.target.value)}>{['Ficha técnica', 'Dibujo técnico', 'Instrucciones de montaje', 'Certificado', 'Archivo fotométrico', 'Imagen en alta resolución', 'Otros documentos'].map((type) => <option key={type}>{type}</option>)}</select><input type="file" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { updateList('documents', i, 'file', await documentStorage.uploadDocument(file)) } catch (error) { alert(error?.message || 'No se pudo procesar el documento.') } finally { setUploading(false) } }} /><input value={item.file?.startsWith('data:') ? '' : item.file || ''} onChange={(e) => updateList('documents', i, 'file', e.target.value)} placeholder="o pega una URL" /><label className="check"><input type="checkbox" checked={item.public !== false} onChange={(e) => updateList('documents', i, 'public', e.target.checked)} /> Visibilidad pública</label></>}
        </Repeater>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => addList('documents', { name: '', type: 'Otros documentos', file: '', public: true })}>+ Añadir documento</button>
      </section>

        <section className="admin-form-subsection">
         <h3>Buscador y opciones <small>(opcional)</small></h3>
        <label>Etiquetas <small>(separadas por comas; se usan para buscador, filtros y SEO)</small></label>
        <input value={commaText(product.tags)} onChange={set('tags')} />
        <label className="check"><input type="checkbox" checked={Boolean(product.showTags)} onChange={setCheck('showTags')} /> Mostrar etiquetas públicamente</label>
        <div className="admin-form-grid two"><div><label>Precio (€)</label><input type="number" step="0.01" min="0" value={product.price ?? ''} onChange={set('price')} /></div><div><label>Unidad de venta</label><input value={product.unit || ''} onChange={set('unit')} /></div></div>
        <div className="admin-check-row"><label className="check"><input type="checkbox" checked={Boolean(product.featured)} onChange={setCheck('featured')} /> Destacado</label><label className="check"><input type="checkbox" checked={Boolean(product.outlet)} onChange={setCheck('outlet')} /> Outlet</label></div>
        <label>Ficha técnica PDF</label>
        <div className="admin-pdf-row"><input type="file" accept="application/pdf,.pdf" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { const value = await documentStorage.uploadDocument(file); setProduct((p) => ({ ...p, datasheet: value })) } catch (error) { alert(error?.message || 'No se pudo procesar el PDF.') } finally { setUploading(false) } }} />{product.datasheet && <><button type="button" className="btn btn-outline btn-sm" onClick={() => openPdf(product.datasheet)}>Ver PDF</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setProduct((p) => ({ ...p, datasheet: '' }))}>Quitar</button></>}</div>
        </section>
          </div>
        </details>
       {uploading && <p className="admin-help">Procesando archivo...</p>}
      <div style={{ display: 'flex', gap: 10 }}><button type="submit" className="btn btn-primary">{initial.id ? 'Guardar cambios' : 'Crear producto'}</button><button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button></div>
    </form>
  )
}

function TechnicalSection({ product, setProduct }) {
  const type = categoryFamily(product.categories, product) || product.technicalInfo.type || 'generic'
  return <section className="admin-form-section admin-product-technical-section">
    <h3>Ficha técnica específica</h3>
    <p className="admin-help">Selecciona el tipo para añadir información técnica editable que aparecerá debajo de la descripción corta.</p>
    <label>Tipo de ficha técnica<select value={type} onChange={(event) => setProduct((p) => ({ ...p, technicalInfo: { ...p.technicalInfo, type: event.target.value } }))}><option value="generic">Producto general</option><option value="led-strip">Tira LED</option><option value="profile">Perfil</option></select></label>
    {type && <TechnicalEditor type={type} value={product.technicalInfo} onChange={(technicalInfo) => setProduct((p) => ({ ...p, technicalInfo }))} />}
  </section>
}

function TechnicalEditor({ type, value, onChange }) {
  const updateRow = (key, index, field, nextValue) => onChange({ ...value, [key]: value[key].map((row, i) => i === index ? { ...row, [field]: nextValue } : row) })
  const addRow = (key, row) => onChange({ ...value, [key]: [...value[key], row] })
  const removeRow = (key, index) => onChange({ ...value, [key]: value[key].filter((_, i) => i !== index) })
  const renderRows = (key, fields, placeholder) => <div className="technical-editor-list">{value[key].map((row, index) => <div className="technical-editor-row" key={index}>{fields.map(([field, label]) => <input key={field} value={row[field]} onChange={(event) => updateRow(key, index, field, event.target.value)} placeholder={label} />)}<button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow(key, index)}>Eliminar</button></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => addRow(key, { label: '', value: '' })}>+ Añadir {placeholder}</button></div>

  if (type === 'generic') return <>
    <h3>Información técnica del producto</h3>
    <p className="admin-help">Añade cualquier dato técnico disponible para este producto.</p>
    {renderRows('general', [['label', 'Característica'], ['value', 'Valor']], 'dato técnico')}
  </>

  if (type === 'profile') return <>
    <h3>Información técnica del perfil</h3>
    <p className="admin-help">Solo se mostrarán los acabados, dimensiones y códigos que hayas informado.</p>
    <h4>Acabado</h4>
    <div className="technical-editor-list">{value.profileFinishes.map((finish, index) => <div className="technical-editor-row technical-finish-row" key={index}><input value={finish.name} onChange={(event) => updateRow('profileFinishes', index, 'name', event.target.value)} placeholder="Acabado (ej. negro)" /><input value={finish.color} onChange={(event) => updateRow('profileFinishes', index, 'color', event.target.value)} placeholder="Color CSS o hexadecimal" /><button type="button" className="btn btn-danger btn-sm" onClick={() => removeRow('profileFinishes', index)}>Eliminar</button></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => addRow('profileFinishes', { name: '', color: '' })}>+ Añadir acabado</button></div>
    <h4>Dimensiones</h4>
    {renderRows('profileDimensions', [['label', 'Medida'], ['value', 'Valor']], 'dimensión')}
    <h4>Códigos de producto</h4>
    <CodeEditor value={value.codes} onChange={(codes) => onChange({ ...value, codes })} type="profile" finishes={value.profileFinishes} dimensions={value.profileDimensions} />
  </>

  return <>
    <h3>Información técnica de la tira LED</h3>
    <p className="admin-help">Define las opciones disponibles y después vincula cada código con su temperatura y protección IP.</p>
    <h4>Temperaturas</h4>
    <OptionEditor items={value.temperatures} placeholder="Ej. 3000 K" onChange={(temperatures) => onChange({ ...value, temperatures })} />
    <h4>Protección</h4>
    <OptionEditor items={value.protections} placeholder="Ej. IP20" onChange={(protections) => onChange({ ...value, protections })} />
    <h4>Códigos de producto</h4>
    <CodeEditor value={value.codes} onChange={(codes) => onChange({ ...value, codes })} type="led-strip" temperatures={value.temperatures} protections={value.protections} />
  </>
}

function CodeEditor({ value, onChange, type, finishes = [], dimensions = [], temperatures = [], protections = [] }) {
  const fields = type === 'profile'
    ? [['code', 'Código de producto'], ['finish', 'Acabado'], ['dimensions', 'Dimensiones']]
    : [['code', 'Código de producto'], ['power', 'Potencia (W/m)'], ['temperature', 'Temperatura de color (K)'], ['cri', 'CRI'], ['luminousFlux', 'Flujo luminoso (lm)'], ['dimming', 'Regulación'], ['ip', 'Grado de protección IP']]
  const update = (index, field, nextValue) => onChange(value.map((row, i) => i === index ? { ...row, [field]: nextValue } : row))
  const temperatureOptions = [...new Set([...temperatures, ...value.map((row) => row.temperature)].filter(Boolean))]
  const protectionOptions = [...new Set([...protections, ...value.map((row) => row.ip)].filter(Boolean))]
  const inputFor = (row, index, [field, label]) => (type === 'profile' && field !== 'code') || (type === 'led-strip' && ['temperature', 'ip'].includes(field)) ? <select key={field} value={row[field]} onChange={(event) => update(index, field, event.target.value)}><option value="">{label}</option>{(type === 'profile' ? (field === 'finish' ? [...new Set([...finishes.map((finish) => finish.name), ...value.map((item) => item.finish)])].filter(Boolean) : [...new Set([...dimensions.map((dimension) => [dimension.label, dimension.value].filter(Boolean).join(' · ')), ...value.map((item) => item.dimensions)])].filter(Boolean)) : field === 'temperature' ? temperatureOptions : protectionOptions).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input key={field} value={row[field]} onChange={(event) => update(index, field, event.target.value)} placeholder={label} />
  return <div className="technical-code-editor"><div className="technical-editor-list">{value.map((row, index) => <div className="technical-code-row" key={index}>{fields.map((field) => inputFor(row, index, field))}<button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(value.filter((_, i) => i !== index))}>Eliminar</button></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...value, technicalCode()])}>+ Añadir código</button></div></div>
}

function OptionEditor({ items, placeholder, onChange }) {
  const update = (index, nextValue) => {
    const next = items.map((current, i) => i === index ? nextValue : current)
    const cleaned = [...new Set(next.map((item) => String(item || '').trim()).filter(Boolean))]
    onChange(cleaned)
  }
  return <div className="technical-editor-list">{items.map((item, index) => <div className="technical-editor-row technical-option-row" key={`${item}-${index}`}><input value={item} onChange={(event) => update(index, event.target.value)} placeholder={placeholder} /><button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(items.filter((_, i) => i !== index))}>Eliminar</button></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...items, ''])}>+ Añadir opción</button></div>
}

function Repeater({ items, children, onMove, onReorder, onRemove, itemClass = '' }) {
  const [dragged, setDragged] = useState(null)
  return <div className={`admin-repeater ${itemClass}`}>
    {items.map((item, i) => <div key={i} className="admin-repeater-row" draggable onDragStart={() => setDragged(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragged != null && dragged !== i) { onReorder(dragged, i); setDragged(null) } }}>
      <span className="drag-handle" title="Arrastra para ordenar">⠿</span><div className="admin-repeater-fields">{children(item, i)}</div><div className="repeater-actions"><button type="button" onClick={() => onMove(i, -1)} aria-label="Subir">↑</button><button type="button" onClick={() => onMove(i, 1)} aria-label="Bajar">↓</button><button type="button" className="btn btn-danger btn-sm" onClick={() => { if (confirm('¿Eliminar este elemento?')) onRemove(i) }}>Eliminar</button></div>
    </div>)}
  </div>
}

function CompatibleEditor({ items, products, onChange }) {
  const update = (index, field, value) => onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  return <>
    {items.map((item, i) => <div className="admin-repeater-row" key={`${item.productId}-${i}`}><select value={item.productId || ''} onChange={(e) => update(i, 'productId', e.target.value)}><option value="">Selecciona un producto...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.ref ? ` · ${p.ref}` : ''}</option>)}</select><input value={item.reason || ''} onChange={(e) => update(i, 'reason', e.target.value)} placeholder="Motivo de compatibilidad" /><label className="check"><input type="checkbox" checked={Boolean(item.recommended)} onChange={(e) => update(i, 'recommended', e.target.checked)} /> Recomendado</label><button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(items.filter((_, index) => index !== i))}>Eliminar</button></div>)}
    <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...items, { productId: '', reason: '', recommended: false }])}>+ Añadir compatible</button>
  </>
}
