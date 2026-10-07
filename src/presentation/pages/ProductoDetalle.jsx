import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'
import Carousel from '../components/Carousel'
import Seo from '../components/Seo'
import { SITE, canonicalFor, breadcrumbJsonLd } from '../../domain/site/site'
import { openPdfDataUrl } from '../utils/pdf'
import { publicUrl } from '../utils/assets'
import { useSiteSettings } from '../../application/catalog/SiteSettingsContext'
import { resolveTechnicalKey } from '../../domain/catalog/technicalFeatures'

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:')
const itemText = (item) => typeof item === 'string' || typeof item === 'number' ? String(item).trim() : item && typeof item === 'object' ? String(item.text ?? item.title ?? item.name ?? item.label ?? item.application ?? '').trim() : ''
const itemDescription = (item) => item && typeof item === 'object' ? String(item.description ?? item.detail ?? item.body ?? '').trim() : ''
const list = (value) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map(itemText).filter(Boolean)
const csv = (value) => (Array.isArray(value) ? value : String(value || '').split(',')).map(itemText).filter(Boolean)
const contentItems = (value, withIcon = false) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map((item) => ({ title: itemText(item), description: itemDescription(item), icon: withIcon && item && typeof item === 'object' ? item.icon || '' : '', image: item && typeof item === 'object' ? item.image || '' : '', spaceType: item && typeof item === 'object' ? item.spaceType || '' : '', inspiration: Boolean(item && typeof item === 'object' && item.inspiration) })).filter((item) => item.title || item.description || item.icon || item.image)
const normalizeUnit = (spec) => ({ ...spec, label: String(spec.label || '').trim(), value: String(spec.value || '').trim(), unit: String(spec.unit || '').trim(), technicalKey: spec.technicalKey || spec.featureType || '' })
const imageSrc = (image) => publicUrl(typeof image === 'string' ? image : image?.src || image?.image || '')
const fileUrl = (value) => (isDataUrl(value) ? value : publicUrl(value))
const accessoryReference = (item = {}) => {
  const direct = item.reference || item.ref || item.code || item.sku || item.productCode
  if (direct) return String(direct).trim()
  const text = `${item.name || item.title || ''} ${item.description || ''} ${item.quantity || ''}`
  return text.match(/(?:ref(?:erencia)?|c[oó]digo)\.?\s*[:#-]?\s*([A-Z0-9()_-]+)/i)?.[1] || ''
}
const legacyAccessory = (item = {}) => {
  const rawName = String(item.name || item.title || '').trim()
  const text = `${rawName} ${item.description || ''} ${item.quantity || ''}`
  const reference = accessoryReference(item) || (text.match(/ref\.?\s*([A-Z0-9()_-]+)/i)?.[1] || '')
  return { name: rawName.replace(/\s*[—-]?\s*no\s+incluid[oa]\s*$/i, '').trim(), reference, image: item.image || '', description: item.description || '', linkedProductId: item.linkedProductId || '' }
}
const technicalFamily = (product, trail = []) => {
  const categoryText = [product.category, ...(product.categories || []), ...trail.flatMap((category) => [category.slug, category.name])].filter(Boolean).join(' ').toLowerCase()
  const technicalInfo = product.technicalInfo || {}
  if (categoryText.includes('perfil') || (technicalInfo.profileFinishes || []).length > 0) return 'profile'
  if ((categoryText.includes('tira') && !categoryText.includes('neon') && !categoryText.includes('neón')) || (technicalInfo.ledBasic || []).length > 0 || (technicalInfo.ledDimensions || []).length > 0 || (technicalInfo.codes || []).some((code) => code.temperature || code.ip || code.power)) return 'led-strip'
  return technicalInfo.type || ''
}
const technicalRows = (rows) => (Array.isArray(rows) ? rows : []).filter((row) => row && (row.label || row.value))
const technicalCodes = (rows) => (Array.isArray(rows) ? rows : []).filter((row) => row && Object.values(row).some(Boolean))
const clean = (value) => String(value || '').trim()
const labelMatches = (label, terms) => terms.some((term) => clean(label).toLowerCase().includes(term))
const familyFromText = (text) => {
  const value = clean(text).toLowerCase()
  if (value.includes('perfil')) return 'profile'
  if (value.includes('neón') || value.includes('neon')) return 'neon-flex'
  if (value.includes('tira')) return value.includes('220') ? 'led-strip-220' : 'led-strip-24'
  if (value.includes('proyector')) return 'projector'
  if (value.includes('panel')) return 'panel'
  if (value.includes('downlight') || value.includes('aplique')) return 'downlight'
  if (value.includes('driver') || value.includes('controlador') || value.includes('fuente')) return 'driver'
  if (value.includes('estanca')) return 'watertight'
  return 'generic'
}
const highlightPriority = {
  'led-strip-24': [['temperatura', 'cct'], ['dimensión', 'ancho'], ['ángulo', 'apertura', 'optics']],
  'led-strip-220': [['temperatura', 'cct'], ['dimensión', 'ancho'], ['ángulo', 'apertura', 'optics']],
  'neon-flex': [['potencia', 'power'], ['dimensión', 'sección'], ['temperatura', 'cct'], ['ip', 'protección']],
  profile: [['dimensión'], ['longitud'], ['material'], ['montaje'], ['difusor'], ['acabado']],
  projector: [['potencia', 'power'], ['flujo', 'luminous', 'lm'], ['óptica', 'optics', 'angulo', 'ángulo'], ['cct', 'temperatura']],
  panel: [['potencia', 'power', 'tensión', 'volt'], ['dimensión'], ['cri'], ['ángulo', 'apertura']],
  downlight: [['potencia', 'power'], ['flujo', 'luminous', 'lm'], ['ugr'], ['cct', 'temperatura']],
  driver: [['potencia', 'power'], ['tensión', 'volt'], ['regul'], ['ip', 'protección']],
  watertight: [['potencia', 'power'], ['flujo', 'luminous', 'lm'], ['ip'], ['ik'], ['longitud'], ['cct', 'temperatura']],
}
const codeValue = (row, key) => clean(row?.[key])
const variantReference = (variant) => clean(variant?.code || variant?.ref || variant?.reference)
const variantFieldRows = (variant) => {
  const source = variant?.attributes || variant?.options || variant?.specifications || {}
  return Object.entries(source).map(([label, value]) => ({ label: clean(label), value: clean(value), unit: '', technicalKey: resolveTechnicalKey({ label }) })).filter((row) => row.label && row.value)
}
const meaningfulVariantLabel = (label) => clean(label) && !/^opci[oó]n\s*\d+$/i.test(clean(label))
const conceptKey = (label) => {
  const value = clean(label).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (value.includes('potencia') || value.includes('power')) return 'potencia'
  if (value.includes('flujo') || value.includes('luminous') || value.includes('lm')) return 'flujo'
  if (value.includes('tension') || value.includes('volt')) return 'tension'
  if (value === 'cri' || value.includes('cri')) return 'cri'
  if (value === 'ip' || value.includes('proteccion')) return 'ip'
  if (value.includes('temperatura') || value.includes('cct')) return 'temperatura'
  return value
}
const uniqueRows = (rows) => rows.filter((row, index, values) => values.findIndex((item) => conceptKey(item.label) === conceptKey(row.label)) === index)
const expandHighlightRows = (rows) => rows.flatMap((row) => {
  const key = row.technicalKey || resolveTechnicalKey(row)
  const value = clean(row.value).toLowerCase()
  if (key === 'mounting' && value.includes('superficie') && value.includes('colgant')) {
    return [{ ...row, label: 'Superficie', technicalKey: 'mountingSurface', value: '' }, { ...row, label: 'Colgante', technicalKey: 'mountingSuspended', value: '' }]
  }
  if (key === 'diffuser' && /^\d+(?:[,.]\d+)?$/.test(value)) return []
  return [{ ...row, technicalKey: key }]
})
const highlightValue = (item) => {
  if (item.technicalKey === 'mountingSurface' || item.technicalKey === 'mountingSuspended') return item.label
  const raw = `${clean(item.value)}${item.unit ? ` ${clean(item.unit)}` : ''}`.replace(/\s+/g, ' ').trim()
  if (item.technicalKey === 'dimensions') {
    const match = raw.match(/([\d,.]+)\s*(?:mm)?\s*[x×]\s*([\d,.]+)\s*(?:mm)?/i)
    if (match) return `${match[1]} × ${match[2]} mm`
  }
  return raw
}
const isOperatingTemperature = (row) => {
  const label = clean(row.label).toLowerCase()
  const value = clean(row.value).toLowerCase()
  return /(funcionamiento|ambiente|tc\s*(?:máx|max)|temperatura de trabajo)/i.test(label) || /(?:°|º)\s*c\b/i.test(value)
}
const includedQuantity = (value) => String(value || '').match(/\d+(?:[,.]\d+)?/)?.[0] || String(value || '').trim()
const includedPresentation = (item) => {
  const rawName = clean(item.name)
  const embeddedQuantity = rawName.match(/^(.*?)(\d+(?:[,.]\d+)?)\s*unidades?\s*$/i)
  const quantity = includedQuantity(item.quantity) || embeddedQuantity?.[2] || ''
  const name = (embeddedQuantity?.[1] || rawName).trim()
  return { quantity, name }
}
const accessoryDisplayName = (name) => {
  const value = clean(name)
  if (/suspensi[oó]n/i.test(value) && /1\s*m/i.test(value)) return 'SUSPENSIÓN 1 M'
  if (/suspensi[oó]n/i.test(value) && /2\s*m/i.test(value)) return 'SUSPENSIÓN 2 M'
  if (/fijaci[oó]n/i.test(value) && /perfil/i.test(value)) return 'FIJACIÓN PARA PERFILES'
  return value
}
const asFeatureRows = (product, info, family) => {
  const rows = (Array.isArray(product.specs) ? product.specs : []).map(normalizeUnit).filter((row) => row.label || row.value)
  const additional = [...(info.general || []), ...(info.ledBasic || []), ...(info.ledDimensions || []), ...(info.profileDimensions || []), ...(info.protections || []).map((value) => ({ label: 'Protección', value }))].map(normalizeUnit).filter((row) => row.label || row.value)
  const codes = technicalCodes(info.codes)
  const codeRows = codes.flatMap((code) => [
    ['Potencia', 'power'], ['Flujo luminoso', 'luminousFlux'], ['Tensión', 'voltage'], ['CRI', 'cri'], ['IP', 'ip'], ['Temperatura de color', 'temperature'], ['Distancia de corte', 'cuttingDistance'], ['Dimensiones', 'dimensions'], ['Ancho', 'width'], ['Longitud', 'length'], ['Material', 'material'], ['Montaje', 'mounting'], ['Difusor', 'diffuser'], ['Acabado', 'finish'], ['CCT', 'cct'], ['Óptica / ángulo', 'optics'], ['Regulación', 'dimming'], ['UGR', 'ugr'], ['IK', 'ik'],
  ].map(([label, key]) => ({ label, value: codeValue(code, key), unit: '', technicalKey: key })).filter((row) => row.value))
  const all = expandHighlightRows([...codeRows, ...rows, ...additional].map((row) => ({ ...row, technicalKey: resolveTechnicalKey(row) }))).filter((row) => !isOperatingTemperature(row))
  const aggregated = all.reduce((result, row) => {
    const key = conceptKey(row.label)
    const current = result.find((item) => item.key === key)
    if (!current) result.push({ key, row: { ...row } })
    else if (clean(row.value) && !clean(current.row.value).split(' / ').includes(clean(row.value))) current.row.value = [current.row.value, row.value].filter(Boolean).join(' / ')
    return result
  }, []).map((item) => item.row)
  const priority = highlightPriority[family] || []
  const manualKeys = rows.filter((row) => row.featured).map((row) => conceptKey(row.label))
  const source = manualKeys.length ? aggregated.filter((row) => manualKeys.includes(conceptKey(row.label))) : aggregated
  const ordered = priority.map((terms) => source.find((row) => labelMatches(row.label, terms))).filter(Boolean).filter((row, index, values) => values.findIndex((item) => conceptKey(item.label) === conceptKey(row.label)) === index)
  const isLedStrip = family === 'led-strip-24' || family === 'led-strip-220'
  return (isLedStrip ? ordered : [...ordered, ...source.filter((row) => !ordered.some((item) => conceptKey(item.label) === conceptKey(row.label)))])
    .slice(0, 4)
}

export default function ProductoDetalle() {
  const { id } = useParams()
  const { getProduct, products, hydrated } = useProducts()
  const { getCategory, getBreadcrumb } = useCategories()
  const { settings } = useSiteSettings()
  const product = getProduct(id)
  const [activeTab, setActiveTab] = useState('descripcion')
  const [zoomImage, setZoomImage] = useState(null)
  const [compareIds, setCompareIds] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [selectedVariantCode, setSelectedVariantCode] = useState('')
  const [selectedVariant, setSelectedVariant] = useState(null)

  if (!hydrated) return <div className="container section"><div className="empty-state"><h3>Cargando producto...</h3></div></div>
  if (!product) return <Navigate to="/productos" replace />

  const category = getCategory(product.category)
  const categoryTrail = getBreadcrumb(product.category) || []
  const gallery = [...new Map([product.image, ...(Array.isArray(product.gallery) ? product.gallery : csv(product.gallery))].map((image) => [imageSrc(image), imageSrc(image)])).values()].filter(Boolean)
  const apps = contentItems(product.applications)
  const benefits = contentItems(product.advantages, true)
  const longDescription = list(product.longDescription)
  const features = list(product.features)
  const specs = (Array.isArray(product.specs) ? product.specs : []).map(normalizeUnit).filter((s) => s.label || s.value)
  const included = (Array.isArray(product.includedItems) ? product.includedItems : []).filter((item) => {
    const text = `${item?.name || ''} ${item?.description || ''} ${item?.quantity || ''}`.toLowerCase()
    return item && (item.name || item.quantity) && item.status !== 'excluded' && !/no\s+incluid[oa]/i.test(text)
  })
  const configuredAccessories = Array.isArray(product.accessoriesCompatible) ? product.accessoriesCompatible : []
  const legacyAccessories = (Array.isArray(product.includedItems) ? product.includedItems : []).filter((item) => item?.status === 'excluded' || /no\s+incluid[oa]/i.test(`${item?.name || ''} ${item?.description || ''} ${item?.quantity || ''}`)).map(legacyAccessory)
  const accessories = [...configuredAccessories, ...legacyAccessories].map((item) => ({ ...item, reference: accessoryReference(item), product: products.find((candidate) => candidate.id === item.linkedProductId) })).filter((item, index, values) => (item.name || item.reference) && values.findIndex((other) => `${other.name}|${other.reference}` === `${item.name}|${item.reference}`) === index)
  const example = product.applicationExample || {}
  const legacyExampleIsIntegrated = example.image && apps.some((item) => item.image === example.image)
  const compatible = [...new Map((Array.isArray(product.compatibleProducts) ? product.compatibleProducts : []).map((relation) => [relation.productId, relation])).values()].map((relation) => ({ ...relation, product: products.find((item) => item.id === relation.productId) })).filter((relation) => relation.product)
  const compatibleIds = new Set(compatible.map((relation) => relation.productId))
  const similar = [...new Set(Array.isArray(product.similarProductIds) ? product.similarProductIds : [])].filter((similarId) => !compatibleIds.has(similarId)).map((similarId) => products.find((item) => item.id === similarId)).filter(Boolean)
  const documents = (Array.isArray(product.documents) ? product.documents : []).filter((document) => document.public !== false && document.file && document.name)
  const family = categoryTrail.length > 1 ? `${categoryTrail[categoryTrail.length - 2].name} · ${category?.name || ''}` : category?.name
  const technicalInfo = product.technicalInfo || {}
  const technicalType = technicalFamily(product, categoryTrail)
  const productFamily = familyFromText([family, product.name, product.category, ...(product.categories || [])].join(' '))
  const highlights = asFeatureRows(product, technicalInfo, productFamily)
  const mainHighlights = highlights
  const hasTechnicalInfo = technicalType === 'led-strip'
    ? technicalRows(technicalInfo.ledBasic).length > 0 || technicalRows(technicalInfo.ledDimensions).length > 0 || (technicalInfo.temperatures || []).some(Boolean) || (technicalInfo.protections || []).some(Boolean) || technicalCodes(technicalInfo.codes).length > 0
    : technicalType === 'profile'
      ? (technicalInfo.profileFinishes || []).some((finish) => finish?.name || finish?.color) || technicalRows(technicalInfo.profileDimensions).length > 0 || technicalCodes(technicalInfo.codes).length > 0
      : technicalRows(technicalInfo.general).length > 0
  const hasDescription = Boolean(longDescription.length || features.length || product.description)
  const hasTechnical = specs.length > 0 || hasTechnicalInfo || (product.showTechnicalDrawing && product.technicalDrawing) || product.technicalNotice
  const hasAccessories = included.length > 0 || accessories.length > 0
  const tabList = [{ id: 'descripcion', label: 'Descripción', show: hasDescription }, { id: 'aplicaciones', label: 'Aplicaciones', show: apps.length > 0 }, { id: 'ventajas', label: 'Ventajas', show: benefits.length > 0 }, { id: 'datos', label: 'Datos técnicos', show: hasTechnical }, { id: 'accesorios', label: 'Accesorios', show: hasAccessories }, { id: 'descargas', label: 'Descargas', show: documents.length > 0 }].filter((tab) => tab.show)
  const currentTab = tabList.some((tab) => tab.id === activeTab) ? activeTab : tabList[0]?.id
  const handleVariantChange = (variant) => {
    setSelectedVariant(variant || null)
    setSelectedVariantCode(variantReference(variant))
  }

  const toggleCompare = (similarId) => setCompareIds((ids) => ids.includes(similarId) ? ids.filter((item) => item !== similarId) : ids.length < 3 ? [...ids, similarId] : ids)
  const comparisonProducts = similar.filter((item) => compareIds.includes(item.id))
  const sharedSpecs = [...new Set(comparisonProducts.flatMap((item) => (item.specs || []).map((spec) => spec.label).filter(Boolean)))].map((label) => ({ label, values: comparisonProducts.map((item) => (item.specs || []).find((spec) => spec.label === label)) })).filter((row) => row.values.filter((value) => value?.value).length >= 2)

  const panel = (tab) => <div className={`product-tab-panel${currentTab === tab.id ? ' is-open' : ''}`}>
    {tab.id === 'descripcion' && <div className="description-copy">{product.description && <p className="description-lead">{product.description}</p>}{longDescription.map((paragraph, i) => <RichText key={i} text={paragraph} as="p" />)}{features.length > 0 && <div className="desc-block"><h2>Características principales</h2><ul className="feature-grid">{features.map((feature, i) => <li key={i}><RichText text={feature} /></li>)}</ul></div>}</div>}
     {tab.id === 'aplicaciones' && <div className="content-card-grid">{apps.map((item, i) => <article className="content-card" key={i}><span className="content-card-number">{String(i + 1).padStart(2, '0')}</span>{item.image && <img className="content-card-image" src={item.image} alt="" /> }<div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}{item.spaceType && <small>{item.spaceType}</small>}{item.inspiration && <small>Imagen de inspiración</small>}</div></article>)}</div>}
    {tab.id === 'ventajas' && <div className="content-card-grid">{benefits.map((item, i) => <article className="content-card benefit-card" key={i}>{item.icon ? <img src={item.icon} alt="" /> : <span className="benefit-check">✓</span>}<div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div>}
      {tab.id === 'datos' && <div className="technical-layout"><div>{specs.length > 0 && <div className="spec-table-wrap"><table className="spec-table"><tbody>{specs.map((spec, i) => <tr key={i}><th>{spec.label}</th><td>{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</td></tr>)}</tbody></table></div>}{product.technicalNotice && <aside className="technical-notice">{product.technicalNotice}</aside>}{hasTechnicalInfo && <ProductTechnicalInfo type={technicalType} value={technicalInfo} selectedVariant={selectedVariant} />}</div>{product.showTechnicalDrawing && product.technicalDrawing && <figure className="technical-drawing"><img src={product.technicalDrawing} alt={`Dibujo técnico de ${product.name}`} onClick={() => setZoomImage(product.technicalDrawing)} /><figcaption>Ampliar dibujo técnico</figcaption></figure>}</div>}
     {tab.id === 'accesorios' && <div className="product-accessories-tab">{included.length > 0 && <section className="product-accessories-tab-included"><h3>Incluido con el producto</h3><div>{included.map((item, index) => { const presentation = includedPresentation(item); return <span key={index}>{presentation.quantity} × {presentation.name}</span> })}</div></section>}{accessories.length > 0 && <section className="product-accessories-tab-compatible"><h3>Accesorios compatibles</h3><p>Elementos disponibles por separado para completar la instalación.</p><div>{accessories.map((item, index) => { const reference = item.reference || item.product?.ref; return <article key={`${item.name}-${reference || ''}-${index}`}><h4>{accessoryDisplayName(item.name)}</h4>{reference && <span>Ref. {reference}</span>}</article> })}</div></section>}</div>}
     {tab.id === 'descargas' && <div className="documents-list">{documents.map((document, i) => <a className="document-item" key={i} href={isDataUrl(document.file) ? undefined : fileUrl(document.file)} download={!isDataUrl(document.file) ? undefined : document.name} onClick={isDataUrl(document.file) ? (event) => { event.preventDefault(); openPdfDataUrl(document.file) } : undefined}><span className="document-icon">↓</span><span><strong>{document.name}</strong><small>{document.type || 'Documento'}</small></span><b>Descargar</b></a>)}</div>}
  </div>

  return <>
    <Seo
      title={`${product.name}${product.ref ? ` ${product.ref}` : ''} — Producto LED`}
      description={product.description || `Ficha técnica de ${product.name}${product.ref ? ` (${product.ref})` : ''}: especificaciones, aplicaciones y soluciones compatibles Boralba Lighting.`}
      path={`/producto/${product.id}`}
      image={product.image ? `${SITE.url}/${String(product.image).replace(/^\//, '')}` : undefined}
      jsonLd={[
        breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Productos', url: canonicalFor('/productos') },
          { name: product.name, url: canonicalFor(`/producto/${product.id}`) },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          sku: product.ref || undefined,
          description: product.description || undefined,
          image: product.image ? `${SITE.url}/${String(product.image).replace(/^\//, '')}` : undefined,
          brand: { '@type': 'Brand', name: 'Boralba Lighting' },
        },
      ]}
    />
    <main className="product-page"><div className="container product-container">
      <nav className="breadcrumb product-breadcrumb" aria-label="Migas de pan"><Link to="/">Inicio</Link><span>/</span><Link to="/productos">Productos</Link>{categoryTrail.map((cat) => <span key={cat.slug}><span>/</span>{cat.slug === product.category ? <span>{cat.name}</span> : <Link to={`/categoria/${cat.slug}`}>{cat.name}</Link>}</span>)}</nav>
        <div className="product-detail"><div className="product-gallery"><Carousel images={gallery} alt={product.name} onImageClick={setZoomImage} /></div><div className="product-info"><p className="product-kicker">{family || 'Producto'}</p><h1>{product.name}</h1>{(variantReference(selectedVariant) || product.ref) && <p className="ref product-ref">Ref. {variantReference(selectedVariant) || product.ref}</p>}{product.description && <p className="product-short-description">{product.description}</p>}{mainHighlights.length > 0 && <section className="product-highlights product-highlights-band"><h2>Características principales</h2><div className="product-highlights-list">{mainHighlights.map((item, index) => <div className="product-highlight-band-item" key={`${item.label}-${index}`}><strong>{highlightValue(item)}</strong><span>{item.technicalKey === 'mountingSurface' || item.technicalKey === 'mountingSuspended' ? 'Montaje' : item.label}</span></div>)}</div></section>}{technicalType !== 'led-strip' && <ProductOptions product={product} type={technicalType} selectedVariant={selectedVariant} onVariantChange={handleVariantChange} />}<div className="product-actions"><Link to={`/contacto?productos=${selectedVariantCode || product.ref || ''}`} className="btn btn-primary">Solicitar presupuesto</Link>{product.datasheet && <a href={isDataUrl(product.datasheet) ? undefined : fileUrl(product.datasheet)} onClick={isDataUrl(product.datasheet) ? (e) => { e.preventDefault(); openPdfDataUrl(product.datasheet) } : undefined} target={isDataUrl(product.datasheet) ? undefined : '_blank'} rel="noreferrer" className="datasheet-link">↓ Descargar ficha técnica</a>}</div></div></div>
       <div className="product-lower-row">
          <div className="product-below-hero" />
         {tabList.length > 0 && <section className="product-description"><div className="tabs">{tabList.map((tab) => <button key={tab.id} className={`tab${currentTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div><div className="desktop-tab-content">{panel({ ...tabList.find((tab) => tab.id === currentTab), id: currentTab })}</div><div className="mobile-accordion">{tabList.map((tab) => <div className={`accordion-item${currentTab === tab.id ? ' is-open' : ''}`} key={tab.id}><button className="accordion-trigger" onClick={() => setActiveTab(currentTab === tab.id ? '' : tab.id)} aria-expanded={currentTab === tab.id}>{tab.label}<span>{currentTab === tab.id ? '−' : '+'}</span></button>{currentTab === tab.id && panel(tab)}</div>)}</div></section>}
       </div>
       {example.image && !legacyExampleIsIntegrated && <section className="application-example product-section"><img src={example.image} alt={example.title || 'Ejemplo de aplicación'} onClick={() => setZoomImage(example.image)} /><div><p className="product-kicker">Ejemplo de aplicación</p><h2>{example.title}</h2>{example.description && <p>{example.description}</p>}{example.spaceType && <span className="space-label">{example.spaceType}</span>}{example.inspiration && <small>Imagen de inspiración</small>}</div></section>}
         {compatible.length > 0 && <section className="product-section solution-section"><SectionHeading title="Completa la solución" text="Productos compatibles para configurar la instalación." /><div className="solution-list">{compatible.map(({ product: item, function: relationFunction, reason, recommended }, index) => <article className="solution-item" key={item.id}><span className="solution-number">{String(index + 1).padStart(2, '0')}</span><div className="solution-function">{relationFunction || 'Producto compatible'}</div><img src={imageSrc(item.image) || 'images/placeholder.svg'} alt={item.name} /><div className="solution-copy"><h3>{item.name}</h3>{item.ref && <p className="ref">Ref. {item.ref}</p>}{reason && <p>{reason}</p>}{recommended && <small>Recomendado</small>}<Link to={`/producto/${item.id}`}>Ver producto <span aria-hidden="true">→</span></Link></div></article>)}</div></section>}
      {similar.length > 0 && <section className="product-section related-products"><SectionHeading title="También te puede interesar" /><div className="grid grid-4">{similar.map((item) => <article className="similar-card" key={item.id}><Link to={`/producto/${item.id}`}><div className="card-img"><img src={item.image || 'images/placeholder.svg'} alt={item.name} loading="lazy" /></div><div className="card-body"><h3>{item.name}</h3><div className="ref">{item.ref}</div></div></Link><label className="check"><input type="checkbox" checked={compareIds.includes(item.id)} onChange={() => toggleCompare(item.id)} /> Comparar</label></article>)}</div>{similar.length >= 2 && <button className="btn btn-outline compare-button" disabled={compareIds.length < 2} onClick={() => setShowComparison(true)}>Comparar seleccionados</button>}{showComparison && comparisonProducts.length >= 2 && <div className="comparison-wrap"><button className="comparison-close" onClick={() => setShowComparison(false)}>Cerrar</button><div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>Especificación</th>{comparisonProducts.map((item) => <th key={item.id}>{item.name}</th>)}</tr></thead><tbody>{sharedSpecs.map((row) => <tr key={row.label}><th>{row.label}</th>{row.values.map((value, i) => <td key={i}>{value?.value ? `${value.value}${value.unit ? ` ${value.unit}` : ''}` : '—'}</td>)}</tr>)}</tbody></table></div></div>}</section>}
       <section className="technical-advice"><div><h2>¿Necesitas ayuda para configurar tu instalación?</h2><p>Indícanos los metros, el tipo de espacio y el efecto de luz que buscas. Nuestro equipo técnico te ayudará a seleccionar el perfil, la tira LED y el sistema de alimentación adecuados.</p></div><div className="advice-contact"><Link to={`/contacto?productos=${product.ref || ''}`} className="btn btn-primary">Solicitar asesoramiento</Link><a href={`tel:${settings.phone}`}>{settings.phone}</a><a href={`mailto:${settings.email}`}>{settings.email}</a>{settings.hours && <span>{settings.hours}</span>}</div></section>
    </div></main>{zoomImage && <div className="image-lightbox" role="dialog" aria-label="Imagen ampliada" onClick={() => setZoomImage(null)}><button type="button" aria-label="Cerrar">×</button><img src={zoomImage} alt={`Imagen ampliada de ${product.name}`} /></div>}
  </>
}

function SectionHeading({ title, text }) { return <div className="section-head left"><h2>{title}</h2>{text && <p>{text}</p>}</div> }
function RichText({ text, as }) { const Tag = as || 'span'; return <Tag>{String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</Tag> }

function TechnicalRows({ title, rows, className = '' }) {
  const visible = technicalRows(rows)
  if (!visible.length) return null
  return <section className={`product-technical-section ${className}`}><h3>{title}</h3><dl className="product-technical-list">{visible.map((row, index) => <div key={index}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>
}

function ProductOptions({ product, type, selectedVariant, onVariantChange }) {
  const info = product.technicalInfo || {}
  const codes = technicalCodes(info.codes)
  const technicalGroups = type === 'profile'
    ? [{ label: 'Acabado', key: 'finish', values: (info.profileFinishes || []).map((item) => item.name).filter(Boolean) }, { label: 'Dimensiones', key: 'dimensions', values: (info.profileDimensions || []).map((item) => [item.label, item.value].filter(Boolean).join(' · ')).filter(Boolean) }]
    : type === 'led-strip'
      ? [{ label: 'Temperatura de color', key: 'temperature', values: (info.temperatures || []).concat(codes.map((row) => row.temperature)).filter(Boolean) }, { label: 'Protección', key: 'ip', values: (info.protections || []).concat(codes.map((row) => row.ip)).filter(Boolean) }]
      : []
  const legacy = (Array.isArray(product.variants) ? product.variants : []).filter((variant) => variant && typeof variant === 'object')
  const legacyGroups = [...new Map(legacy.flatMap((variant) => {
    const entries = variantFieldRows(variant)
    const simple = entries.length ? entries : [{ label: variant.label, value: variant.value || variant.option || variant.title, unit: '' }]
    return simple.filter((row) => meaningfulVariantLabel(row.label) && row.value).map((row) => [`${row.label.toLowerCase()}::${row.value}`, row])
  })).values()].reduce((groups, row) => {
    const group = groups.find((item) => item.label.toLowerCase() === row.label.toLowerCase())
    if (group) group.values.push(row.value)
    else groups.push({ label: row.label, key: `legacy-${row.label}`, values: [row.value] })
    return groups
  }, [])
  const groups = [...technicalGroups, ...legacyGroups.map((group) => ({ ...group, values: group.values.filter((value) => !technicalGroups.some((technical) => technical.values.some((item) => clean(item).toLowerCase() === clean(value).toLowerCase()))) }))].filter((group) => group.values.length > 1)
  const [selected, setSelected] = useState(() => Object.fromEntries(technicalGroups.map((group) => [group.key, selectedVariant?.[group.key] || ''])))
  const available = (group, value) => {
    if (!codes.length) return true
    const constraints = Object.entries(selected).filter(([key, option]) => key !== group.key && option)
    return codes.some((row) => constraints.every(([key, option]) => row[key] === option) && row[group.key] === value)
  }
  const select = (key, value) => {
    const next = { ...selected, [key]: selected[key] === value ? '' : value }
    const matching = codes.filter((row) => Object.entries(next).every(([field, option]) => !option || row[field] === option))
    if (!matching.length) return
    setSelected(next)
    onVariantChange(matching.length === 1 && Object.values(next).some(Boolean) ? matching[0] : null)
  }
  if (!groups.length) return null
  return <section className="product-options"><h2>Opciones disponibles</h2>{groups.map((group) => <div className="option-group" key={group.key}><span>{group.label}</span><div>{[...new Set(group.values)].map((value) => <button type="button" className={selected[group.key] === value ? 'is-active' : ''} key={value} disabled={!available(group, value)} onClick={() => select(group.key, value)}>{value}</button>)}</div></div>)}</section>
}

function ProductTechnicalInfo({ type, value, selectedVariant }) {
  const codes = technicalCodes(value.codes)
  const [selectedFinish, setSelectedFinish] = useState('')
  const [selectedDimension, setSelectedDimension] = useState('')
  const selectedRows = variantFieldRows(selectedVariant)
  const selectedCodeRows = selectedVariant ? [['Potencia', 'power'], ['Flujo luminoso', 'luminousFlux'], ['Tensión', 'voltage'], ['CRI', 'cri'], ['IP', 'ip'], ['Temperatura', 'temperature'], ['Regulación', 'dimming']].map(([label, key]) => ({ label, value: codeValue(selectedVariant, key) })).filter((row) => row.value) : []
  const selectedTechnicalRows = uniqueRows([...selectedRows, ...selectedCodeRows])
  if (type === 'generic') return <div className="product-technical-block"><TechnicalRows title="Variante seleccionada" rows={selectedTechnicalRows} /><TechnicalRows title="Información técnica" rows={value.general} /></div>
  if (type === 'profile') {
    const finishes = (value.profileFinishes || []).filter((finish) => finish?.name || finish?.color)
    const dimensions = (value.profileDimensions || []).filter((dimension) => dimension?.label || dimension?.value).map((dimension) => ({ ...dimension, option: [dimension.label, dimension.value].filter(Boolean).join(' · ') }))
    const filteredCodes = codes.filter((row) => (!selectedFinish || row.finish === selectedFinish) && (!selectedDimension || row.dimensions === selectedDimension))
    const clearFilters = () => { setSelectedFinish(''); setSelectedDimension('') }
     return <div className="product-technical-block product-technical-profile"><TechnicalRows title="Variante seleccionada" rows={selectedTechnicalRows} />
       {(finishes.length > 0 || dimensions.length > 0) && <div className="product-filter-toolbar"><button type="button" className="product-filter-clear" onClick={clearFilters}>Limpiar filtros</button></div>}
       {finishes.length > 0 && <section className="product-technical-section product-technical-finishes"><h3>Acabado</h3><div className="product-filter-buttons">{finishes.map((finish, index) => <button type="button" className={`product-filter-button${selectedFinish === finish.name ? ' is-active' : ''}`} key={index} onClick={() => setSelectedFinish((current) => current === finish.name ? '' : finish.name)}>{finish.color && <span className="product-finish-swatch" style={{ backgroundColor: finish.color }} aria-hidden="true" />}<span>{finish.name}</span></button>)}</div></section>}
       {dimensions.length > 0 && <section className="product-technical-section product-technical-dimensions"><h3>Dimensiones</h3><div className="product-filter-buttons">{dimensions.map((dimension, index) => <button type="button" className={`product-filter-button${selectedDimension === dimension.option ? ' is-active' : ''}`} key={index} onClick={() => setSelectedDimension((current) => current === dimension.option ? '' : dimension.option)}>{dimension.option}</button>)}</div></section>}
       {codes.length > 0 && <section className="product-technical-section product-technical-codes"><h3>Referencias y variantes</h3><p className="product-codes-intro">Selecciona la referencia según temperatura de color y grado de protección.</p>{filteredCodes.length > 0 ? <div className="product-code-table-wrap"><table className="product-code-table"><thead><tr><th>Código de producto</th><th>Acabado</th><th>Dimensiones</th></tr></thead><tbody>{filteredCodes.map((row, index) => { const finish = finishes.find((item) => item.name === row.finish); return <tr key={index}><td data-label="Código de producto">{row.code}</td><td data-label="Acabado"><span className="product-code-finish">{finish?.color && <span className="product-finish-swatch" style={{ backgroundColor: finish.color }} aria-hidden="true" />}<span>{row.finish}</span></span></td><td data-label="Dimensiones">{row.dimensions}</td></tr> })}</tbody></table></div> : <p className="product-filter-empty">No hay códigos para los filtros seleccionados.</p>}</section>}
     </div>
   }
   if (type === 'led-strip') {
     const temperatures = [...new Set((value.temperatures?.length ? value.temperatures : codes.map((row) => row.temperature)).filter(Boolean))]
     const protections = [...new Set((value.protections?.length ? value.protections : codes.map((row) => row.ip)).filter(Boolean))]
     const filteredCodes = codes.filter((row) => (!selectedFinish || row.temperature === selectedFinish) && (!selectedDimension || row.ip === selectedDimension))
     const clearFilters = () => { setSelectedFinish(''); setSelectedDimension('') }
       return <div className="product-technical-block product-technical-led"><TechnicalRows title="Variante seleccionada" rows={selectedTechnicalRows} />
        {(temperatures.length > 0 || protections.length > 0) && <div className="product-filter-toolbar"><button type="button" className="product-filter-clear" onClick={clearFilters}>Limpiar filtros</button></div>}
        {temperatures.length > 0 && <section className="product-technical-section product-technical-led-temperature"><h3>Temperatura</h3><div className="product-filter-buttons">{temperatures.map((temperature) => <button type="button" className={`product-filter-button${selectedFinish === temperature ? ' is-active' : ''}`} key={temperature} onClick={() => setSelectedFinish((current) => current === temperature ? '' : temperature)}>{temperature}</button>)}</div></section>}
        {protections.length > 0 && <section className="product-technical-section product-technical-led-protection"><h3>Protección</h3><div className="product-filter-buttons">{protections.map((protection) => <button type="button" className={`product-filter-button${selectedDimension === protection ? ' is-active' : ''}`} key={protection} onClick={() => setSelectedDimension((current) => current === protection ? '' : protection)}>{protection}</button>)}</div></section>}
         {codes.length > 0 && <section className="product-technical-section product-technical-codes"><h3>Referencias y variantes</h3><p className="product-codes-intro">Selecciona la referencia según temperatura de color y grado de protección.</p>{filteredCodes.length > 0 ? <div className="product-code-table-wrap"><table className="product-code-table"><thead><tr><th>Código de producto</th><th>Potencia (W/m)</th><th>Temperatura de color (K)</th><th>CRI</th><th>Flujo luminoso (lm)</th><th>Regulación</th><th>Protección</th></tr></thead><tbody>{filteredCodes.map((row, index) => <tr key={index}><td data-label="Código de producto">{row.code}</td><td data-label="Potencia (W/m)">{row.power}</td><td data-label="Temperatura de color (K)">{row.temperature}</td><td data-label="CRI">{row.cri}</td><td data-label="Flujo luminoso (lm)">{row.luminousFlux}</td><td data-label="Regulación">{row.dimming}</td><td data-label="Protección">{row.ip}</td></tr>)}</tbody></table></div> : <p className="product-filter-empty">No hay códigos para los filtros seleccionados.</p>}</section>}
        <TechnicalRows title="Información básica" rows={value.ledBasic} />
        <TechnicalRows title="Dimensiones" rows={value.ledDimensions} />
      </div>
   }

   return <div className="product-technical-block"><TechnicalRows title="Información técnica" rows={value.general} /></div>
 }
