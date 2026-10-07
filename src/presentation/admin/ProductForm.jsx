import { useState } from 'react'
import { useCategories } from '../../application/catalog/CategoriesContext'
import { openPdf } from '../utils/pdf'
import { technicalFeatureGroups } from '../../domain/catalog/technicalFeatures'

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
const isExplicitlyExcluded = (item = {}) => item.status === 'excluded' || /no\s+incluid[oa]/i.test(`${item.name || ''} ${item.description || ''} ${item.quantity || ''}`)
const extractAccessoryReference = (item = {}) => {
  const direct = item.reference || item.ref || item.code || item.sku || item.productCode
  if (direct) return String(direct).trim()
  const text = `${item.name || item.title || ''} ${item.description || ''} ${item.quantity || ''}`
  return text.match(/(?:ref(?:erencia)?|c[oó]digo)\.?\s*[:#-]?\s*([A-Z0-9()_-]+)/i)?.[1] || ''
}
const accessoryFromIncluded = (item = {}) => ({
  name: item.name || item.title || '',
  reference: extractAccessoryReference(item),
  image: item.image || '',
  description: item.description || '',
  linkedProductId: item.linkedProductId || '',
})
const normalizeAccessories = (value, included = []) => [
  ...(Array.isArray(value) ? value : []),
  ...(Array.isArray(included) ? included : []).filter(isExplicitlyExcluded).map(accessoryFromIncluded),
].filter((item, index, values) => (item.name || item.reference) && values.findIndex((other) => `${other.name}|${other.reference}` === `${item.name}|${item.reference}`) === index).map((item) => ({ name: item.name || '', reference: extractAccessoryReference(item), image: item.image || '', description: item.description || '', linkedProductId: item.linkedProductId || '' }))

const technicalRow = (row = {}) => ({ label: row.label || '', value: row.value || '' })
const technicalCode = (row = {}) => ({
  ...row,
  code: row.code || '',
  power: row.power || '',
  temperature: row.temperature || '',
  cri: row.cri || '',
  luminousFlux: row.luminousFlux || '',
  voltage: row.voltage || '',
  cuttingDistance: row.cuttingDistance || '',
  ledsPerMeter: row.ledsPerMeter || '',
  dimensions: row.dimensions || '',
  angle: row.angle || '',
  lifetime: row.lifetime || '',
  dimming: row.dimming || '',
  ip: row.ip || '',
  finish: row.finish || '',
  material: row.material || '',
  mounting: row.mounting || '',
  diffuser: row.diffuser || '',
  cct: row.cct || '',
  optics: row.optics || '',
  ugr: row.ugr || '',
  ik: row.ik || '',
})
const variantAttribute = (label, value) => ({ label: label || '', value: value || '' })
const variantSpec = (label, value, unit = '') => ({ label: label || '', value: value || '', unit: unit || '' })
const variantFromCode = (code = {}) => ({
  reference: code.code || '',
  attributes: [variantAttribute('Temperatura', code.temperature), variantAttribute('Protección', code.ip), variantAttribute('Acabado', code.finish), variantAttribute('Dimensiones', code.dimensions)].filter((row) => row.value),
  specs: [variantSpec('Potencia', code.power), variantSpec('Flujo luminoso', code.luminousFlux), variantSpec('CRI', code.cri), variantSpec('Tensión', code.voltage), variantSpec('Distancia de corte', code.cuttingDistance), variantSpec('LEDs/m', code.ledsPerMeter), variantSpec('Dimensiones', code.dimensions), variantSpec('Ángulo', code.angle), variantSpec('Regulación', code.dimming), variantSpec('Vida útil', code.lifetime)].filter((row) => row.value),
})
const normalizeVariant = (variant = {}) => ({
  ...variant,
  reference: variant.reference || variant.ref || variant.code || '',
  legacyData: variant.legacyData || ((variant.label || variant.value || variant.option) ? { label: variant.label || '', value: variant.value || variant.option || '' } : null),
  attributes: (Array.isArray(variant.attributes) ? variant.attributes : []).map((row) => variantAttribute(row.label || row.name, row.value || row.option)).filter((row) => row.label || row.value),
  specs: (Array.isArray(variant.specs) ? variant.specs : []).map((row) => variantSpec(row.label, row.value, row.unit)).filter((row) => row.label || row.value),
})
const normalizeVariants = (value, technicalInfo = {}) => {
  if (Array.isArray(value) && value.length) return value.map(normalizeVariant)
  return (technicalInfo.codes || []).map(variantFromCode)
}
const normalizeTechnicalInfo = (value = {}) => {
  const codes = (value.codes || []).map(technicalCode)
  const temperatures = Array.isArray(value.temperatures) ? uniqueValues(value.temperatures) : []
  const protections = Array.isArray(value.protections) ? uniqueValues(value.protections) : []
  return {
   ...value,
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
  if (categoryText.includes('proyector')) return 'projector'
  if (categoryText.includes('panel')) return 'panel'
  if (categoryText.includes('downlight') || categoryText.includes('aplique')) return 'downlight'
  if (categoryText.includes('driver') || categoryText.includes('controlador') || categoryText.includes('fuente')) return 'driver'
  if (categoryText.includes('estanca')) return 'watertight'
  if (categoryText.includes('neon') || categoryText.includes('neón')) return 'neon-flex'
  return ''
}

const productTypeLabels = { 'led-strip': 'Tira LED', profile: 'Perfil', projector: 'Proyector', panel: 'Panel LED', downlight: 'Downlight / Aplique', driver: 'Driver / Fuente', watertight: 'Luminaria estanca', 'neon-flex': 'Neón flexible', generic: 'Otro producto' }
const featureHints = {
  'led-strip': 'Temperatura de color, Dimensiones y Ángulo de apertura',
  profile: 'Longitud, Material, Tipo de montaje y Tipo de difusor',
  projector: 'Potencia, Flujo luminoso, Óptica y Temperatura de color',
  panel: 'Potencia, Dimensiones, CRI y Ángulo de apertura',
  driver: 'Potencia, Tensión, Regulación y Protección IP',
  generic: 'Añade únicamente las características que tenga este producto',
}

export default function ProductForm({ initial, onSubmit, onCancel, allProducts = [], documentStorage }) {
  if (!documentStorage) throw new Error('ProductForm necesita documentStorage (puerto DocumentStorage)')
  const { getChildren, getCategoryPathLabel, getDescendantSlugs, ROOT } = useCategories()
  const [product, setProduct] = useState(() => ({
    ...initial,
    categories: [...new Set((Array.isArray(initial.categories) && initial.categories.length ? initial.categories : [initial.category]).filter(Boolean))],
    specs: (initial.specs || []).map((s) => ({ label: s.label || '', value: s.value || '', unit: s.unit || '', featured: Boolean(s.featured), technicalKey: s.technicalKey || s.featureType || '' })),
    applications: normalizeApplications(initial.applications, initial.applicationExample),
    advantages: normalizeAdvantages(initial.advantages),
    gallery: normalizeGallery(initial.gallery),
     includedItems: Array.isArray(initial.includedItems) ? initial.includedItems.filter((item) => !isExplicitlyExcluded(item)).map((item) => ({ quantity: item.quantity || '', name: item.name || item.title || '', description: item.description || '', icon: item.icon || '', status: item.status || '' })) : [],
     accessoriesCompatible: normalizeAccessories(initial.accessoriesCompatible, initial.includedItems || []),
    applicationExample: { image: '', title: '', description: '', spaceType: '', inspiration: false, ...(initial.applicationExample || {}) },
     compatibleProducts: Array.isArray(initial.compatibleProducts) ? initial.compatibleProducts.map((item) => ({ ...item, function: item.function || '' })) : [],
    similarProductIds: Array.isArray(initial.similarProductIds) ? initial.similarProductIds : [],
    documents: Array.isArray(initial.documents) ? initial.documents : [],
     technicalInfo: normalizeTechnicalInfo(initial.technicalInfo),
     variants: normalizeVariants(initial.variants, initial.technicalInfo || {}),
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
         specs: product.specs.filter((s) => s.label || s.value).map((s) => ({ label: s.label, value: s.value, unit: s.unit, featured: Boolean(s.featured), technicalKey: s.technicalKey || '' })),
        variants: product.variants.map((variant, order) => ({
          reference: variant.reference || '',
          attributes: (variant.attributes || []).filter((row) => row.label || row.value).map((row) => ({ label: row.label || '', value: row.value || '' })),
          specs: (variant.specs || []).filter((row) => row.label || row.value).map((row) => ({ label: row.label || '', value: row.value || '', unit: row.unit || '' })),
          legacyData: variant.legacyData || null,
          order,
        })).filter((variant) => variant.reference || variant.attributes.length || variant.specs.length || variant.legacyData),
        includedItems: product.includedItems.filter((item) => item.name || item.quantity).map((item, order) => ({ ...item, status: item.status || '', order })),
        accessoriesCompatible: product.accessoriesCompatible.filter((item) => item.name || item.reference).map((item, order) => ({ name: item.name || '', reference: item.reference || '', image: item.image || '', description: item.description || '', linkedProductId: item.linkedProductId || '', order })),
        compatibleProducts: product.compatibleProducts.filter((item) => item.productId).map((item, order) => ({ productId: item.productId, function: item.function || '', reason: item.reason || '', recommended: Boolean(item.recommended), order })),
       similarProductIds: product.similarProductIds.filter(Boolean),
       documents: product.documents.filter((item) => item.name || item.file).map((item, order) => ({ ...item, order })),
          technicalInfo: {
           ...product.technicalInfo,
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

  const type = categoryFamily(product.categories, product) || product.technicalInfo.type || 'generic'
  const otherTechnical = type !== 'generic' && product.technicalInfo.type === 'generic' ? product.technicalInfo.general : []
  return (
    <form className="form product-admin-form" onSubmit={submit}>
      <div className="admin-form-intro"><span className="admin-form-eyebrow">Editor de producto</span><h2>{initial.id ? 'Editar producto' : 'Nuevo producto'}</h2><p>Selecciona primero la categoría. Los campos recomendados se adaptan automáticamente y los datos existentes se conservan.</p></div>
      <details className="admin-form-section admin-collapsible" open><summary>1. Información principal <small>Identidad, categoría e imagen</small></summary><div className="admin-collapsible-content">
        <div className="admin-form-grid two"><div><label>Nombre *</label><input value={product.name || ''} onChange={set('name')} required /></div><div><label>Referencia</label><input value={product.ref || ''} onChange={set('ref')} /></div></div>
        <label>Categoría / tipo de producto *</label><div className={`admin-category-picker${categoryOpen ? ' is-open' : ''}`}><button type="button" className="admin-category-current" onClick={() => { setCategoryTop(selectedTop); setCategoryOpen((open) => !open) }} aria-expanded={categoryOpen}><span>{selectedCategory ? getCategoryPathLabel(selectedCategory) : 'Selecciona una categoría...'}</span><b>{categoryOpen ? 'Cerrar' : 'Cambiar'}</b></button>{categoryOpen && <div className="admin-category-options"><select value={activeCategoryTop} onChange={(event) => { const slug = event.target.value; const children = getDescendantSlugs(slug).filter((item) => item !== slug); setCategoryTop(slug); if (!children.length) { chooseCategory(slug); setCategoryOpen(false) } }} required><option value="">Selecciona una familia...</option>{topCats.map((top) => <option key={top.slug} value={top.slug}>{top.name}</option>)}</select>{categoryChildren.length > 0 && <select value={categoryChildren.includes(selectedCategory) ? selectedCategory : ''} onChange={(event) => { if (event.target.value) { chooseCategory(event.target.value); setCategoryOpen(false) } }} required><option value="">Selecciona una subcategoría...</option>{categoryChildren.map((slug) => <option key={slug} value={slug}>{getCategoryPathLabel(slug)}</option>)}</select>}</div>}</div>
        <div className="admin-type-badge">Tipo de ficha: <strong>{productTypeLabels[type]}</strong></div><div className="admin-form-grid two"><div><label>Imagen</label><ImageInput value={product.image} name="image" onChange={(value) => setProduct((p) => ({ ...p, image: value }))} /></div><div><label>Descripción corta</label><textarea value={product.description || ''} onChange={set('description')} /></div></div>
        <details className="admin-inline-details"><summary>Galería de imágenes <small>{product.gallery.length} imágenes</small></summary><div className="admin-inline-content">{product.gallery.map((image, i) => <div className="admin-repeater-row" key={i}><ImageInput value={image.src} name="gallery" index={i} onChange={(value) => updateGallery(i, 'src', value)} /><select value={image.category} onChange={(e) => updateGallery(i, 'category', e.target.value)}><option>Detalle del producto</option><option>Sección o dimensiones</option><option>Dibujo técnico</option><option>Accesorios</option><option>Ejemplo de aplicación</option><option>Imagen principal</option></select><div className="repeater-actions"><button type="button" onClick={() => moveGallery(i, -1)} aria-label="Subir imagen">↑</button><button type="button" onClick={() => moveGallery(i, 1)} aria-label="Bajar imagen">↓</button><button type="button" className="btn btn-danger btn-sm" onClick={() => removeGallery(i)}>Eliminar</button></div></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct((p) => ({ ...p, gallery: [...p.gallery, { src: '', category: 'Detalle del producto' }] }))}>+ Añadir imagen</button></div></details>
      </div></details>
      <details className="admin-form-section admin-collapsible" open><summary>2. Características principales <small>{featureHints[type] || featureHints.generic}</small></summary><div className="admin-collapsible-content"><p className="admin-help">Aquí se muestran las especificaciones que aparecerán destacadas en la ficha pública. La selección se realiza dentro de “Datos técnicos”, sin duplicar campos.</p><div className="admin-highlight-preview">{product.specs.filter((spec) => spec.featured && (spec.label || spec.value)).length > 0 ? product.specs.filter((spec) => spec.featured && (spec.label || spec.value)).map((spec, index) => <span key={`${spec.label}-${index}`}><strong>{spec.label}</strong>{spec.value && `: ${spec.value}${spec.unit ? ` ${spec.unit}` : ''}`}</span>) : <span className="admin-help">Todavía no hay características seleccionadas. Si no marcas ninguna, la ficha pública utiliza las primeras características disponibles según el tipo de producto.</span>}</div></div></details>
      <details className="admin-form-section admin-collapsible"><summary>3. Descripción <small>Contenido largo del producto</small></summary><div className="admin-collapsible-content"><label>Descripción larga <small>Un párrafo por línea</small></label><textarea value={text(product.longDescription)} onChange={set('longDescription')} /><label>Características adicionales antiguas <small>Se conservan para productos ya creados</small></label><textarea value={text(product.features)} onChange={set('features')} /><p className="admin-help">Las características principales se gestionan en el bloque anterior. Este campo mantiene el contenido antiguo que ya aparece en la descripción pública.</p></div></details>
      <ContentSection title="4. Aplicaciones" help="Información que aparecerá en la pestaña “Aplicaciones”." items={product.applications} setItems={(items) => setProduct((p) => ({ ...p, applications: items }))} fields={(item, i, updateItem) => <><input value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)} placeholder="Aplicación" /><textarea value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Descripción opcional" /></>} add={() => addList('applications', { title: '', description: '' })} remove={(i) => removeList('applications', i)} move={(i, d) => moveList('applications', i, d)} reorder={(a, b) => reorderList('applications', a, b)} />
      <ContentSection title="5. Ventajas" help="Información que aparecerá en la pestaña “Ventajas”." items={product.advantages} setItems={(items) => setProduct((p) => ({ ...p, advantages: items }))} fields={(item, i, updateItem) => <><input value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)} placeholder="Ventaja" /><textarea value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Descripción" /></>} add={() => addList('advantages', { title: '', description: '', icon: '' })} remove={(i) => removeList('advantages', i)} move={(i, d) => moveList('advantages', i, d)} reorder={(a, b) => reorderList('advantages', a, b)} />
      <details className="admin-form-section admin-collapsible" open><summary>6. Datos técnicos <small>{productTypeLabels[type]} y referencias</small></summary><div className="admin-collapsible-content"><TechnicalSection product={product} setProduct={setProduct} /><div className="admin-form-subsection"><h3>Especificaciones del producto</h3><p className="admin-help">Estos datos aparecen en “Datos técnicos”. Marca “Mostrar en CARACTERÍSTICAS PRINCIPALES” en los que quieras destacar arriba. Si marcas alguno, solo esos marcados aparecerán arriba.</p><Repeater items={product.specs} onMove={moveSpec} onReorder={(from, to) => reorderList('specs', from, to)} onRemove={(i) => setProduct((p) => ({ ...p, specs: p.specs.filter((_, index) => index !== i) }))}>{(spec, i) => <><input value={spec.label} onChange={(e) => updateSpec(i, 'label', e.target.value)} placeholder="Característica" /><input value={spec.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} placeholder="Valor" /><input value={spec.unit} onChange={(e) => updateSpec(i, 'unit', e.target.value)} placeholder="Unidad (mm, m, V...)" /><select value={spec.technicalKey || ''} onChange={(e) => updateSpec(i, 'technicalKey', e.target.value)} aria-label="Tipo de característica técnica"><option value="">Tipo técnico (automático)</option>{technicalFeatureGroups.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</optgroup>)}</select><label className="check spec-featured-check"><input type="checkbox" checked={Boolean(spec.featured)} onChange={(e) => updateSpec(i, 'featured', e.target.checked)} /> Mostrar en CARACTERÍSTICAS PRINCIPALES</label></>}</Repeater><button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct((p) => ({ ...p, specs: [...p.specs, { label: '', value: '', unit: '', featured: false, technicalKey: '' }] }))}>+ Añadir especificación</button></div><div className="admin-form-subsection"><h3>REFERENCIAS Y VARIANTES</h3><p className="admin-help">Se conservan las referencias antiguas y cada combinación real. No se generan combinaciones automáticamente.</p><VariantEditor items={product.variants} onChange={(variants) => setProduct((p) => ({ ...p, variants }))} /></div>{otherTechnical.length > 0 && <div className="admin-legacy-data"><strong>Datos técnicos anteriores sin clasificar</strong><p>Se muestran aquí para que sigan accesibles. No se eliminan al guardar.</p>{otherTechnical.map((row, i) => <span key={i}>{row.label}: {row.value}</span>)}</div>}<div className="admin-form-grid two admin-technical-media"><div><label>Dibujo técnico</label><ImageInput value={product.technicalDrawing} name="technicalDrawing" onChange={(value) => setProduct((p) => ({ ...p, technicalDrawing: value }))} /></div><label className="check"><input type="checkbox" checked={Boolean(product.showTechnicalDrawing)} onChange={setCheck('showTechnicalDrawing')} /> Mostrar dibujo técnico</label></div><label>Aviso técnico <small>(opcional)</small></label><textarea value={product.technicalNotice || ''} onChange={set('technicalNotice')} /></div></details>
      <details className="admin-form-section admin-collapsible"><summary>7. Accesorios <small>Incluido con el producto y compatibles</small></summary><div className="admin-collapsible-content"><h3>Qué incluye</h3><Repeater items={product.includedItems} onMove={(i, d) => moveList('includedItems', i, d)} onReorder={(a, b) => reorderList('includedItems', a, b)} onRemove={(i) => removeList('includedItems', i)}>{(item, i) => <><input value={item.quantity} onChange={(e) => updateList('includedItems', i, 'quantity', e.target.value)} placeholder="Cantidad" /><input value={item.name} onChange={(e) => updateList('includedItems', i, 'name', e.target.value)} placeholder="Nombre" /><select value={item.status || ''} onChange={(e) => updateList('includedItems', i, 'status', e.target.value)}><option value="">Estado no especificado</option><option value="included">Incluido</option><option value="excluded">No incluido</option></select><input value={item.description} onChange={(e) => updateList('includedItems', i, 'description', e.target.value)} placeholder="Descripción opcional" /></>}</Repeater><button type="button" className="btn btn-ghost btn-sm" onClick={() => addList('includedItems', { quantity: '', name: '', description: '', icon: '', status: 'included' })}>+ Añadir elemento</button><h3>Accesorios compatibles</h3><AccessoryEditor items={product.accessoriesCompatible} products={allProducts.filter((p) => p.id !== initial.id)} onChange={(items) => setProduct((p) => ({ ...p, accessoriesCompatible: items }))} /></div></details>
      <details className="admin-form-section admin-collapsible"><summary>8. Completa la solución <small>Productos relacionados existentes</small></summary><div className="admin-collapsible-content"><p className="admin-help">Selecciona productos existentes para mostrarlos en “Completa la solución”.</p><CompatibleEditor items={product.compatibleProducts} products={allProducts.filter((p) => p.id !== initial.id)} onChange={(items) => setProduct((p) => ({ ...p, compatibleProducts: items }))} /><details className="admin-inline-details"><summary>Productos similares <small>Se conservan por separado</small></summary><div className="admin-inline-content"><select multiple value={product.similarProductIds} onChange={(e) => setProduct((p) => ({ ...p, similarProductIds: [...e.target.selectedOptions].map((option) => option.value) }))}>{allProducts.filter((p) => p.id !== initial.id).map((item) => <option key={item.id} value={item.id}>{item.name}{item.ref ? ` · ${item.ref}` : ''}</option>)}</select></div></details></div></details>
      <details className="admin-form-section admin-collapsible"><summary>Otros datos conservados <small>Documentos, buscador y opciones comerciales</small></summary><div className="admin-collapsible-content"><p className="admin-help">Estos datos no forman parte de los bloques editoriales principales, pero siguen disponibles y no se modifican automáticamente.</p><label>Etiquetas</label><input value={commaText(product.tags)} onChange={set('tags')} /><label className="check"><input type="checkbox" checked={Boolean(product.showTags)} onChange={setCheck('showTags')} /> Mostrar etiquetas públicamente</label><div className="admin-form-grid two"><div><label>Precio (€)</label><input type="number" step="0.01" min="0" value={product.price ?? ''} onChange={set('price')} /></div><div><label>Unidad de venta</label><input value={product.unit || ''} onChange={set('unit')} /></div></div><div className="admin-check-row"><label className="check"><input type="checkbox" checked={Boolean(product.featured)} onChange={setCheck('featured')} /> Destacado</label><label className="check"><input type="checkbox" checked={Boolean(product.outlet)} onChange={setCheck('outlet')} /> Outlet</label></div><DocumentEditor product={product} setProduct={setProduct} documentStorage={documentStorage} setUploading={setUploading} /></div></details>
      {uploading && <p className="admin-help">Procesando archivo...</p>}<div style={{ display: 'flex', gap: 10 }}><button type="submit" className="btn btn-primary">{initial.id ? 'Guardar cambios' : 'Crear producto'}</button><button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button></div>
    </form>
  )
}

function ContentSection({ title, help, items, setItems, fields, add, remove, move, reorder }) {
  const updateItem = (index, field, value) => setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  return <details className="admin-form-section admin-collapsible"><summary>{title} <small>Opcional</small></summary><div className="admin-collapsible-content"><p className="admin-help">{help}</p><Repeater items={items} onMove={move} onReorder={reorder} onRemove={remove}>{(item, i) => fields(item, i, updateItem)}</Repeater><button type="button" className="btn btn-ghost btn-sm" onClick={add}>+ Añadir elemento</button></div></details>
}

function DocumentEditor({ product, setProduct, documentStorage, setUploading }) {
  const update = (index, field, value) => setProduct((p) => ({ ...p, documents: p.documents.map((item, i) => i === index ? { ...item, [field]: value } : item) }))
  const uploadDatasheet = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try { const value = await documentStorage.uploadDocument(file); setProduct((p) => ({ ...p, datasheet: value })) }
    catch (error) { alert(error?.message || 'No se pudo procesar el PDF.') }
    finally { setUploading(false) }
  }
  return <div className="admin-inline-details"><h3>Documentos y ficha técnica PDF</h3><Repeater items={product.documents} onMove={() => {}} onReorder={() => {}} onRemove={(i) => setProduct((p) => ({ ...p, documents: p.documents.filter((_, index) => index !== i) }))}>{(item, i) => <><input value={item.name || ''} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Nombre del documento" /><input value={item.file?.startsWith('data:') ? '' : item.file || ''} onChange={(e) => update(i, 'file', e.target.value)} placeholder="URL o archivo" /><label className="check"><input type="checkbox" checked={item.public !== false} onChange={(e) => update(i, 'public', e.target.checked)} /> Público</label></>}</Repeater><button type="button" className="btn btn-ghost btn-sm" onClick={() => setProduct((p) => ({ ...p, documents: [...p.documents, { name: '', type: 'Otros documentos', file: '', public: true }] }))}>+ Añadir documento</button><div className="admin-pdf-row"><input type="file" accept="application/pdf,.pdf" onChange={uploadDatasheet} />{product.datasheet && <><button type="button" className="btn btn-outline btn-sm" onClick={() => openPdf(product.datasheet)}>Ver PDF</button><button type="button" className="btn btn-danger btn-sm" onClick={() => setProduct((p) => ({ ...p, datasheet: '' }))}>Quitar</button></>}</div></div>
}

function TechnicalSection({ product, setProduct }) {
  const type = categoryFamily(product.categories, product) || product.technicalInfo.type || 'generic'
  return <section className="admin-form-section admin-product-technical-section">
    <h3>Campos técnicos de {productTypeLabels[type] || 'este producto'}</h3>
    <p className="admin-help">Solo se muestran los datos específicos que tienen sentido para este tipo. Los campos vacíos no aparecen en la ficha pública.</p>
    <label>Tipo de ficha técnica<select value={type} onChange={(event) => setProduct((p) => ({ ...p, technicalInfo: { ...p.technicalInfo, type: event.target.value } }))}>{Object.entries(productTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
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

  if (type !== 'led-strip') return <>
    <h3>Datos específicos</h3>
    <p className="admin-help">Añade los valores propios de {productTypeLabels[type] || 'este producto'}.</p>
    {renderRows('general', [['label', 'Característica'], ['value', 'Valor']], 'dato técnico')}
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
    : [['code', 'Referencia de variante'], ['power', 'Potencia (W/m)'], ['temperature', 'Temperatura / CCT'], ['cri', 'CRI'], ['luminousFlux', 'Flujo luminoso (lm)'], ['voltage', 'Tensión'], ['cuttingDistance', 'Distancia de corte'], ['ledsPerMeter', 'LEDs/m'], ['dimensions', 'Dimensiones'], ['angle', 'Ángulo'], ['dimming', 'Regulación'], ['lifetime', 'Vida útil'], ['ip', 'Grado de protección IP']]
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

function VariantEditor({ items, onChange }) {
  const update = (index, field, value) => onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  const updateNested = (variantIndex, field, rowIndex, key, value) => onChange(items.map((item, i) => i === variantIndex ? { ...item, [field]: item[field].map((row, j) => j === rowIndex ? { ...row, [key]: value } : row) } : item))
  const addNested = (variantIndex, field, row) => onChange(items.map((item, i) => i === variantIndex ? { ...item, [field]: [...(item[field] || []), row] } : item))
  const removeNested = (variantIndex, field, rowIndex) => onChange(items.map((item, i) => i === variantIndex ? { ...item, [field]: item[field].filter((_, j) => j !== rowIndex) } : item))
  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  return <div className="variant-editor">{items.map((variant, index) => <article className="admin-variant-card" key={index}><div className="admin-variant-heading"><strong>Variante {index + 1}</strong><div className="repeater-actions"><button type="button" onClick={() => move(index, -1)} aria-label="Subir variante">↑</button><button type="button" onClick={() => move(index, 1)} aria-label="Bajar variante">↓</button><button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(items.filter((_, i) => i !== index))}>Eliminar</button></div></div><label>Referencia de la variante<input value={variant.reference || ''} onChange={(event) => update(index, 'reference', event.target.value)} placeholder="Ej. 28120(2022)71" /></label>{variant.legacyData && <div className="admin-help">Dato antiguo sin clasificar. Asígnalo manualmente a un atributo real antes de eliminarlo.<div className="admin-variant-row"><input value={variant.legacyData.label || ''} onChange={(event) => update(index, 'legacyData', { ...variant.legacyData, label: event.target.value })} placeholder="Etiqueta antigua" /><input value={variant.legacyData.value || ''} onChange={(event) => update(index, 'legacyData', { ...variant.legacyData, value: event.target.value })} placeholder="Valor antiguo" /></div></div>}<h4>Atributos de la combinación</h4>{(variant.attributes || []).map((row, rowIndex) => <div className="admin-variant-row" key={rowIndex}><input value={row.label || ''} onChange={(event) => updateNested(index, 'attributes', rowIndex, 'label', event.target.value)} placeholder="Atributo (Temperatura, Protección...)" /><input value={row.value || ''} onChange={(event) => updateNested(index, 'attributes', rowIndex, 'value', event.target.value)} placeholder="Valor" /><button type="button" className="btn btn-danger btn-sm" onClick={() => removeNested(index, 'attributes', rowIndex)}>Eliminar</button></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => addNested(index, 'attributes', variantAttribute('', ''))}>+ Añadir atributo real</button><h4>Datos que cambian en esta variante</h4>{(variant.specs || []).map((row, rowIndex) => <div className="admin-variant-row" key={rowIndex}><input value={row.label || ''} onChange={(event) => updateNested(index, 'specs', rowIndex, 'label', event.target.value)} placeholder="Dato (Potencia, Flujo, CRI...)" /><input value={row.value || ''} onChange={(event) => updateNested(index, 'specs', rowIndex, 'value', event.target.value)} placeholder="Valor" /><input value={row.unit || ''} onChange={(event) => updateNested(index, 'specs', rowIndex, 'unit', event.target.value)} placeholder="Unidad" /><button type="button" className="btn btn-danger btn-sm" onClick={() => removeNested(index, 'specs', rowIndex)}>Eliminar</button></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => addNested(index, 'specs', variantSpec('', '', ''))}>+ Añadir dato variable</button></article>)}<button type="button" className="btn btn-ghost" onClick={() => onChange([...items, { reference: '', attributes: [], specs: [] }])}>+ Añadir variante</button></div>
}

function AccessoryEditor({ items, products, onChange }) {
  const update = (index, field, value) => onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  return <div className="accessory-editor">{items.map((item, index) => <div className="admin-repeater-row accessory-editor-row" key={index}><div className="admin-repeater-fields"><input value={item.name || ''} onChange={(event) => update(index, 'name', event.target.value)} placeholder="Nombre del accesorio" /><input value={item.reference || item.ref || item.code || item.sku || ''} onChange={(event) => update(index, 'reference', event.target.value)} placeholder="Referencia / código" /><input value={item.description || ''} onChange={(event) => update(index, 'description', event.target.value)} placeholder="Descripción breve opcional" /><ImageInputForAccessory value={item.image} onChange={(value) => update(index, 'image', value)} /><select value={item.linkedProductId || ''} onChange={(event) => update(index, 'linkedProductId', event.target.value)}><option value="">Sin producto vinculado</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}{product.ref ? ` · ${product.ref}` : ''}</option>)}</select></div><div className="repeater-actions"><button type="button" onClick={() => move(index, -1)} aria-label="Subir accesorio">↑</button><button type="button" onClick={() => move(index, 1)} aria-label="Bajar accesorio">↓</button><button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(items.filter((_, i) => i !== index))}>Eliminar</button></div></div>)}<button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...items, { name: '', reference: '', image: '', description: '', linkedProductId: '' }])}>+ Añadir accesorio</button></div>
}

function ImageInputForAccessory({ value, onChange }) {
  return <div className="admin-media-field"><input value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="Imagen opcional (URL)" />{value && <img src={value} alt="Vista previa" />}</div>
}

function CompatibleEditor({ items, products, onChange }) {
  const [query, setQuery] = useState('')
  const functions = ['Fuente de luz', 'Perfil / integración', 'Alimentación', 'Control', 'Instalación', 'Montaje', 'Accesorio', 'Otro']
  const update = (index, field, value) => onChange(items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  return <>
    <label>Buscar producto<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre o referencia" /></label>
    {items.map((item, i) => <div className="admin-repeater-row solution-relation-row" key={`${item.productId}-${i}`}><select value={item.productId || ''} onChange={(e) => update(i, 'productId', e.target.value)}><option value="">Selecciona un producto...</option>{products.filter((p) => !query || `${p.name} ${p.ref || ''}`.toLowerCase().includes(query.toLowerCase())).map((p) => <option key={p.id} value={p.id}>{p.name}{p.ref ? ` · ${p.ref}` : ''}</option>)}</select><select value={item.function || ''} onChange={(e) => update(i, 'function', e.target.value)}><option value="">Función...</option>{functions.map((option) => <option key={option}>{option}</option>)}</select><input value={item.reason || ''} onChange={(e) => update(i, 'reason', e.target.value)} placeholder="Nota opcional" /><label className="check"><input type="checkbox" checked={Boolean(item.recommended)} onChange={(e) => update(i, 'recommended', e.target.checked)} /> Recomendado</label><button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(items.filter((_, index) => index !== i))}>Eliminar</button></div>)}
     <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange([...items, { productId: '', function: '', reason: '', recommended: false }])}>+ Añadir producto</button>
  </>
}
