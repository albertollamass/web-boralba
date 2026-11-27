import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useParams, Navigate } from 'react-router-dom'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'
import Carousel from '../components/Carousel'
import Seo from '../components/Seo'
import { SITE, canonicalFor, breadcrumbJsonLd, productJsonLd } from '../../domain/site/site'
import { openPdfDataUrl } from '../utils/pdf'
import { publicUrl } from '../utils/assets'
import { useSiteSettings } from '../../application/catalog/SiteSettingsContext'
import { resolveTechnicalKey } from '../../domain/catalog/technicalFeatures'
import { useQuote } from '../../application/quote/QuoteContext'
import { variantCandidates, variantGroups, variantLabelRows, variantValue } from '../../domain/catalog/quoteVariants'
import { productPath } from '../../domain/catalog/slug'
import { seoFields } from '../../domain/site/seo.js'

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:')
const itemText = (item) => typeof item === 'string' || typeof item === 'number' ? String(item).trim() : item && typeof item === 'object' ? String(item.text ?? item.title ?? item.name ?? item.label ?? item.application ?? '').trim() : ''
const itemDescription = (item) => item && typeof item === 'object' ? String(item.description ?? item.detail ?? item.body ?? '').trim() : ''
const list = (value) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map(itemText).filter(Boolean)
const csv = (value) => (Array.isArray(value) ? value : String(value || '').split(',')).map(itemText).filter(Boolean)
const contentItems = (value, withIcon = false) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map((item) => ({ title: itemText(item), description: itemDescription(item), icon: withIcon && item && typeof item === 'object' ? item.icon || '' : '', image: item && typeof item === 'object' ? item.image || '' : '', spaceType: item && typeof item === 'object' ? item.spaceType || '' : '', inspiration: Boolean(item && typeof item === 'object' && item.inspiration) })).filter((item) => item.title || item.description || item.icon || item.image)
const normalizeUnit = (spec) => ({ ...spec, label: spec.label == null ? '' : String(spec.label).trim(), value: spec.value == null ? '' : String(spec.value).trim(), unit: spec.unit == null ? '' : String(spec.unit).trim(), technicalKey: spec.technicalKey || spec.featureType || '' })
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
  return technicalInfo.type === 'neon-flex' ? 'led-strip' : technicalInfo.type || ''
}
const technicalRows = (rows) => (Array.isArray(rows) ? rows : []).filter((row) => row && (row.label || row.value))
const technicalCodes = (rows) => (Array.isArray(rows) ? rows : []).filter((row) => row && Object.values(row).some(Boolean)).map((row) => row.temperature || !row.cct ? row : { ...row, temperature: row.cct })
const clean = (value) => String(value == null ? '' : value).trim()
const presentationBenefitText = (value) => String(value || '').replace(/^\s*[-–—]\s+/, '')
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
const codeValue = (row, key) => clean(row?.[key] == null ? '' : row[key])
const optionName = (option) => typeof option === 'string' ? clean(option) : clean(option?.name || option?.label || option?.value)
const optionColor = (option) => typeof option === 'object' ? clean(option?.color) : ''
const cctColor = (value) => {
  const normalized = clean(value).toLowerCase()
  const kelvin = Number(normalized.match(/\d{3,4}/)?.[0] || 0)
  if (normalized.includes('cálid') || normalized.includes('calid') || (kelvin > 0 && kelvin <= 3000)) return '#ffb36b'
  if (normalized.includes('neutr') || (kelvin > 3000 && kelvin <= 4500)) return '#fff1d6'
  if (normalized.includes('frí') || normalized.includes('fri') || (kelvin > 4500 && kelvin <= 5500)) return '#eaf4ff'
  if (kelvin > 5500) return '#dbe9ff'
  return ''
}
const cctHex = (kelvin, min, max) => {
  const start = [255, 241, 214]
  const end = [218, 235, 255]
  const ratio = Math.max(0, Math.min(1, (kelvin - min) / Math.max(1, max - min)))
  return `#${start.map((channel, index) => Math.round(channel + (end[index] - channel) * ratio).toString(16).padStart(2, '0')).join('')}`
}
const hasCombinedCctValue = (temperatures) => optionList(temperatures).some((temperature) => /\bcct\b/i.test(optionName(temperature)) && (optionName(temperature).match(/\d{3,4}/g) || []).length >= 2)
const isCctOnlyProduct = (product) => {
  const info = product?.technicalInfo || {}
  return info.cct === true || hasCombinedCctValue([...(info.temperatures || []), ...(info.codes || []).map((code) => code.temperature || code.cct)])
}
const isRgbValue = (value) => clean(value).toUpperCase() === 'RGB' || /\brgb\b/i.test(clean(value))
const rgbOptionName = (value) => {
  const normalized = optionName(value)
  return normalized.replace(/\brgb\b/ig, 'RGB')
}
const RgbSwatch = () => <span className="product-rgb-swatch" aria-hidden="true"><i /><i /><i /></span>
const CctTemperatureSamples = ({ temperatures, min, max }) => <div className="product-cct-samples" aria-label="Rango CCT de la tira"><i className="product-cct-gradient-sample" style={{ background: `linear-gradient(90deg, ${temperatures.map((temperature) => `${cctHex(temperature, min, max)} ${(temperature - min) / Math.max(1, max - min) * 100}%`).join(', ')})` }} /><span>{temperatures.map((temperature) => <small key={temperature}>{temperature} K</small>)}</span></div>
const CctTableSamples = () => <span className="product-cct-table-samples" aria-label="CCT: 2700 K, 4000 K y 6000 K"><strong>CCT</strong><i className="product-cct-table-gradient" style={{ background: `linear-gradient(90deg, ${cctHex(2700, 2700, 6000)} 0%, ${cctHex(4000, 2700, 6000)} 50%, ${cctHex(6000, 2700, 6000)} 100%)` }} /><span><small>2700 K</small><small>4000 K</small><small>6000 K</small></span></span>
const temperatureSwatch = (color) => color ? <span className="product-temperature-swatch" style={{ backgroundColor: color }} aria-hidden="true" /> : null
const optionSwatches = (color) => <span className="product-option-swatches"><RgbSwatch />{temperatureSwatch(color)}</span>
const optionList = (value) => Array.isArray(value) ? value : String(value || '').split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
const ledTechnicalFields = [['Potencia', 'power'], ['CRI', 'cri'], ['Flujo luminoso', 'luminousFlux'], ['Tensión', 'voltage'], ['LEDs por metro', 'ledsPerMeter'], ['Distancia de corte', 'cuttingDistance'], ['Ángulo', 'angle'], ['Regulación', 'dimming'], ['Vida útil', 'lifetime']]
const variantReference = (variant) => clean(variant?.code || variant?.ref || variant?.reference)
const variantFieldRows = (variant) => {
  const source = variant?.attributes || variant?.options || variant?.specifications || {}
  return Object.entries(source).map(([label, value]) => ({ label: clean(label), value: clean(value), unit: '', technicalKey: resolveTechnicalKey({ label }) })).filter((row) => row.label && row.value)
}
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
const highlightValue = (item) => {
  if (item.technicalKey === 'mountingSurface' || item.technicalKey === 'mountingSuspended') return item.label
  const raw = `${clean(item.value)}${item.unit ? ` ${clean(item.unit)}` : ''}`.replace(/\s+/g, ' ').trim()
  if (item.technicalKey === 'dimensions') {
    const match = raw.match(/([\d,.]+)\s*(?:mm)?\s*[x×]\s*([\d,.]+)\s*(?:mm)?/i)
    if (match) return `${match[1]} × ${match[2]} mm`
  }
  return raw
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
  const selected = (Array.isArray(product.specs) ? product.specs : [])
    .map(normalizeUnit)
    .filter((row) => row.featured && (row.label || row.value))
    .map((row) => ({ ...row, technicalKey: resolveTechnicalKey(row) }))
  if (!selected.length) return []

  const isLedStrip = family === 'led-strip-24' || family === 'led-strip-220'
  const additional = [...(info.general || []), ...(info.ledBasic || []), ...(isLedStrip ? [] : info.ledDimensions || []), ...(info.profileDimensions || []), ...(info.protections || []).map((value) => ({ label: 'Protección', value: optionName(value) }))].map(normalizeUnit)
  const codes = technicalCodes(info.codes)
  const codeRows = codes.flatMap((code) => [
    ['Potencia', 'power'], ['Flujo luminoso', 'luminousFlux'], ['Tensión', 'voltage'], ['CRI', 'cri'], ['IP', 'ip'], ['Temperatura de color', 'temperature'], ['Distancia de corte', 'cuttingDistance'], ['Dimensiones', 'dimensions'], ['Ancho', 'width'], ['Longitud', 'length'], ['Material', 'material'], ['Montaje', 'mounting'], ['Difusor', 'diffuser'], ['Acabado', 'finish'], ['CCT', 'cct'], ['Óptica / ángulo', 'optics'], ['Regulación', 'dimming'], ['UGR', 'ugr'], ['IK', 'ik'],
  ].map(([label, key]) => ({ label, value: codeValue(code, key), unit: '', technicalKey: resolveTechnicalKey({ label, technicalKey: key }) })).filter((row) => row.value))
  const available = [...(Array.isArray(product.specs) ? product.specs : []).map(normalizeUnit), ...additional, ...codeRows]
    .map((row) => ({ ...row, technicalKey: resolveTechnicalKey(row) }))
    .filter((row) => row.label || row.value)
  return selected.flatMap((row) => {
    const source = clean(row.value) ? row : available.find((candidate) => candidate.technicalKey === row.technicalKey && clean(candidate.value))
    if (!source || !clean(source.value)) {
      console.warn(`Característica principal seleccionada sin valor resoluble: ${row.label || row.technicalKey}`)
      return []
    }
    return [{ ...row, value: source.value, unit: row.unit || source.unit }]
  })
}

export default function ProductoDetalle({ analytics }) {
  const { id } = useParams()
  const location = useLocation()
  const { getProduct, products, hydrated } = useProducts()
  const { getCategory, getBreadcrumb } = useCategories()
  const { settings } = useSiteSettings()
  const { addItem } = useQuote()
  const product = getProduct(id)
  const [activeTab, setActiveTab] = useState('descripcion')
  const [zoomImage, setZoomImage] = useState(null)
  const lightboxCloseRef = useRef(null)
  const lightboxOpenerRef = useRef(null)
  const [compareIds, setCompareIds] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!hydrated || !product) return
    analytics?.track('view_item', { item_id: product.id, item_name: product.name, item_reference: product.ref || undefined, item_category: product.category || undefined, items: [{ item_id: product.id, item_name: product.name, item_category: product.category || undefined }] })
  }, [analytics, hydrated, product])

  const closeLightbox = () => setZoomImage(null)
  const openLightbox = (image, event) => {
    lightboxOpenerRef.current = event?.currentTarget || null
    setZoomImage(image)
  }

  useEffect(() => {
    if (!zoomImage) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    lightboxCloseRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [zoomImage])

  useEffect(() => {
    if (zoomImage || !lightboxOpenerRef.current) return
    lightboxOpenerRef.current.focus()
    lightboxOpenerRef.current = null
  }, [zoomImage])

  if (!hydrated) return <div className="container section"><div className="empty-state"><h3>Cargando producto...</h3></div></div>
  if (!product) return <Navigate to="/productos" replace />

  const canonicalPath = productPath(product)
  const normalizePath = (path) => path.replace(/\/+$/, '') || '/'
  if (normalizePath(location.pathname) !== normalizePath(canonicalPath)) {
    return <Navigate to={canonicalPath} replace />
  }

  const category = getCategory(product.category)
  const productSeo = seoFields(product)
  const categoryTrail = getBreadcrumb(product.category) || []
  const gallery = [...new Map([product.image, ...(Array.isArray(product.gallery) ? product.gallery : csv(product.gallery))].map((image) => [imageSrc(image), { src: imageSrc(image), alt: typeof image === 'object' ? image.alt || '' : image === product.image ? product.imageAlt || '' : '' }])).values()].filter((image) => image.src)
  const apps = contentItems(product.applications)
  const benefits = contentItems(product.advantages, true)
  const longDescription = list(product.longDescription)
  const seoContent = productSeo.content || ''
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
  const candidates = variantCandidates(product)
  const hasUnidentifiableVariants = (Array.isArray(technicalInfo.codes) && technicalInfo.codes.length > 0 || Array.isArray(product.variants) && product.variants.length > 0) && candidates.length === 0
  const technicalType = technicalFamily(product, categoryTrail)
  const productFamily = familyFromText([family, product.name, product.category, ...(product.categories || [])].join(' '))
  const highlights = asFeatureRows(product, technicalInfo, productFamily)
  const mainHighlights = highlights
  const hasTechnicalInfo = technicalType === 'led-strip'
    ? technicalRows(technicalInfo.ledBasic).length > 0 || technicalRows(technicalInfo.ledDimensions).length > 0 || optionList(technicalInfo.temperatures).some(Boolean) || optionList(technicalInfo.protections).some(Boolean) || technicalCodes(technicalInfo.codes).length > 0
    : technicalType === 'profile'
      ? (technicalInfo.profileFinishes || []).some((finish) => finish?.name || finish?.color) || technicalRows(technicalInfo.profileDimensions).length > 0 || technicalCodes(technicalInfo.codes).length > 0
      : technicalRows(technicalInfo.general).length > 0
  const hasDescription = Boolean(longDescription.length || features.length || product.description || seoContent)
  const hasTechnical = specs.length > 0 || hasTechnicalInfo || (product.showTechnicalDrawing && product.technicalDrawing) || product.technicalNotice
  const hasAccessories = included.length > 0 || accessories.length > 0
  const tabList = [{ id: 'descripcion', label: 'Descripción', show: hasDescription }, { id: 'aplicaciones', label: 'Aplicaciones', show: apps.length > 0 }, { id: 'ventajas', label: 'Ventajas', show: benefits.length > 0 }, { id: 'datos', label: 'Datos técnicos', show: hasTechnical }, { id: 'accesorios', label: 'Accesorios', show: hasAccessories }, { id: 'descargas', label: 'Descargas', show: documents.length > 0 }].filter((tab) => tab.show)
  const currentTab = tabList.some((tab) => tab.id === activeTab) ? activeTab : tabList[0]?.id
  const handleVariantChange = (variant) => {
    const nextReference = variantReference(variant)
    if (nextReference === variantReference(selectedVariant)) return
    setSelectedVariant(variant || null)
    analytics?.track('select_item_variant', {
      item_id: product.id,
      item_name: product.name,
      item_reference: nextReference || undefined,
    })
  }

  const selectedReference = variantReference(selectedVariant) || (!candidates.length && !hasUnidentifiableVariants ? product.ref : '')
  const addToQuote = () => {
    if (!selectedReference) return
    addItem({ id: `${product.id}|${selectedReference}`, productId: product.id, name: product.name, image: product.image, reference: selectedReference, variantRows: variantLabelRows(selectedVariant), unit: product.unit || '', quantity })
    analytics?.track('add_to_quote', { item_id: product.id, item_name: product.name, item_reference: selectedReference, quantity, items: [{ item_id: product.id, item_name: product.name, quantity }] })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 3500)
  }

  const toggleCompare = (similarId) => setCompareIds((ids) => ids.includes(similarId) ? ids.filter((item) => item !== similarId) : ids.length < 3 ? [...ids, similarId] : ids)
  const comparisonProducts = similar.filter((item) => compareIds.includes(item.id))
  const sharedSpecs = [...new Set(comparisonProducts.flatMap((item) => (item.specs || []).map((spec) => spec.label).filter(Boolean)))].map((label) => ({ label, values: comparisonProducts.map((item) => (item.specs || []).find((spec) => spec.label === label)) })).filter((row) => row.values.filter((value) => value?.value).length >= 2)

  const panel = (tab) => <div className={`product-tab-panel${currentTab === tab.id ? ' is-open' : ''}`}>
      {tab.id === 'descripcion' && <div className="description-copy" lang="es">{product.description && <p className="description-lead">{product.description}</p>}{longDescription.map((paragraph, i) => <RichText key={i} text={paragraph} as="p" />)}{seoContent && <RichText text={seoContent} as="p" />}{features.length > 0 && <div className="desc-block"><h2>Características principales</h2><ul className="feature-grid">{features.map((feature, i) => <li key={i}><RichText text={feature} /></li>)}</ul></div>}</div>}
     {tab.id === 'aplicaciones' && <div className="content-card-grid product-applications-grid">{apps.map((item, i) => <article className="content-card product-application-item" key={i}><span className="content-card-number">{String(i + 1).padStart(2, '0')}</span><div className="product-application-content">{item.image && <img className="content-card-image" src={item.image} alt="" /> }<div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}{item.spaceType && <small>{item.spaceType}</small>}{item.inspiration && <small>Imagen de inspiración</small>}</div></div></article>)}</div>}
     {tab.id === 'ventajas' && <div className="content-card-grid product-benefits-grid">{benefits.map((item, i) => <article className={`content-card benefit-card product-benefit-item${item.description ? ' product-benefit-item--detailed' : ''}`} key={i}>{item.icon ? <img className="product-benefit-icon" src={item.icon} alt="" /> : <span className="benefit-check product-benefit-icon">✓</span>}<div className="product-benefit-text"><h3>{presentationBenefitText(item.title)}</h3>{item.description && <p>{presentationBenefitText(item.description)}</p>}</div></article>)}</div>}
        {tab.id === 'datos' && <div className="product-technical-content"><section className="technical-specifications"><h3 className="technical-spec-heading">Especificaciones técnicas</h3><div className="technical-layout"><div className="specifications-table">{specs.length > 0 && <TechnicalSpecTable specs={specs} />}</div>{product.showTechnicalDrawing && product.technicalDrawing && <figure className="technical-drawing"><img src={product.technicalDrawing} alt={`Dibujo técnico de ${product.name}`} role="button" tabIndex={0} onClick={(event) => openLightbox(product.technicalDrawing, event)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openLightbox(product.technicalDrawing, event) }} /><figcaption>Ampliar dibujo técnico</figcaption></figure>}</div>{product.technicalNotice && <aside className="technical-notice">{product.technicalNotice}</aside>}</section>{hasTechnicalInfo && <ProductTechnicalInfo type={technicalType} value={technicalInfo} selectedVariant={selectedVariant} />}</div>}
       {tab.id === 'accesorios' && <div className="product-accessories-tab">{included.length > 0 && <section className="product-accessories-tab-included"><h3>Incluido con el producto</h3><div>{included.map((item, index) => { const presentation = includedPresentation(item); return <span key={index}>{presentation.quantity} × {presentation.name}</span> })}</div></section>}{accessories.length > 0 && <section className="product-accessories-tab-compatible"><h3>Accesorios compatibles</h3><p>Elementos disponibles por separado para completar la instalación.</p><div>{accessories.map((item, index) => { const reference = item.reference || item.product?.ref; const image = imageSrc(item.image); return <article key={`${item.name}-${reference || ''}-${index}`}><div className="product-accessory-primary">{image && <img src={image} alt="" loading="lazy" />}<h4>{accessoryDisplayName(item.name)}</h4></div>{reference && <span>Ref. {reference}</span>}</article> })}</div></section>}</div>}
     {tab.id === 'descargas' && <div className="documents-list">{documents.map((document, i) => <a className="document-item" key={i} href={isDataUrl(document.file) ? undefined : fileUrl(document.file)} download={!isDataUrl(document.file) ? undefined : document.name} onClick={(event) => { analytics?.track('file_download', { file_name: document.name, item_id: product.id }); if (isDataUrl(document.file)) { event.preventDefault(); openPdfDataUrl(document.file) } }}><span className="document-icon">↓</span><span><strong>{document.name}</strong><small>{document.type || 'Documento'}</small></span><b>Descargar</b></a>)}</div>}
  </div>

   return <>
    <Seo
      title={`${product.name}${product.ref ? ` ${product.ref}` : ''} — Producto LED`}
      description={product.description || `Ficha técnica de ${product.name}${product.ref ? ` (${product.ref})` : ''}: especificaciones, aplicaciones y soluciones compatibles Boralba Lighting.`}
        path={canonicalPath}
       image={product.image ? `${SITE.url}/${String(product.image).replace(/^\//, '')}` : undefined}
       seo={{ ...productSeo, canonical: canonicalPath }}
      jsonLd={[
        breadcrumbJsonLd([
          { name: 'Home', url: canonicalFor('/') },
          { name: 'Productos', url: canonicalFor('/productos') },
             { name: product.name, url: canonicalFor(canonicalPath) },
        ]),
        productJsonLd(product),
      ]}
    />
     <main className="product-page" inert={Boolean(zoomImage)} aria-hidden={zoomImage ? 'true' : undefined}><div className="container product-container">
        <div className="product-detail"><div className="product-gallery"><Carousel images={gallery} alt={product.name} onImageClick={openLightbox} /></div><div className="product-info"><p className="product-kicker">{family || 'Producto'}</p><h1>{product.name}</h1>{(selectedReference || product.ref) && <p className="ref product-ref">Ref. {selectedReference || product.ref}</p>}{product.description && <p className="product-short-description">{product.description}</p>}{mainHighlights.length > 0 && <section className="product-highlights product-highlights-band"><h2>Características principales</h2><div className="product-highlights-list">{mainHighlights.map((item, index) => <div className="product-highlight-band-item" key={`${item.label}-${index}`}><strong>{highlightValue(item)}</strong><span>{item.technicalKey === 'mountingSurface' || item.technicalKey === 'mountingSuspended' ? 'Montaje' : item.label}</span></div>)}</div></section>}<ProductOptions product={product} onVariantChange={handleVariantChange} />{(candidates.length > 0 || hasUnidentifiableVariants || !product.ref) && !selectedReference && <p className="quote-selection-note">{hasUnidentifiableVariants ? 'Este producto no tiene referencias de variante identificables y no se puede añadir al presupuesto.' : candidates.length > 0 ? 'Selecciona una combinación válida para identificar la referencia.' : 'Este producto no tiene una referencia disponible y no se puede añadir al presupuesto.'}</p>}<div className="product-actions"><label className="quote-product-quantity">Cantidad<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} /></label><button type="button" onClick={addToQuote} disabled={!selectedReference} className="btn btn-primary">Añadir al presupuesto</button>{product.datasheet && <a href={isDataUrl(product.datasheet) ? undefined : fileUrl(product.datasheet)} onClick={isDataUrl(product.datasheet) ? (e) => { e.preventDefault(); openPdfDataUrl(product.datasheet) } : undefined} target={isDataUrl(product.datasheet) ? undefined : '_blank'} rel="noreferrer" className="datasheet-link">↓ Descargar ficha técnica</a>}</div>{added && <div className="quote-added" role="status">Añadido a tu presupuesto. <Link to="/productos">Seguir viendo productos</Link><Link to="/presupuesto">Ver presupuesto</Link></div>}</div></div>
       <div className="product-lower-row">
          <div className="product-below-hero" />
          {tabList.length > 0 && <section className="product-description"><div className="tabs">{tabList.map((tab) => <button type="button" key={tab.id} className={`tab${currentTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div><div className="desktop-tab-content">{panel({ ...tabList.find((tab) => tab.id === currentTab), id: currentTab })}</div><div className="mobile-accordion">{tabList.map((tab) => <div className={`accordion-item${currentTab === tab.id ? ' is-open' : ''}`} key={tab.id}><button type="button" className="accordion-trigger" onClick={() => setActiveTab(currentTab === tab.id ? '' : tab.id)} aria-expanded={currentTab === tab.id}>{tab.label}<span>{currentTab === tab.id ? '−' : '+'}</span></button>{currentTab === tab.id && panel(tab)}</div>)}</div></section>}
       </div>
        {example.image && !legacyExampleIsIntegrated && <section className="application-example product-section"><img src={example.image} alt={example.title || 'Ejemplo de aplicación'} role="button" tabIndex={0} onClick={(event) => openLightbox(example.image, event)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openLightbox(example.image, event) }} /><div><p className="product-kicker">Ejemplo de aplicación</p><h2>{example.title}</h2>{example.description && <p>{example.description}</p>}{example.spaceType && <span className="space-label">{example.spaceType}</span>}{example.inspiration && <small>Imagen de inspiración</small>}</div></section>}
          {compatible.length > 0 && <section className="product-section solution-section"><SectionHeading title="Completa la solución" text="Productos compatibles para configurar la instalación." /><div className={`solution-list solution-count-${Math.min(compatible.length, 4)}`}>{compatible.map(({ product: item, function: relationFunction, reason, recommended }) => <CompatibleSolutionItem key={item.id} item={item} relationFunction={relationFunction} reason={reason} recommended={recommended} analytics={analytics} />)}</div></section>}
       {similar.length > 0 && <section className="product-section related-products"><SectionHeading title="También te puede interesar" /><div className="grid grid-4">{similar.map((item) => <article className="similar-card" key={item.id}><Link to={productPath(item)}><div className="card-img"><img src={item.image || 'images/placeholder.svg'} alt={item.name} loading="lazy" /></div><div className="card-body"><h3>{item.name}</h3><div className="ref">{item.ref}</div></div></Link><label className="check"><input type="checkbox" checked={compareIds.includes(item.id)} onChange={() => toggleCompare(item.id)} /> Comparar</label></article>)}</div>{similar.length >= 2 && <button className="btn btn-outline compare-button" disabled={compareIds.length < 2} onClick={() => setShowComparison(true)}>Comparar seleccionados</button>}{showComparison && comparisonProducts.length >= 2 && <div className="comparison-wrap"><button className="comparison-close" onClick={() => setShowComparison(false)}>Cerrar</button><div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>Especificación</th>{comparisonProducts.map((item) => <th key={item.id}>{item.name}</th>)}</tr></thead><tbody>{sharedSpecs.map((row) => <tr key={row.label}><th>{row.label}</th>{row.values.map((value, i) => <td key={i}>{value?.value ? `${value.value}${value.unit ? ` ${value.unit}` : ''}` : '—'}</td>)}</tr>)}</tbody></table></div></div>}</section>}
         <section className="technical-advice advisory-content"><div><h2>¿Necesitas ayuda para configurar tu instalación?</h2><p>Indícanos los metros, el tipo de espacio y el efecto de luz que buscas. Nuestro equipo técnico te ayudará a seleccionar el perfil, la tira LED y el sistema de alimentación adecuados.</p></div><div className="advice-contact"><Link to={`/contacto?productos=${product.ref || ''}`} className="btn btn-primary">Solicitar asesoramiento</Link><a href={`tel:${settings.phone}`} onClick={() => analytics?.track('click_phone', { location: 'product_advice' })}>{settings.phone}</a><a href={`mailto:${settings.email}`} onClick={() => analytics?.track('click_email', { location: 'product_advice' })}>{settings.email}</a>{settings.hours && <span>{settings.hours}</span>}</div></section>
     </div></main>{zoomImage && createPortal(<div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Imagen ampliada" onClick={(event) => { if (event.target === event.currentTarget) closeLightbox() }}><button ref={lightboxCloseRef} type="button" aria-label="Cerrar imagen ampliada" onClick={(event) => { event.preventDefault(); event.stopPropagation(); closeLightbox() }}>×</button><img src={zoomImage} alt={`Imagen ampliada de ${product.name}`} /></div>, document.body)}
  </>
}

function SectionHeading({ title, text }) { return <div className="section-head left"><h2>{title}</h2>{text && <p>{text}</p>}</div> }
function TechnicalSpecTable({ specs }) { return <table className="spec-table"><tbody>{specs.map((spec, index) => <tr key={index}><th>{spec.label}</th><td>{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</td></tr>)}</tbody></table> }
function RichText({ text, as }) { const Tag = as || 'span'; return <Tag>{String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</Tag> }

function CompatibleSolutionItem({ item, relationFunction, reason, recommended, analytics }) {
  const { addItem } = useQuote()
  const candidates = variantCandidates(item)
  const groups = variantGroups(candidates)
  const [selected, setSelected] = useState(() => Object.fromEntries(groups.map((group) => [group.key, ''])))
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const matching = candidates.filter((candidate) => Object.entries(selected).every(([key, value]) => !value || variantValue(candidate, key) === value))
  const selectedReference = variantReference(matching.length === 1 ? matching[0] : null) || (!candidates.length ? clean(item.ref) : '')
  const available = (group, value) => candidates.some((candidate) => Object.entries(selected).every(([key, option]) => key === group.key || !option || variantValue(candidate, key) === option) && variantValue(candidate, group.key) === value)
  const select = (key, value) => setSelected((current) => ({ ...current, [key]: current[key] === value ? '' : value }))
  const addCompatibleToQuote = () => {
    if (!selectedReference) return
    addItem({ id: `${item.id}|${selectedReference}`, productId: item.id, name: item.name, image: item.image, reference: selectedReference, variantRows: variantLabelRows(matching[0]), unit: item.unit || '', quantity })
    analytics?.track('add_to_quote', { item_id: item.id, item_name: item.name, item_reference: selectedReference, quantity })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 3500)
  }

  return <article className="solution-item">
    <div className="solution-media"><img src={imageSrc(item.image) || 'images/placeholder.svg'} alt={item.name} loading="lazy" /></div>
    <div className="solution-copy"><div className="solution-function">{relationFunction || 'Producto compatible'}</div><h3>{item.name}</h3>{item.ref && <p className="ref">Ref. {item.ref}</p>}{reason && <p>{reason}</p>}{recommended && <small>Recomendado</small>}<Link to={productPath(item)}>Ver producto <span aria-hidden="true">→</span></Link>
      {groups.length > 0 && <div className="solution-options" aria-label={`Variantes de ${item.name}`}>{groups.map((group) => <div className="solution-option-group" key={group.key}><span>{group.label}</span><div>{group.values.map((value) => <button type="button" className={selected[group.key] === value ? 'is-active' : ''} key={value} disabled={!available(group, value)} aria-pressed={selected[group.key] === value} onClick={() => select(group.key, value)}>{value}</button>)}</div></div>)}</div>}
      <div className="solution-quote-action"><label className="solution-quantity-label">Cantidad<span className="solution-quantity-stepper"><button type="button" aria-label="Reducir cantidad" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Aumentar cantidad" onClick={() => setQuantity((current) => current + 1)}>+</button></span></label><button type="button" className="solution-add-button" onClick={addCompatibleToQuote} disabled={!selectedReference}>+ Añadir al presupuesto</button></div>
      {added && <span className="solution-added" role="status">✓ Añadido al presupuesto</span>}
    </div>
  </article>
}

function TechnicalRows({ title, rows, className = '' }) {
  const visible = technicalRows(rows)
  if (!visible.length) return null
  return <section className={`product-technical-section ${className}`}><h3>{title}</h3><dl className="product-technical-list">{visible.map((row, index) => <div key={index}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>
}

function ProductOptions({ product, analytics, onVariantChange }) {
  const { addItem } = useQuote()
  const candidates = variantCandidates(product)
  const groups = variantGroups(candidates)
  const cctOnly = isCctOnlyProduct(product)
  const visibleGroups = groups.filter((group) => !(cctOnly && group.key.includes('temperatura')))
  const [selected, setSelected] = useState(() => Object.fromEntries(groups.map((group) => [group.key, ''])))
  const [quantity, setQuantity] = useState(1)
  const [quoteAttempted, setQuoteAttempted] = useState(false)
  const temperatureOptions = optionList(product.technicalInfo?.temperatures)
  const temperatureColor = (value) => optionColor(temperatureOptions.find((option) => rgbOptionName(option) === rgbOptionName(value))) || cctColor(value)
  const matching = candidates.filter((candidate) => Object.entries(selected).every(([key, value]) => !value || variantValue(candidate, key) === value))
  useEffect(() => { onVariantChange(matching.length === 1 || (cctOnly && matching.length > 0 && Object.values(selected).some(Boolean)) ? matching[0] : null) }, [cctOnly, matching, onVariantChange, selected])
  const available = (group, value) => candidates.some((candidate) => Object.entries(selected).every(([key, option]) => key === group.key || !option || variantValue(candidate, key) === option) && variantValue(candidate, group.key) === value)
  const select = (key, value) => setSelected((current) => ({ ...current, [key]: current[key] === value ? '' : value }))
  if (!groups.length) return null
  const selectedReference = variantReference(matching.length === 1 ? matching[0] : null)
  const addVariantToQuote = () => {
    setQuoteAttempted(true)
    if (!selectedReference) return
    addItem({ id: `${product.id}|${selectedReference}`, productId: product.id, name: product.name, image: product.image, reference: selectedReference, variantRows: variantLabelRows(matching[0]), unit: product.unit || '', quantity })
    analytics?.track('add_to_quote', { item_id: product.id, item_name: product.name, item_reference: selectedReference, quantity })
  }
  const datasheetIsDataUrl = isDataUrl(product.datasheet)
  return <section className="product-options"><h2>Opciones disponibles</h2><div className="product-option-groups">{visibleGroups.map((group) => <div className="option-group" key={group.key}><span>{group.label}</span><div>{group.values.map((value) => <button type="button" className={selected[group.key] === value ? 'is-active' : ''} key={value} disabled={!available(group, value)} aria-pressed={selected[group.key] === value} onClick={() => select(group.key, value)}>{group.key.includes('temperatura') && isRgbValue(value) ? <>{optionSwatches(temperatureColor(value))}<span>{value}</span></> : value}</button>)}</div></div>)}</div>{quoteAttempted && !selectedReference && <p className="quote-selection-note" role="status">Selecciona una combinación válida para identificar la referencia.</p>}<div className="product-option-actions"><label className="quote-product-quantity">Cantidad<span className="quantity-stepper"><button type="button" aria-label="Reducir cantidad" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Aumentar cantidad" onClick={() => setQuantity((current) => current + 1)}>+</button></span></label><button type="button" className="btn btn-primary" onClick={addVariantToQuote}><span aria-hidden="true">+</span>Añadir al presupuesto</button>{product.datasheet && <a className="datasheet-link" href={datasheetIsDataUrl ? undefined : fileUrl(product.datasheet)} onClick={datasheetIsDataUrl ? (event) => { event.preventDefault(); openPdfDataUrl(product.datasheet) } : undefined}><span aria-hidden="true">↓</span>Descargar ficha técnica</a>}</div></section>
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
         {(finishes.length > 0 || dimensions.length > 0) && <div className="product-filter-toolbar"><span className="product-filter-heading">Opciones disponibles</span>{(selectedFinish || selectedDimension) && <button type="button" className="product-filter-clear" onClick={clearFilters}>Limpiar filtros</button>}</div>}
       {finishes.length > 0 && <section className="product-technical-section product-technical-finishes"><h3>Acabado</h3><div className="product-filter-buttons">{finishes.map((finish, index) => <button type="button" className={`product-filter-button${selectedFinish === finish.name ? ' is-active' : ''}`} key={index} onClick={() => setSelectedFinish((current) => current === finish.name ? '' : finish.name)}>{finish.color && <span className="product-finish-swatch" style={{ backgroundColor: finish.color }} aria-hidden="true" />}<span>{finish.name}</span></button>)}</div></section>}
       {dimensions.length > 0 && <section className="product-technical-section product-technical-dimensions"><h3>Dimensiones</h3><div className="product-filter-buttons">{dimensions.map((dimension, index) => <button type="button" className={`product-filter-button${selectedDimension === dimension.option ? ' is-active' : ''}`} key={index} onClick={() => setSelectedDimension((current) => current === dimension.option ? '' : dimension.option)}>{dimension.option}</button>)}</div></section>}
        {codes.length > 0 && <section className="product-technical-section product-technical-codes"><h3>Referencias y variantes</h3><p className="product-codes-intro">Selecciona la referencia según acabado y dimensiones.</p>{filteredCodes.length > 0 ? <div className="product-code-table-wrap"><table className="product-code-table"><thead><tr><th>Código de producto</th><th>Acabado</th><th>Dimensiones</th></tr></thead><tbody>{filteredCodes.map((row, index) => { const finish = finishes.find((item) => item.name === row.finish); return <tr key={index}><td data-label="Código de producto">{row.code}</td><td data-label="Acabado"><span className="product-code-finish">{finish?.color && <span className="product-finish-swatch" style={{ backgroundColor: finish.color }} aria-hidden="true" />}<span>{row.finish}</span></span></td><td data-label="Dimensiones">{row.dimensions}</td></tr> })}</tbody></table></div> : <p className="product-filter-empty">No hay códigos para los filtros seleccionados.</p>}</section>}
     </div>
   }
   if (type === 'led-strip') {
      const temperatureOptions = optionList(value.temperatures).length ? optionList(value.temperatures) : codes.map((row) => row.temperature)
      const temperatures = [...new Set(temperatureOptions.map(rgbOptionName).filter(Boolean))]
      const cctTemperatures = [...new Set(temperatureOptions.filter((temperature) => !isRgbValue(temperature)).flatMap((temperature) => clean(optionName(temperature)).match(/\d{3,4}/g)?.map(Number) || []))].sort((a, b) => a - b)
      const cctOnly = value.cct === true || hasCombinedCctValue([...(value.temperatures || []), ...codes.map((code) => code.temperature || code.cct)])
      const cctMin = Math.min(...cctTemperatures)
      const cctMax = Math.max(...cctTemperatures)
      const protectionOptions = optionList(value.protections).length ? optionList(value.protections) : codes.map((row) => row.ip)
      const protections = [...new Set(protectionOptions.map(optionName).filter(Boolean))]
      const filteredCodes = codes.filter((row) => (!cctOnly && (!selectedFinish || rgbOptionName(row.temperature) === selectedFinish) || cctOnly) && (!selectedDimension || row.ip === selectedDimension))
     const clearFilters = () => { setSelectedFinish(''); setSelectedDimension('') }
         return <div className="product-technical-block product-technical-led product-technical-strip">
          {(temperatures.length > 0 || protections.length > 0) && <div className="product-filter-toolbar"><span className="product-filter-heading">Opciones disponibles</span>{(selectedFinish || selectedDimension) && <button type="button" className="product-filter-clear" onClick={clearFilters}>Limpiar filtros</button>}</div>}
          {temperatures.length > 0 && <section className="product-technical-section product-technical-led-temperature"><h3>{cctOnly ? 'CCT' : 'Temperatura'}</h3>{cctOnly ? <div className="product-cct-control"><CctTemperatureSamples temperatures={cctTemperatures.length >= 3 ? cctTemperatures.slice(0, 3) : [cctMin, Math.round((cctMin + cctMax) / 200) * 100, cctMax]} min={cctMin} max={cctMax} /></div> : <div className="product-filter-buttons">{temperatures.map((temperature) => { const option = temperatureOptions.find((item) => rgbOptionName(item) === temperature); const color = optionColor(option); return <button type="button" className={`product-filter-button${selectedFinish === temperature ? ' is-active' : ''}`} key={temperature} onClick={() => setSelectedFinish((current) => current === temperature ? '' : temperature)}>{isRgbValue(temperature) ? optionSwatches(color) : color && <span className="product-finish-swatch" style={{ backgroundColor: color }} aria-hidden="true" />}<span>{temperature}</span></button> })}</div>}</section>}
        {protections.length > 0 && <section className="product-technical-section product-technical-led-protection"><h3>Protección</h3><div className="product-filter-buttons">{protections.map((protection) => <button type="button" className={`product-filter-button${selectedDimension === protection ? ' is-active' : ''}`} key={protection} onClick={() => setSelectedDimension((current) => current === protection ? '' : protection)}>{protection}</button>)}</div></section>}
          {codes.length > 0 && <LedCodeTable codes={filteredCodes} temperatureOptions={temperatureOptions} cctOnly={cctOnly} />}
         <TechnicalRows title="Información básica" rows={value.ledBasic} />
       </div>
}

   return <div className="product-technical-block"><TechnicalRows title="Información técnica" rows={value.general} /></div>
  }

function LedCodeTable({ codes, temperatureOptions, cctOnly = false }) {
  const columns = [
    ['Código de producto', 'code'],
    ['Temperatura de color', 'temperature'],
    ['Dimensiones o tamaño', 'dimensions'],
    ['Protección IP', 'ip'],
    ...ledTechnicalFields.slice(0, 3),
  ]
    return <section className="product-technical-section product-technical-codes product-led-references"><h3>Referencias</h3><p className="product-codes-intro">Selecciona la referencia según temperatura de color y protección IP.</p>{codes.length > 0 ? <div className="product-code-table-wrap product-led-references-wrapper"><table className="product-code-table product-led-references-table"><thead><tr>{columns.map(([label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{codes.map((row, index) => { const temperature = temperatureOptions.find((option) => rgbOptionName(option) === rgbOptionName(row.temperature)); const color = optionColor(temperature); const isCctRange = cctOnly && /\bcct\b/i.test(codeValue(row, 'temperature')) && /2700/.test(codeValue(row, 'temperature')) && /4000/.test(codeValue(row, 'temperature')) && /6000/.test(codeValue(row, 'temperature')); return <tr key={index}>{columns.map(([label, key]) => <td data-label={label} key={key}>{key === 'temperature' ? isCctRange ? <CctTableSamples /> : <span className="product-code-finish">{isRgbValue(row.temperature) ? optionSwatches(color) : color && <span className="product-finish-swatch" style={{ backgroundColor: color }} aria-hidden="true" />}<span>{rgbOptionName(row.temperature)}</span></span> : codeValue(row, key)}</td>)}</tr> })}</tbody></table></div> : <p className="product-filter-empty">No hay códigos para los filtros seleccionados.</p>}</section>
}
