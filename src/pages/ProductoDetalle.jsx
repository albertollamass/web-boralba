import { useState } from 'react'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import Carousel from '../components/Carousel'
import { openPdfDataUrl } from '../lib/pdf'
import { useSiteSettings } from '../context/SiteSettingsContext'

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:')
const itemText = (item) => typeof item === 'string' || typeof item === 'number' ? String(item).trim() : item && typeof item === 'object' ? String(item.text ?? item.title ?? item.name ?? item.label ?? item.application ?? '').trim() : ''
const itemDescription = (item) => item && typeof item === 'object' ? String(item.description ?? item.detail ?? item.body ?? '').trim() : ''
const list = (value) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map(itemText).filter(Boolean)
const csv = (value) => (Array.isArray(value) ? value : String(value || '').split(',')).map(itemText).filter(Boolean)
const contentItems = (value, withIcon = false) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map((item) => ({ title: itemText(item), description: itemDescription(item), icon: withIcon && item && typeof item === 'object' ? item.icon || '' : '' })).filter((item) => item.title || item.description || item.icon)
const normalizeUnit = (spec) => ({ ...spec, label: String(spec.label || '').trim(), value: String(spec.value || '').trim(), unit: String(spec.unit || '').trim() })
const imageSrc = (image) => typeof image === 'string' ? image : image?.src || image?.image || ''

export default function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct, products, hydrated } = useProducts()
  const { getCategory, getBreadcrumb } = useCategories()
  const { settings } = useSiteSettings()
  const product = getProduct(id)
  const [activeTab, setActiveTab] = useState('descripcion')
  const [zoomImage, setZoomImage] = useState(null)
  const [compareIds, setCompareIds] = useState([])
  const [showComparison, setShowComparison] = useState(false)
  const [selectedCompatible, setSelectedCompatible] = useState([])

  if (!hydrated) return <div className="container section"><div className="empty-state"><h3>Cargando producto...</h3></div></div>
  if (!product) return <Navigate to="/productos" replace />

  const category = getCategory(product.category)
  const categoryTrail = getBreadcrumb(product.category) || []
  const gallery = [...new Map([product.image, ...(Array.isArray(product.gallery) ? product.gallery : csv(product.gallery))].map((image) => [imageSrc(image), imageSrc(image)])).values()].filter(Boolean)
  const apps = contentItems(product.applications)
  const benefits = contentItems(product.advantages, true)
  const longDescription = list(product.longDescription)
  const features = list(product.features)
  const tags = csv(product.tags)
  const specs = (Array.isArray(product.specs) ? product.specs : []).map(normalizeUnit).filter((s) => s.label || s.value)
  const highlighted = specs.filter((s) => s.featured).slice(0, 4)
  const included = (Array.isArray(product.includedItems) ? product.includedItems : []).filter((item) => item && (item.name || item.quantity))
  const example = product.applicationExample || {}
  const compatible = [...new Map((Array.isArray(product.compatibleProducts) ? product.compatibleProducts : []).map((relation) => [relation.productId, relation])).values()].map((relation) => ({ ...relation, product: products.find((item) => item.id === relation.productId) })).filter((relation) => relation.product)
  const compatibleIds = new Set(compatible.map((relation) => relation.productId))
  const similar = [...new Set(Array.isArray(product.similarProductIds) ? product.similarProductIds : [])].filter((similarId) => !compatibleIds.has(similarId)).map((similarId) => products.find((item) => item.id === similarId)).filter(Boolean)
  const documents = (Array.isArray(product.documents) ? product.documents : []).filter((document) => document.public !== false && document.file && document.name)
  const hasDescription = Boolean(longDescription.length || features.length || product.description)
  const hasTechnical = specs.length > 0 || (product.showTechnicalDrawing && product.technicalDrawing) || product.technicalNotice
  const tabList = [{ id: 'descripcion', label: 'Descripción', show: hasDescription }, { id: 'aplicaciones', label: 'Aplicaciones recomendadas', show: apps.length > 0 }, { id: 'ventajas', label: 'Ventajas técnicas', show: benefits.length > 0 }, { id: 'datos', label: 'Datos técnicos', show: hasTechnical }].filter((tab) => tab.show)
  const currentTab = tabList.some((tab) => tab.id === activeTab) ? activeTab : tabList[0]?.id
  const family = categoryTrail.length > 1 ? `${categoryTrail[categoryTrail.length - 2].name} · ${category?.name || ''}` : category?.name

  const askForSolution = () => navigate(`/contacto?productos=${[product, ...selectedCompatible.map((selectedId) => products.find((item) => item.id === selectedId))].filter(Boolean).map((item) => item.ref).filter(Boolean).join(',')}`)
  const toggleCompare = (similarId) => setCompareIds((ids) => ids.includes(similarId) ? ids.filter((item) => item !== similarId) : ids.length < 3 ? [...ids, similarId] : ids)
  const comparisonProducts = similar.filter((item) => compareIds.includes(item.id))
  const sharedSpecs = [...new Set(comparisonProducts.flatMap((item) => (item.specs || []).map((spec) => spec.label).filter(Boolean)))].map((label) => ({ label, values: comparisonProducts.map((item) => (item.specs || []).find((spec) => spec.label === label)) })).filter((row) => row.values.filter((value) => value?.value).length >= 2)

  const panel = (tab) => <div className={`product-tab-panel${currentTab === tab.id ? ' is-open' : ''}`}>
    {tab.id === 'descripcion' && <div className="description-copy">{product.description && <p className="description-lead">{product.description}</p>}{longDescription.map((paragraph, i) => <RichText key={i} text={paragraph} as="p" />)}{features.length > 0 && <div className="desc-block"><h2>Características principales</h2><ul className="feature-grid">{features.map((feature, i) => <li key={i}><RichText text={feature} /></li>)}</ul></div>}</div>}
    {tab.id === 'aplicaciones' && <div className="content-card-grid">{apps.map((item, i) => <article className="content-card" key={i}><span className="content-card-number">{String(i + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div>}
    {tab.id === 'ventajas' && <div className="content-card-grid">{benefits.map((item, i) => <article className="content-card benefit-card" key={i}>{item.icon ? <img src={item.icon} alt="" /> : <span className="benefit-check">✓</span>}<div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div>}
    {tab.id === 'datos' && <div className="technical-layout"><div>{specs.length > 0 && <div className="spec-table-wrap"><table className="spec-table"><tbody>{specs.map((spec, i) => <tr key={i}><th>{spec.label}</th><td>{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</td></tr>)}</tbody></table></div>}{product.technicalNotice && <aside className="technical-notice">{product.technicalNotice}</aside>}</div>{product.showTechnicalDrawing && product.technicalDrawing && <figure className="technical-drawing"><img src={product.technicalDrawing} alt={`Dibujo técnico de ${product.name}`} onClick={() => setZoomImage(product.technicalDrawing)} /><figcaption>Ampliar dibujo técnico</figcaption></figure>}</div>}
  </div>

  return <>
    <main className="product-page"><div className="container product-container">
      <nav className="breadcrumb product-breadcrumb" aria-label="Migas de pan"><Link to="/">Inicio</Link><span>/</span><Link to="/productos">Productos</Link>{categoryTrail.map((cat) => <span key={cat.slug}><span>/</span>{cat.slug === product.category ? <span>{cat.name}</span> : <Link to={`/categoria/${cat.slug}`}>{cat.name}</Link>}</span>)}</nav>
      <div className="product-detail"><div className="product-gallery"><Carousel images={gallery} alt={product.name} onImageClick={setZoomImage} /></div><div className="product-info"><p className="product-kicker">{family || 'Producto'}</p><h1>{product.name}</h1>{product.ref && <p className="ref product-ref">Ref. {product.ref}</p>}{product.description && <p className="product-short-description">{product.description}</p>}
        {highlighted.length > 0 && <div className="highlight-grid">{highlighted.map((spec, i) => <div className="highlight-item" key={i}><LineIcon index={i} /><strong>{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</strong><span>{spec.label}</span></div>)}</div>}
        <div className="product-actions"><Link to={`/contacto?productos=${product.ref || ''}`} className="btn btn-primary">Solicitar presupuesto</Link><Link to="/contacto" className="btn btn-outline" target="_blank" rel="noreferrer">Consultar a un técnico</Link>{product.datasheet && <a href={isDataUrl(product.datasheet) ? undefined : product.datasheet} onClick={isDataUrl(product.datasheet) ? (e) => { e.preventDefault(); openPdfDataUrl(product.datasheet) } : undefined} target={isDataUrl(product.datasheet) ? undefined : '_blank'} rel="noreferrer" className="datasheet-link">↓ Descargar ficha técnica</a>}</div>
        {product.showTags && tags.length > 0 && <div className="meta-links">{tags.map((tag) => <span key={tag} className="tag-chip">{tag}</span>)}</div>}
      </div></div>
      {included.length > 0 && <section className="product-section included-section"><SectionHeading title="Qué incluye" /><div className="included-grid">{included.map((item, i) => <article key={i}><span className="included-icon">{item.icon ? <img src={item.icon} alt="" /> : <LineIcon index={i} />}</span><div><strong>{item.quantity}</strong><h3>{item.name}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div></section>}
      {tabList.length > 0 && <section className="product-description"><div className="tabs">{tabList.map((tab) => <button key={tab.id} className={`tab${currentTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div><div className="desktop-tab-content">{panel({ ...tabList.find((tab) => tab.id === currentTab), id: currentTab })}</div><div className="mobile-accordion">{tabList.map((tab) => <div className={`accordion-item${currentTab === tab.id ? ' is-open' : ''}`} key={tab.id}><button className="accordion-trigger" onClick={() => setActiveTab(currentTab === tab.id ? '' : tab.id)} aria-expanded={currentTab === tab.id}>{tab.label}<span>{currentTab === tab.id ? '−' : '+'}</span></button>{currentTab === tab.id && panel(tab)}</div>)}</div></section>}
      {example.image && <section className="application-example product-section"><img src={example.image} alt={example.title || 'Ejemplo de aplicación'} onClick={() => setZoomImage(example.image)} /><div><p className="product-kicker">Ejemplo de aplicación</p><h2>{example.title}</h2>{example.description && <p>{example.description}</p>}{example.spaceType && <span className="space-label">{example.spaceType}</span>}{example.inspiration && <small>Imagen de inspiración</small>}</div></section>}
      {compatible.length > 0 && <section className="product-section related-products"><SectionHeading title="Completa tu instalación" text="Encuentra los componentes compatibles para configurar una solución completa." /><div className="component-grid">{compatible.map(({ product: item, reason, recommended }) => <article className="component-card" key={item.id}><img src={item.image || 'images/placeholder.svg'} alt={item.name} /><div><div className="component-card-top">{recommended && <span className="recommended">Recomendado</span>}<span>{item.componentType || item.category}</span></div><h3>{item.name}</h3><p className="ref">{item.ref}</p>{reason && <p>{reason}</p>}<div className="component-actions"><Link to={`/producto/${item.id}`} className="btn btn-outline btn-sm">Ver producto</Link><label className="check"><input type="checkbox" checked={selectedCompatible.includes(item.id)} onChange={() => setSelectedCompatible((ids) => ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id])} /> Añadir a mi consulta</label></div></div></article>)}</div>{selectedCompatible.length > 0 && <button className="btn btn-primary" onClick={askForSolution}>Solicitar presupuesto de la solución completa</button>}</section>}
      {documents.length > 0 && <section className="product-section documents-section"><SectionHeading title="Documentación" /><div className="documents-list">{documents.map((document, i) => <a className="document-item" key={i} href={isDataUrl(document.file) ? undefined : document.file} download={!isDataUrl(document.file) ? undefined : document.name} onClick={isDataUrl(document.file) ? (event) => { event.preventDefault(); openPdfDataUrl(document.file) } : undefined}><span className="document-icon">↓</span><span><strong>{document.name}</strong><small>{document.type || 'Documento'}</small></span><b>Descargar</b></a>)}</div></section>}
      {similar.length > 0 && <section className="product-section related-products"><SectionHeading title="También te puede interesar" /><div className="grid grid-4">{similar.map((item) => <article className="similar-card" key={item.id}><Link to={`/producto/${item.id}`}><div className="card-img"><img src={item.image || 'images/placeholder.svg'} alt={item.name} loading="lazy" /></div><div className="card-body"><h3>{item.name}</h3><div className="ref">{item.ref}</div></div></Link><label className="check"><input type="checkbox" checked={compareIds.includes(item.id)} onChange={() => toggleCompare(item.id)} /> Comparar</label></article>)}</div>{similar.length >= 2 && <button className="btn btn-outline compare-button" disabled={compareIds.length < 2} onClick={() => setShowComparison(true)}>Comparar seleccionados</button>}{showComparison && comparisonProducts.length >= 2 && <div className="comparison-wrap"><button className="comparison-close" onClick={() => setShowComparison(false)}>Cerrar</button><div className="comparison-scroll"><table className="comparison-table"><thead><tr><th>Especificación</th>{comparisonProducts.map((item) => <th key={item.id}>{item.name}</th>)}</tr></thead><tbody>{sharedSpecs.map((row) => <tr key={row.label}><th>{row.label}</th>{row.values.map((value, i) => <td key={i}>{value?.value ? `${value.value}${value.unit ? ` ${value.unit}` : ''}` : '—'}</td>)}</tr>)}</tbody></table></div></div>}</section>}
      <section className="technical-advice"><div><h2>¿Necesitas ayuda para configurar tu instalación?</h2><p>Indícanos los metros, el tipo de espacio y el efecto de luz que buscas. Nuestro equipo técnico te ayudará a seleccionar el perfil, la tira LED y el sistema de alimentación adecuados.</p></div><div className="advice-contact"><Link to={`/contacto?productos=${product.ref || ''}`} className="btn btn-primary">Solicitar asesoramiento</Link><a href={`tel:${settings.phone}`}>{settings.phone}</a><a href={`mailto:${settings.email}`}>{settings.email}</a>{settings.hours && <span>{settings.hours}</span>}</div></section>
    </div></main>{zoomImage && <div className="image-lightbox" role="dialog" aria-label="Imagen ampliada" onClick={() => setZoomImage(null)}><button type="button" aria-label="Cerrar">×</button><img src={zoomImage} alt={`Imagen ampliada de ${product.name}`} /></div>}
  </>
}

function SectionHeading({ title, text }) { return <div className="section-head left"><h2>{title}</h2>{text && <p>{text}</p>}</div> }
function LineIcon({ index }) { const paths = ['M4 7h16M4 12h16M4 17h16', 'M5 19V5h14v14H5Z', 'M4 8h16v8H4z', 'M12 3v18M3 12h18']; return <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[index % paths.length]} /></svg> }
function RichText({ text, as }) { const Tag = as || 'span'; return <Tag>{String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</Tag> }
