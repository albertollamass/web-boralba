import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useProducts } from '../context/ProductsContext'
import { useCategories } from '../context/CategoriesContext'
import Carousel from '../components/Carousel'
import { openPdfDataUrl } from '../lib/pdf'

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:')
const itemText = (item) => typeof item === 'string' || typeof item === 'number' ? String(item).trim() : item && typeof item === 'object' ? String(item.text ?? item.title ?? item.name ?? item.label ?? item.application ?? '').trim() : ''
const itemDescription = (item) => item && typeof item === 'object' ? String(item.description ?? item.detail ?? item.body ?? '').trim() : ''
const list = (value) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map(itemText).filter(Boolean)
const csv = (value) => (Array.isArray(value) ? value : String(value || '').split(',')).map(itemText).filter(Boolean)
const contentItems = (value, withIcon = false) => (Array.isArray(value) ? value : String(value || '').split(/\n/)).map((item) => ({ title: itemText(item), description: itemDescription(item), icon: withIcon && item && typeof item === 'object' ? item.icon || '' : '' })).filter((item) => item.title || item.description || item.icon)
const normalizeUnit = (spec) => {
  const label = String(spec.label || '').toLowerCase()
  let unit = String(spec.unit || '').trim()
  if (label.includes('ancho del difusor') && unit === 'm') unit = 'mm'
  return { ...spec, label: String(spec.label || '').trim(), value: String(spec.value || '').trim(), unit }
}

export default function ProductoDetalle() {
  const { id } = useParams()
  const { getProduct, products, hydrated } = useProducts()
  const { getCategory, getBreadcrumb } = useCategories()
  const product = getProduct(id)
  const [activeTab, setActiveTab] = useState('descripcion')
  const [zoomImage, setZoomImage] = useState(null)

  if (!hydrated) return <div className="container section"><div className="empty-state"><h3>Cargando producto...</h3></div></div>
  if (!product) return <Navigate to="/productos" replace />

  const category = getCategory(product.category)
  const categoryTrail = getBreadcrumb(product.category) || []
  const gallery = [...new Set([product.image, ...csv(product.gallery)].filter(Boolean))]
  const apps = contentItems(product.applications)
  const benefits = contentItems(product.advantages, true)
  const longDescription = list(product.longDescription)
  const features = list(product.features)
  const tags = csv(product.tags)
  const specs = (Array.isArray(product.specs) ? product.specs : []).map(normalizeUnit).filter((s) => s.label || s.value)
  const highlighted = specs.filter((s) => s.featured).slice(0, 4)
  const hasDescription = Boolean(longDescription.length || features.length || product.description)
  const hasTechnical = specs.length > 0 || (product.showTechnicalDrawing && product.technicalDrawing) || product.technicalNotice
  const tabList = [
    { id: 'descripcion', label: 'Descripción', show: hasDescription },
    { id: 'aplicaciones', label: 'Aplicaciones recomendadas', show: apps.length > 0 },
    { id: 'ventajas', label: 'Ventajas técnicas', show: benefits.length > 0 },
    { id: 'datos', label: 'Datos técnicos', show: hasTechnical },
  ].filter((tab) => tab.show)
  const currentTab = tabList.some((tab) => tab.id === activeTab) ? activeTab : tabList[0]?.id
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
  const detail = specs.find((s) => /medid|dimensi|ancho|largo|alto/i.test(s.label))
  const productMeasure = detail ? `${detail.value}${detail.unit ? ` ${detail.unit}` : ''}` : ''
  const family = categoryTrail.length > 1 ? `${categoryTrail[categoryTrail.length - 2].name} · ${category?.name || ''}` : category?.name

  const panel = (tab) => <div className={`product-tab-panel${currentTab === tab.id ? ' is-open' : ''}`}>
    {tab.id === 'descripcion' && <div className="description-copy">
      {product.description && <p className="description-lead">{product.description}</p>}
      {longDescription.map((paragraph, i) => <RichText key={i} text={paragraph} as="p" />)}
      {features.length > 0 && <div className="desc-block"><h2>Características principales</h2><ul className="feature-grid">{features.map((feature, i) => <li key={i}><RichText text={feature} /></li>)}</ul></div>}
    </div>}
    {tab.id === 'aplicaciones' && <div className="content-card-grid">{apps.map((item, i) => <article className="content-card" key={i}><span className="content-card-number">{String(i + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div>}
    {tab.id === 'ventajas' && <div className="content-card-grid">{benefits.map((item, i) => <article className="content-card benefit-card" key={i}>{item.icon ? <img src={item.icon} alt="" /> : <span className="benefit-check">✓</span>}<div><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</div></article>)}</div>}
    {tab.id === 'datos' && <div className="technical-layout">
      <div>{specs.length > 0 && <div className="spec-table-wrap"><table className="spec-table"><tbody>{specs.map((spec, i) => <tr key={i}><th>{spec.label}</th><td>{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</td></tr>)}</tbody></table></div>}{product.technicalNotice && <aside className="technical-notice"><span aria-hidden="true">ⓘ</span>{product.technicalNotice}</aside>}</div>
      {product.showTechnicalDrawing && product.technicalDrawing && <figure className="technical-drawing"><img src={product.technicalDrawing} alt={`Dibujo técnico de ${product.name}`} onClick={() => setZoomImage(product.technicalDrawing)} /><figcaption>Ampliar dibujo técnico</figcaption></figure>}
    </div>}
  </div>

  return <>
    <main className="product-page">
      <div className="container product-container">
        <nav className="breadcrumb product-breadcrumb" aria-label="Migas de pan"><Link to="/">Inicio</Link><span>/</span><Link to="/productos">Productos</Link>{categoryTrail.map((cat) => <span key={cat.slug}><span>/</span>{cat.slug === product.category ? <span aria-current="page">{cat.name}</span> : <Link to={`/categoria/${cat.slug}`}>{cat.name}</Link>}</span>)}</nav>
        <div className="product-detail"><div className="product-gallery"><Carousel images={gallery} alt={product.name} onImageClick={setZoomImage} /></div>
          <div className="product-info"><p className="product-kicker">{family || 'Producto'}</p><h1>{product.name}</h1>{productMeasure && <p className="product-measure">{productMeasure}</p>}{product.ref && <p className="ref product-ref">Ref. {product.ref}</p>}{product.description && <p className="product-short-description">{product.description}</p>}
            {highlighted.length > 0 && <div className="highlight-grid">{highlighted.map((spec, i) => <div className="highlight-item" key={i}><LineIcon index={i} /><strong>{spec.value}{spec.unit ? ` ${spec.unit}` : ''}</strong><span>{spec.label}</span></div>)}</div>}
            <div className="product-actions"><a href="mailto:boralba@boralba.es?subject=Consulta%20producto" className="btn btn-primary">Solicitar presupuesto</a><Link to="/contacto" className="btn btn-outline" target="_blank" rel="noreferrer">Consultar a un técnico</Link>{product.datasheet && <a href={isDataUrl(product.datasheet) ? undefined : product.datasheet} onClick={isDataUrl(product.datasheet) ? (e) => { e.preventDefault(); openPdfDataUrl(product.datasheet) } : undefined} target={isDataUrl(product.datasheet) ? undefined : '_blank'} rel="noreferrer" className="datasheet-link"><span aria-hidden="true">↓</span> Descargar ficha técnica</a>}</div>
            {product.showTags && tags.length > 0 && <div className="meta-links">{tags.map((tag) => <span key={tag} className="tag-chip">{tag}</span>)}</div>}
          </div>
        </div>
        {tabList.length > 0 && <section className="product-description"><div className="tabs">{tabList.map((tab) => <button key={tab.id} className={`tab${currentTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div><div className="desktop-tab-content">{panel({ ...tabList.find((tab) => tab.id === currentTab), id: currentTab })}</div><div className="mobile-accordion">{tabList.map((tab) => <div className={`accordion-item${currentTab === tab.id ? ' is-open' : ''}`} key={tab.id}><button className="accordion-trigger" onClick={() => setActiveTab(currentTab === tab.id ? '' : tab.id)} aria-expanded={currentTab === tab.id}>{tab.label}<span>{currentTab === tab.id ? '−' : '+'}</span></button>{currentTab === tab.id && panel(tab)}</div>)}</div></section>}
        {related.length > 0 && <div className="related-products"><div className="section-head left"><h3>Productos relacionados</h3></div><div className="grid grid-4">{related.map((p) => <Link to={`/producto/${p.id}`} className="card" key={p.id}><div className="card-img"><img src={p.image || 'images/placeholder.svg'} alt={p.name} loading="lazy" /></div><div className="card-body"><h3>{p.name}</h3><div className="ref">{p.ref}</div></div></Link>)}</div></div>}
      </div>
    </main>
    {zoomImage && <div className="image-lightbox" role="dialog" aria-label="Imagen ampliada" onClick={() => setZoomImage(null)}><button type="button" aria-label="Cerrar">×</button><img src={zoomImage} alt={`Imagen ampliada de ${product.name}`} /></div>}
  </>
}

function LineIcon({ index }) { const paths = ['M4 7h16M4 12h16M4 17h16', 'M5 19V5h14v14H5Z', 'M4 8h16v8H4z', 'M12 3v18M3 12h18']; return <svg className="highlight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[index % paths.length]} /></svg> }
function RichText({ text, as }) { const Tag = as || 'span'; return <Tag>{String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</Tag> }
