import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/seo-audit.css'
import { Link } from 'react-router-dom'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'
import { useAuth } from '../../application/identity/AuthContext'
import SeoEditor from './SeoEditor'
import { seoDraftRepository } from '../../infrastructure/seo/seoDraftRepository.js'
import { canResumeSearchConsole, connectSearchConsole, disconnectSearchConsole, fetchSearchConsoleReport, inspectSearchConsoleUrl, isSearchConsoleConnected, searchConsoleConfig } from '../../infrastructure/seo/searchConsoleClient.js'
import { seoFields } from '../../domain/site/seo.js'
import { productPath } from '../../domain/catalog/slug.js'

const EMPTY = null
const periodOptions = [['7d', 'Últimos 7 días'], ['28d', 'Últimos 28 días'], ['90d', 'Últimos 90 días'], ['6m', 'Últimos 6 meses'], ['12m', 'Últimos 12 meses'], ['custom', 'Fechas personalizadas']]
const format = (value, digits = 0) => value == null ? '—' : Number(value).toLocaleString('es-ES', { maximumFractionDigits: digits })
const percent = (value) => value == null ? '—' : `${format(value * 100, 2)}%`
const altProposal = (product, image) => {
  const name = product.name || 'Producto'
  const category = String(image.category || '').toLowerCase()
  if (category.includes('dibujo')) return `Dibujo técnico de ${name}`
  if (category.includes('dimensi')) return `Detalle de dimensiones de ${name}`
  if (category.includes('accesorio')) return `Accesorio compatible con ${name}`
  if (category.includes('ejemplo')) return `Ejemplo de aplicación de ${name}`
  return `${name} — ${image.category || 'detalle del producto'}`
}

export default function SeoDashboard({ target = null }) {
  const { products, updateProduct } = useProducts()
  const { getCategoryPathLabel } = useCategories()
  const { user } = useAuth()
  const [period, setPeriod] = useState('28d')
  const [dates, setDates] = useState({ startDate: '', endDate: '' })
  const [report, setReport] = useState(EMPTY)
  const [connected, setConnected] = useState(isSearchConsoleConnected())
  const [status, setStatus] = useState(searchConsoleConfig.isConfigured ? (isSearchConsoleConnected() ? 'connected' : 'disconnected') : 'not-configured')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('clicks')
  const [auditFilter, setAuditFilter] = useState('all')
  const [auditFamily, setAuditFamily] = useState('all')
  const [auditSubfamily, setAuditSubfamily] = useState('all')
  const [auditPriority, setAuditPriority] = useState('all')
  const [auditResolution, setAuditResolution] = useState('all')
  const [inspection, setInspection] = useState(null)
  const [productInspections, setProductInspections] = useState({})
  const [inspectionStatus, setInspectionStatus] = useState('idle')
  const [section, setSection] = useState(target ? 'optimizacion' : 'resumen')
  const [drafts, setDrafts] = useState([])
  const resumeAttempted = useRef(false)

  const load = async (force = false) => {
    if (!connected && !force) {
      setStatus(searchConsoleConfig.isConfigured ? 'disconnected' : 'not-configured')
      return
    }
    setStatus('loading')
    setError('')
    try {
      const result = await fetchSearchConsoleReport({ period, ...dates })
      setStatus(result.status)
      setReport(result.data)
    } catch (loadError) {
      setStatus('error')
      setReport(null)
      setError(loadError.message)
    }
  }

  useEffect(() => { if (connected) load() }, [period, connected])

  useEffect(() => {
    if (resumeAttempted.current || connected || !searchConsoleConfig.isConfigured || !canResumeSearchConsole()) return
    resumeAttempted.current = true
    let cancelled = false
    setStatus('reconnecting')
    connectSearchConsole({ loginHint: user?.email }).then(() => {
      if (!cancelled) setConnected(true)
    }).catch((resumeError) => {
      if (cancelled) return
      const needsConsent = resumeError.code === 'interaction_required' || resumeError.code === 'consent_required'
      setStatus(needsConsent ? 'requires-consent' : 'disconnected')
      if (needsConsent) setError('La autorización sigue concedida, pero Google necesita una interacción para renovarla.')
    })
    return () => { cancelled = true }
  }, [connected, user?.email])

  const connect = async (forceConsent = false) => {
    setStatus('authorizing')
    setError('')
    try {
      await connectSearchConsole({ loginHint: user?.email, forceConsent })
      setConnected(true)
      await load(true)
    } catch (connectError) {
      const needsConsent = connectError.code === 'interaction_required' || connectError.code === 'consent_required'
      setStatus(needsConsent ? 'requires-consent' : 'error')
      setError(needsConsent ? 'Google necesita confirmar de nuevo el permiso de lectura para Search Console.' : connectError.message)
    }
  }

  const disconnect = () => {
    disconnectSearchConsole()
    setConnected(false)
    setReport(null)
    setError('')
    setStatus('disconnected')
  }

  const inspect = async (url) => {
    setInspectionStatus('loading')
    try {
       const result = await inspectSearchConsoleUrl(url)
       setInspection(result)
       setProductInspections((current) => ({ ...current, [url]: result }))
      setInspectionStatus('ready')
    } catch (inspectionError) {
      setInspection({ error: inspectionError.message })
      setInspectionStatus('error')
    }
  }

  const queries = useMemo(() => {
    const rows = report?.queries || []
    return [...rows].filter((row) => (row.query || '').toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(b[sort] || 0) - Number(a[sort] || 0))
  }, [report, query, sort])

  const audit = useMemo(() => products.map((product) => {
    const seo = seoFields(product)
    const path = getCategoryPathLabel(product.category) || ''
    const pathParts = path.split(' › ')
    const family = pathParts[1] || pathParts[0] || 'Sin familia'
    const subfamily = pathParts[2] || pathParts[1] || 'Sin subfamilia'
    const altItems = []
    if (product.image && !product.imageAlt) altItems.push({ key: 'imageAlt', label: 'Imagen principal', proposed: `${product.name}${product.ref ? ` ${product.ref}` : ''} — imagen principal` })
    ;(Array.isArray(product.gallery) ? product.gallery : []).map((image) => typeof image === 'string' ? { src: image, alt: '', category: 'Detalle del producto', decorative: false } : image).forEach((image, index) => {
      const decorative = Boolean(image?.decorative || image?.category === 'Decorativa')
      if (image?.src && !image?.alt && !decorative) altItems.push({ key: `gallery-${index}`, label: image.category || 'Imagen de galería', proposed: altProposal(product, image), index })
    })
    const issues = []
     if (!seo.title) issues.push('Sin título SEO')
     if (!product.seo?.description && !product.seoDescription) issues.push('Sin metadescripción')
     if (altItems.length) issues.push('Imagen sin texto alternativo')
     const draft = drafts.find((item) => item.entityType === 'product' && item.entityId === product.id)
     const resolution = draft?.status === 'verified' ? 'verified' : draft?.status === 'published' ? 'published' : draft ? 'draft' : 'pending'
     const priority = issues.includes('Sin título SEO') ? 'high' : issues.includes('Sin metadescripción') ? 'medium' : 'low'
     return { product, issues, altItems, family, subfamily, resolution, priority, draft }
   }).filter(({ issues, family, subfamily, priority, resolution }) => {
     const matchesIssue = auditFilter === 'all' || issues.includes(auditFilter)
     const matchesFamily = auditFamily === 'all' || family === auditFamily
     const matchesSubfamily = auditSubfamily === 'all' || subfamily === auditSubfamily
     const matchesPriority = auditPriority === 'all' || priority === auditPriority
     const matchesResolution = auditResolution === 'all' || resolution === auditResolution
     return issues.length > 0 && matchesIssue && matchesFamily && matchesSubfamily && matchesPriority && matchesResolution
   }), [products, drafts, getCategoryPathLabel, auditFilter, auditFamily, auditSubfamily, auditPriority, auditResolution])

  const auditFamilies = useMemo(() => [...new Set(products.map((product) => {
    const path = getCategoryPathLabel(product.category) || ''
    return path.split(' › ')[1] || path.split(' › ')[0] || 'Sin familia'
  }))].sort(), [products, getCategoryPathLabel])

  const auditSubfamilies = useMemo(() => [...new Set(products.filter((product) => auditFamily === 'all' || (getCategoryPathLabel(product.category) || '').split(' › ')[1] === auditFamily).map((product) => {
    const parts = (getCategoryPathLabel(product.category) || '').split(' › ')
    return parts[2] || parts[1] || 'Sin subfamilia'
  }))].sort(), [products, getCategoryPathLabel, auditFamily])

  const opportunities = useMemo(() => (report?.queries || [])
    .filter((row) => Number(row.impressions || 0) >= 20 && Number(row.position || 0) >= 4 && Number(row.position || 0) <= 20 && Number(row.ctr || 0) < 0.05)
    .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
    .slice(0, 20), [report])

  useEffect(() => {
    seoDraftRepository.list().then(setDrafts).catch(() => setDrafts([]))
  }, [])

  const exportCsv = () => {
    const headers = ['Palabra clave', 'Clics', 'Impresiones', 'CTR', 'Posición media', 'Variación', 'URL']
    const lines = queries.map((row) => [row.query, row.clicks, row.impressions, row.ctr, row.position, row.variation, row.url].map(csvCell).join(';'))
    const blob = new Blob([[headers.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'boralba-search-console-consultas.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const metricCards = [
    ['Clics totales', format(report?.summary?.clicks), 'Visitas que han llegado a Boralba desde un resultado de Google.'], ['Impresiones', format(report?.summary?.impressions), 'Veces que una página de Boralba se ha mostrado en los resultados.'], ['CTR medio', percent(report?.summary?.ctr), 'Porcentaje de impresiones que han terminado en un clic.'], ['Posición media', format(report?.summary?.position, 1), 'Posición media registrada para los resultados de Boralba.'],
    ['Páginas en sitemap', format(report?.sitemap?.submitted), 'URLs que Google reconoce dentro del sitemap enviado.'], ['Indexadas comprobadas', format(report?.inspection?.indexed), 'URLs inspeccionadas individualmente que Google considera indexadas.'], ['No indexadas comprobadas', format(report?.inspection?.notIndexed), 'URLs inspeccionadas individualmente que no están indexadas.'], ['Pendientes de inspección', format(report?.inspection?.pending), 'URLs que todavía no han sido comprobadas individualmente.'],
  ]

  return <section className="seo-dashboard">
    <header className="seo-heading">
      <div><span className="admin-kicker">Visibilidad orgánica</span><h2>SEO y posicionamiento</h2><p className="muted">Datos de Search Console y controles internos del catálogo, claramente separados.</p></div>
      <a className="btn btn-outline btn-sm" href="https://search.google.com/search-console?resource_id=https%3A%2F%2Fboralba.es%2F" target="_blank" rel="noreferrer">Abrir Search Console ↗</a>
    </header>
    <nav className="seo-section-nav" aria-label="Secciones SEO">{[['resumen', 'Resumen'], ['optimizacion', 'Optimización SEO'], ['auditoria', 'Auditoría y mejoras'], ['keywords', 'Palabras clave'], ['competencia', 'Competencia'], ['historial', 'Publicaciones e historial']].map(([value, label]) => <button key={value} className={section === value ? 'active' : ''} onClick={() => setSection(value)}>{label}</button>)}</nav>
      {section !== 'resumen' ? <section className="seo-section-placeholder"><h3>{section === 'optimizacion' ? 'Optimización SEO' : section === 'auditoria' ? 'Auditoría y mejoras' : section === 'keywords' ? 'Palabras clave' : section === 'competencia' ? 'Competencia' : 'Publicaciones e historial'}</h3>{section === 'optimizacion' ? <SeoEditor initialType="product" initialId={target?.id || ''} focusField={target?.field || ''} /> : section === 'auditoria' ? <AuditSection audit={audit} updateProduct={updateProduct} /> : section === 'keywords' ? <KeywordOpportunities opportunities={opportunities} /> : section === 'historial' ? <HistorySection drafts={drafts} setDrafts={setDrafts} /> : <p className="seo-empty">No hay una fuente de competencia configurada. No se muestran datos ficticios.</p>}</section> : <>
    <div className="seo-toolbar"><label>Periodo<select value={period} onChange={(event) => setPeriod(event.target.value)}>{periodOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{period === 'custom' && <><label>Desde<input type="date" value={dates.startDate} onChange={(event) => setDates({ ...dates, startDate: event.target.value })} /></label><label>Hasta<input type="date" value={dates.endDate} onChange={(event) => setDates({ ...dates, endDate: event.target.value })} /></label></>}<button className="btn btn-primary btn-sm" onClick={load}>Actualizar</button></div>
    <ConnectionStatus status={status} error={error} lastSync={report?.lastSync} onConnect={connect} onDisconnect={disconnect} />
    <div className="seo-stats">{metricCards.map(([label, value, explanation]) => <div className="seo-stat" key={label} title={explanation} tabIndex="0"><span>{label} <small aria-hidden="true">ⓘ</small></span><strong>{value}</strong></div>)}</div>
    <div className="seo-meta-row"><span>Última sincronización: <strong>{report?.lastSync ? new Date(report.lastSync).toLocaleString('es-ES') : 'Pendiente'}</strong></span><span>Sitemap: <strong>{report?.sitemap?.status || 'Pendiente de sincronización'}</strong></span><span>Errores de sitemap: <strong>{report?.sitemap?.errors == null ? 'Pendiente' : report.sitemap.errors}</strong></span></div>
    <Panel title="Evolución" note="Las series se muestran únicamente cuando la API devuelve datos del periodo seleccionado."><div className="seo-chart-grid">{[['clicks', 'Clics'], ['impressions', 'Impresiones'], ['ctr', 'CTR'], ['position', 'Posición media'], ['indexed', 'Indexación']].map(([key, label]) => <Chart key={key} data={report?.timeline} metric={key} label={label} />)}</div></Panel>
    <Panel title="Palabras clave" action={<button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!queries.length}>Exportar CSV</button>}>
      <div className="seo-table-tools"><input placeholder="Buscar consulta..." value={query} onChange={(event) => setQuery(event.target.value)} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="clicks">Ordenar por clics</option><option value="impressions">Ordenar por impresiones</option><option value="position">Ordenar por posición</option></select></div>
      <DataTable rows={queries} /></Panel>
    <Panel title="Posicionamiento de productos" note="La relación se hace con las URLs devueltas por Search Console; no se asignan métricas por aproximación."><ProductTable products={products} rows={report?.pages || []} getCategoryPathLabel={getCategoryPathLabel} /></Panel>
     <Panel title="Estado SEO por producto" note="Publicado y accesible no significa indexado. Solo mostramos como indexado lo que devuelve la inspección individual de Search Console."><ProductIndexationTable products={products} inspections={productInspections} onInspect={inspect} inspectionStatus={inspectionStatus} /></Panel>
     <Panel title="Control de indexación" note="Recuentos de inspecciones individuales. No representan el informe global de cobertura de Google."><Inspection inspection={inspection} onInspect={inspect} status={inspectionStatus} /></Panel>
      <Panel title="Auditoría SEO interna" note="Resuelve las incidencias aquí. Guardar crea un borrador; publicar actualiza el producto; verificar vuelve a comprobar los datos."><AuditFilters auditFilter={auditFilter} setAuditFilter={setAuditFilter} auditFamily={auditFamily} setAuditFamily={setAuditFamily} auditSubfamily={auditSubfamily} setAuditSubfamily={setAuditSubfamily} auditPriority={auditPriority} setAuditPriority={setAuditPriority} auditResolution={auditResolution} setAuditResolution={setAuditResolution} families={auditFamilies} subfamilies={auditSubfamilies} /><ActiveAuditSection audit={audit} updateProduct={updateProduct} /></Panel>
    <Recommendations report={report} />
    </>}
  </section>
}

function ConnectionStatus({ status, error, lastSync, onConnect, onDisconnect }) { const labels = { loading: 'Sincronizando...', reconnecting: 'Restaurando conexión...', authorizing: 'Esperando autorización de Google...', connected: 'Conectado con Google Search Console', disconnected: 'Cuenta de Google no conectada', 'requires-consent': 'Es necesaria una autorización', 'not-configured': 'OAuth no configurado', unauthenticated: 'Sesión no válida', error: 'No se pudo sincronizar' }; return <div className={`seo-connection seo-connection--${status}`}><span className="seo-dot" /> <strong>{labels[status]}</strong>{error && <span>{error}</span>}{['disconnected', 'error', 'unauthenticated', 'requires-consent'].includes(status) && <button className="btn btn-primary btn-sm" onClick={() => onConnect(status === 'requires-consent')}>{status === 'requires-consent' ? 'Autorizar acceso de Google' : status === 'disconnected' ? 'Conectar con Google Search Console' : 'Volver a conectar'}</button>}{status === 'connected' && <button className="btn btn-ghost btn-sm" onClick={onDisconnect}>Desconectar</button>}{status === 'not-configured' && <span>Configura VITE_GOOGLE_OAUTH_CLIENT_ID para autorizar la cuenta.</span>}{lastSync && <span>Última respuesta: {new Date(lastSync).toLocaleString('es-ES')}</span>}</div> }
function Panel({ title, note, action, children }) { return <section className="seo-panel"><div className="seo-panel-heading"><div><h3>{title}</h3>{note && <p>{note}</p>}</div>{action}</div>{children}</section> }
function Chart({ data, metric, label }) { if (!data?.length) return <div className="seo-chart"><strong>{label}</strong><p className="seo-empty">Sin datos</p></div>; const max = Math.max(...data.map((point) => Number(point[metric] ?? 0)), 1); return <div className="seo-chart" role="img" aria-label={`Evolución de ${label}`}><strong>{label}</strong><div className="seo-chart-bars">{data.map((point) => <div className="seo-chart-point" style={{ height: `${Math.max(4, (Number(point[metric] ?? 0) / max) * 100)}%` }} title={`${point.date}: ${point[metric] ?? '—'}`} key={point.date} />)}</div><div className="seo-chart-labels"><span>{data[0].date}</span><span>{data[data.length - 1].date}</span></div></div> }
function DataTable({ rows }) { if (!rows.length) return <p className="seo-empty">No hay consultas disponibles para este periodo.</p>; return <div className="seo-table-wrap"><table className="admin-table"><thead><tr><th>Palabra clave</th><th>Clics</th><th>Impresiones</th><th>CTR</th><th>Posición</th><th>Variación</th><th>URL</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.query}-${row.url}`}><td><strong>{row.query}</strong></td><td>{format(row.clicks)}</td><td>{format(row.impressions)}</td><td>{percent(row.ctr)}</td><td>{format(row.position, 1)}</td><td>{row.variation == null ? '—' : format(row.variation, 1)}</td><td>{row.url ? <a href={row.url} target="_blank" rel="noreferrer">Ver ↗</a> : '—'}</td></tr>)}</tbody></table></div> }
function ProductIndexationTable({ products, inspections, onInspect, inspectionStatus }) {
  if (!products.length) return <p className="seo-empty">No hay productos cargados desde Firebase.</p>
  return <div className="seo-table-wrap"><table className="admin-table"><thead><tr><th>Producto</th><th>Publicación</th><th>Google</th><th>Indexación</th><th>Incidencias</th><th>Acción</th></tr></thead><tbody>{products.map((product) => {
    const seo = seoFields(product)
    const url = `https://boralba.es${productPath(product)}`
    const inspection = inspections[url]
    const issues = [!seo.title && 'Título SEO', !seo.description && 'Metadescripción', product.image && !product.imageAlt && 'Texto alternativo'].filter(Boolean)
    const indexError = inspection && inspection.verdict && inspection.verdict !== 'PASS'
    return <tr key={product.id}><td><strong>{product.name || product.id}</strong><small>{product.ref || url}</small></td><td><Status value={product.published === false ? 'No publicado' : 'Publicado correctamente'} tone={product.published === false ? 'error' : 'ok'} /></td><td><Status value={product.published === false || seo.noindex ? 'No disponible' : 'Disponible para Google'} tone={product.published === false || seo.noindex ? 'error' : 'ok'} /></td><td><Status value={inspection?.verdict === 'PASS' ? 'Indexado según Search Console' : 'Pendiente de indexación'} tone={inspection?.verdict === 'PASS' ? 'ok' : 'pending'} /></td><td>{issues.length || indexError ? <span className="seo-inline-error">{indexError ? inspection.coverageState || 'Error de Search Console' : issues.join(', ')}</span> : '—'}</td><td><button className="btn btn-outline btn-sm" onClick={() => onInspect(url)} disabled={inspectionStatus === 'loading'}>Comprobar URL</button></td></tr>
  })}</tbody></table></div>
}
function Status({ value, tone }) { return <span className={`seo-status seo-status--${tone}`}>{value}</span> }
function ProductTable({ products, rows, getCategoryPathLabel }) { const byUrl = new Map(rows.map((row) => [row.url, row])); const visible = products.map((product) => ({ product, row: rows.find((item) => item.url?.includes(`/producto/${product.id}`)) || byUrl.get(product.publicUrl) })).filter(({ row }) => row); if (!visible.length) return <p className="seo-empty">No hay páginas de producto devueltas por la API en este periodo.</p>; return <div className="seo-table-wrap"><table className="admin-table"><thead><tr><th>Producto</th><th>Referencia</th><th>Familia</th><th>Clics</th><th>Impresiones</th><th>CTR</th><th>Posición</th><th>Indexación</th></tr></thead><tbody>{visible.map(({ product, row }) => <tr key={product.id}><td><div className="seo-product"><img src={product.image || 'images/placeholder.svg'} alt={product.imageAlt || product.name} /><strong>{product.name}</strong></div></td><td>{product.ref || '—'}</td><td>{getCategoryPathLabel(product.category)}</td><td>{format(row.clicks)}</td><td>{format(row.impressions)}</td><td>{percent(row.ctr)}</td><td>{format(row.position, 1)}</td><td>{row.indexingStatus || 'Pendiente de inspección'}</td></tr>)}</tbody></table></div> }
function Inspection({ inspection, onInspect, status }) { const [url, setUrl] = useState('https://boralba.es/'); return <div className="seo-inspection"><form className="seo-inspection-form" onSubmit={(event) => { event.preventDefault(); onInspect(url) }}><label>Inspeccionar URL<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} /></label><button className="btn btn-primary btn-sm" disabled={status === 'loading'}>{status === 'loading' ? 'Comprobando…' : 'Comprobar URL'}</button></form>{inspection?.error && <p className="seo-inline-error">{inspection.error}</p>}{inspection && !inspection.error && <div className="seo-inspection-result"><strong>{inspection.verdict || 'Sin veredicto'}</strong><span>{inspection.coverageState || 'Estado de cobertura no disponible'}</span><span>Indexación: {inspection.indexingState || '—'}</span><span>Último rastreo: {inspection.lastCrawlTime ? new Date(inspection.lastCrawlTime).toLocaleString('es-ES') : '—'}</span><span>Canónica Google: {inspection.googleCanonical || '—'}</span></div>}<a href="https://search.google.com/search-console?resource_id=https%3A%2F%2Fboralba.es%2F" target="_blank" rel="noreferrer">Abrir informes y solicitar indexación en Search Console ↗</a></div> }
function Recommendations({ report }) { const recommendations = report?.recommendations || []; return <Panel title="Recomendaciones de mejora" note="Solo se muestran recomendaciones calculadas por el backend a partir de datos reales.">{recommendations.length ? <div className="seo-recommendations">{recommendations.map((item) => <article className={`seo-recommendation seo-recommendation--${item.priority}`} key={`${item.url}-${item.title}`}><span>{item.priority}</span><h4>{item.title}</h4><p>{item.problem}</p><small>{item.url} · Métrica: {item.metric}</small></article>)}</div> : <p className="seo-empty">No hay recomendaciones disponibles sin datos reales suficientes.</p>}</Panel> }
function AuditFilters({ auditFilter, setAuditFilter, auditFamily, setAuditFamily, auditSubfamily, setAuditSubfamily, auditPriority, setAuditPriority, auditResolution, setAuditResolution, families, subfamilies }) {
  return <div className="seo-table-tools seo-audit-filters"><label>Incidencia<select value={auditFilter} onChange={(event) => setAuditFilter(event.target.value)}><option value="all">Todas</option><option>Sin título SEO</option><option>Sin metadescripción</option><option>Imagen sin texto alternativo</option></select></label><label>Familia<select value={auditFamily} onChange={(event) => { setAuditFamily(event.target.value); setAuditSubfamily('all') }}><option value="all">Todas</option>{families.map((family) => <option key={family}>{family}</option>)}</select></label><label>Subfamilia<select value={auditSubfamily} onChange={(event) => setAuditSubfamily(event.target.value)}><option value="all">Todas</option>{subfamilies.map((family) => <option key={family}>{family}</option>)}</select></label><label>Prioridad<select value={auditPriority} onChange={(event) => setAuditPriority(event.target.value)}><option value="all">Todas</option><option value="high">Alta</option><option value="medium">Media</option><option value="low">Baja</option></select></label><label>Estado<select value={auditResolution} onChange={(event) => setAuditResolution(event.target.value)}><option value="all">Todos</option><option value="pending">Pendiente</option><option value="draft">Borrador guardado</option><option value="published">Publicado</option><option value="verified">Verificado</option></select></label></div>
}

function ActiveAuditSection({ audit, updateProduct }) {
  const [selected, setSelected] = useState([])
  const [open, setOpen] = useState(null)
  const [proposals, setProposals] = useState({})
  const [approved, setApproved] = useState({})
  const [statusOverrides, setStatusOverrides] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const makeProposals = (row) => {
    const { product, issues, altItems } = row
    const seo = seoFields(product)
    const result = []
    if (issues.includes('Sin título SEO')) result.push({ key: 'title', label: 'Título SEO', current: seo.title || '(se genera automáticamente con el nombre)', proposed: `${product.name}${product.ref ? ` ${product.ref}` : ''} — Producto LED`, reason: 'La ficha no tiene un título SEO específico.', impact: 'Solo SEO: cambia el título del resultado, no el H1 visible.' })
    if (issues.includes('Sin metadescripción')) result.push({ key: 'description', label: 'Metadescripción', current: seo.description || product.description || '(sin descripción)', proposed: product.description || `Información de ${product.name}${product.ref ? `, referencia ${product.ref}` : ''} en Boralba Lighting.`, reason: 'Google necesita un resumen útil y el catálogo ya contiene esta información.', impact: 'Solo SEO: no cambia el texto visible de la ficha.' })
    altItems.forEach((item) => result.push({ key: item.key, label: item.label, current: item.key === 'imageAlt' ? product.imageAlt || '(sin texto alternativo)' : '(sin texto alternativo)', proposed: item.proposed, reason: 'La propuesta usa el nombre, referencia y categoría real de la imagen.', impact: 'No cambia el aspecto visual; mejora accesibilidad y el contenido interpretado por buscadores.', index: item.index }))
    return result
  }
  const generate = (row) => { setProposals((current) => ({ ...current, [row.product.id]: makeProposals(row) })); setApproved((current) => ({ ...current, [row.product.id]: [] })); setOpen(row.product.id); setMessage('Propuesta generada con datos reales del producto. Revísala antes de aprobarla.') }
  const generateSelected = () => { audit.filter((row) => selected.includes(row.product.id)).forEach(generate); setMessage(`${selected.length} propuesta(s) preparada(s) para revisión.`) }
  const editProposal = (id, key, value) => setProposals((current) => ({ ...current, [id]: (current[id] || []).map((item) => item.key === key ? { ...item, proposed: value } : item) }))
  const approve = (id, key) => setApproved((current) => ({ ...current, [id]: (current[id] || []).includes(key) ? current[id].filter((item) => item !== key) : [...(current[id] || []), key] }))
  const selectedProposals = (id) => (proposals[id] || []).filter((item) => (approved[id] || []).includes(item.key))
  const saveDrafts = async (ids = selected.length ? selected : open ? [open] : []) => {
    const ready = ids.filter((id) => selectedProposals(id).length)
    if (!ready.length) return setMessage('Genera propuestas y aprueba al menos una antes de guardar.')
    setSaving(true); setMessage('')
    try {
      await Promise.all(ready.map((id) => { const fields = Object.fromEntries(selectedProposals(id).map((item) => [item.key, item.proposed])); return seoDraftRepository.save('product', id, fields) }))
      setStatusOverrides((current) => Object.fromEntries([...Object.entries(current), ...ready.map((id) => [id, 'draft'])]))
      setMessage(`${ready.length} borrador(es) guardado(s). Ningún cambio público se ha realizado.`)
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }
  const publish = async (ids = selected.length ? selected : open ? [open] : []) => {
    const ready = ids.filter((id) => selectedProposals(id).length)
    if (!ready.length) return setMessage('Genera propuestas y aprueba al menos una antes de publicar.')
    if (!window.confirm(`Se publicarán las correcciones aprobadas en ${ready.length} producto(s). ¿Continuar?`)) return
    setSaving(true); setMessage('')
    try {
      await Promise.all(ready.map(async (id) => {
        const row = audit.find((item) => item.product.id === id)
        const fields = Object.fromEntries(selectedProposals(id).map((item) => [item.key, item.proposed]))
        if (!row || !Object.keys(fields).length) return
        await seoDraftRepository.save('product', id, fields)
        const next = { ...row.product, seo: { ...(row.product.seo || {}), ...(fields.title ? { title: fields.title } : {}), ...(fields.description ? { description: fields.description } : {}) } }
        if (fields.imageAlt && !next.imageAlt) next.imageAlt = fields.imageAlt
        next.gallery = Array.isArray(next.gallery) ? next.gallery.map((image, index) => fields[`gallery-${index}`] && !(typeof image === 'object' && image.alt) ? { ...(typeof image === 'string' ? { src: image } : image), alt: fields[`gallery-${index}`] } : image) : next.gallery
        await updateProduct(id, next)
        await seoDraftRepository.setStatus('product', id, 'published')
      }))
      setStatusOverrides((current) => Object.fromEntries([...Object.entries(current), ...ready.map((id) => [id, 'published'])]))
      setMessage('Correcciones publicadas en Firestore. El HTML estático se actualizará en el próximo build y despliegue.')
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }
  const verify = async (ids = selected.length ? selected : open ? [open] : []) => {
    const unresolved = ids.map((id) => audit.find((row) => row.product.id === id)).filter(Boolean).filter((row) => {
      const fields = Object.fromEntries(selectedProposals(row.product.id).map((item) => [item.key, item.proposed]))
      const titleResolved = row.product.seo?.title || fields.title
      const descriptionResolved = row.product.seo?.description || row.product.seoDescription || fields.description
      const imageResolved = row.product.imageAlt || fields.imageAlt
      const galleryResolved = row.altItems.filter((item) => item.key.startsWith('gallery-')).every((item) => fields[item.key] || row.product.gallery?.[item.index]?.alt)
      return row.issues.some((issue) => issue === 'Sin título SEO' && !titleResolved || issue === 'Sin metadescripción' && !descriptionResolved || issue === 'Imagen sin texto alternativo' && row.altItems.some((item) => item.key === 'imageAlt' && !imageResolved) || issue === 'Imagen sin texto alternativo' && row.altItems.some((item) => item.key.startsWith('gallery-')) && !galleryResolved)
    })
    if (unresolved.length) return setMessage('Todavía hay incidencias sin resolver. Después de publicar, recarga la auditoría para comprobar el producto actualizado.')
    try { await Promise.all(ids.map((id) => seoDraftRepository.setStatus('product', id, 'verified'))); setStatusOverrides((current) => Object.fromEntries([...Object.entries(current), ...ids.map((id) => [id, 'verified'])])); setMessage('Correcciones marcadas como verificadas.') } catch (error) { setMessage(error.message) }
  }
  const restore = (row, entry) => { setProposals((current) => ({ ...current, [row.product.id]: Object.entries(entry.fields || {}).map(([key, value]) => ({ key, label: key, current: '', proposed: Array.isArray(value) ? value.join(', ') : String(value), reason: 'Versión anterior recuperada.', impact: 'Revisa el impacto antes de aprobar.' })) })); setOpen(row.product.id); setMessage('Versión recuperada en la auditoría. Apruébala y guárdala para crear una nueva versión.') }
  if (!audit.length) return <p className="seo-empty">No hay incidencias internas con el filtro seleccionado.</p>
  return <div className="seo-active-audit"><div className="seo-audit-help"><strong>Cómo resolverlas</strong><span>Genera una propuesta, revisa el texto, apruébala y guarda el borrador. Publicar cambia el producto; verificar vuelve a comprobarlo. Ninguna acción genera contenido técnico inventado.</span></div><div className="seo-bulk-toolbar"><button type="button" className="btn btn-primary btn-sm" disabled={!selected.length || saving} onClick={generateSelected}>Generar soluciones seleccionadas</button><button type="button" className="btn btn-outline btn-sm" disabled={!selected.length || saving} onClick={() => saveDrafts()}>Guardar aprobadas</button><button type="button" className="btn btn-outline btn-sm" disabled={!selected.length || saving} onClick={() => publish()}>Publicar aprobadas</button><button type="button" className="btn btn-ghost btn-sm" disabled={!selected.length || saving} onClick={() => verify()}>Verificar seleccionadas</button>{message && <span role="status">{message}</span>}</div><div className="seo-audit-cards">{audit.map((row) => { const status = statusOverrides[row.product.id] || row.resolution; return <article className="seo-audit-card" key={row.product.id}><header><label className="seo-audit-select"><input type="checkbox" checked={selected.includes(row.product.id)} onChange={() => toggle(row.product.id)} /><span>Seleccionar</span></label><div><strong>{row.product.name}</strong><small>{row.family} · {row.subfamily}</small></div><span className={`seo-audit-priority seo-audit-priority--${row.priority}`}>{row.priority === 'high' ? 'Prioridad alta' : row.priority === 'medium' ? 'Prioridad media' : 'Prioridad baja'}</span></header><div className="seo-audit-issues">{row.issues.map((issue) => <div key={issue}><strong>{issue}</strong><span>{issue === 'Sin título SEO' ? 'Falta un título específico para diferenciar esta página en Google.' : issue === 'Sin metadescripción' ? 'Falta un resumen breve que ayude a entender el contenido antes de entrar.' : 'Hay imágenes informativas sin una descripción para lectores de pantalla.'}</span></div>)}</div><div className="seo-audit-card-actions"><span className={`seo-audit-resolution seo-audit-resolution--${status}`}>{status === 'verified' ? 'Verificado' : status === 'published' ? 'Publicado, pendiente de verificar' : status === 'draft' ? 'Borrador guardado' : 'Pendiente'}</span><button type="button" className="btn btn-primary btn-sm" onClick={() => open === row.product.id ? setOpen(null) : generate(row)}>{open === row.product.id ? 'Cerrar solución' : proposals[row.product.id] ? 'Revisar solución' : 'Generar solución'}</button><Link className="btn btn-outline btn-sm" to={`/admin?editar=${encodeURIComponent(row.product.id)}&volver=seo`}>Editar producto</Link></div>{open === row.product.id && <AuditResolution row={row} proposals={proposals[row.product.id] || []} approved={approved[row.product.id] || []} onChange={(key, value) => editProposal(row.product.id, key, value)} onApprove={(key) => approve(row.product.id, key)} onSave={() => saveDrafts([row.product.id])} onPublish={() => publish([row.product.id])} onVerify={() => verify([row.product.id])} onRestore={(entry) => restore(row, entry)} saving={saving} />}</article> })}</div></div>
}

function AuditResolution({ row, proposals, approved, onChange, onApprove, onSave, onPublish, onVerify, onRestore, saving }) { return <section className="seo-audit-resolution-panel"><div className="seo-audit-current"><strong>Contenido actual</strong><span>Nombre: {row.product.name}</span><span>Referencia: {row.product.ref || 'No indicada'}</span><span>Descripción: {row.product.description || 'No hay descripción guardada'}</span></div>{proposals.length ? <div className="seo-audit-proposals"><h4>Propuestas editables</h4>{proposals.map((item) => <article key={item.key} className={approved.includes(item.key) ? 'is-approved' : ''}><div><strong>{item.label}</strong><small>{item.impact}</small></div><label>Propuesta<textarea value={item.proposed} onChange={(event) => onChange(item.key, event.target.value)} rows={2} /></label><p><b>Por qué:</b> {item.reason}</p><button type="button" className={`btn btn-sm ${approved.includes(item.key) ? 'btn-primary' : 'btn-outline'}`} onClick={() => onApprove(item.key)}>{approved.includes(item.key) ? 'Aprobada' : 'Aprobar esta propuesta'}</button></article>)}</div> : <p className="seo-empty">No hay propuesta generada. Pulsa «Generar solución» para prepararla.</p>}<div className="seo-resolution-actions"><button type="button" className="btn btn-outline btn-sm" onClick={onSave} disabled={saving || !approved.length}>Guardar borrador</button><button type="button" className="btn btn-primary btn-sm" onClick={onPublish} disabled={saving || !approved.length}>Publicar corrección</button><button type="button" className="btn btn-ghost btn-sm" onClick={onVerify} disabled={saving}>Verificar resolución</button></div>{row.draft?.history?.length > 0 && <details className="seo-audit-history"><summary>Historial y restauración</summary><ol>{[...row.draft.history].reverse().map((entry, index) => <li key={`${entry.savedAt}-${index}`}><span>{new Date(entry.savedAt).toLocaleString('es-ES')} · {entry.status}</span><button type="button" className="btn btn-ghost btn-sm" onClick={() => onRestore(entry)}>Restaurar</button></li>)}</ol></details>}</section> }

function AuditSection({ audit, updateProduct }) {
  const [selected, setSelected] = useState([])
  const [proposals, setProposals] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const proposalValue = (productId, item) => proposals[`${productId}:${item.key}`] ?? item.proposed
  const setProposal = (productId, item, value) => setProposals((current) => ({ ...current, [`${productId}:${item.key}`]: value }))
  const applyNoindex = async () => {
    if (!selected.length || !window.confirm(`Se guardará noindex en ${selected.length} borrador(es) privados. ¿Continuar?`)) return
    setSaving(true)
    setMessage('')
    try {
      await Promise.all(selected.map((id) => seoDraftRepository.save('product', id, { noindex: true })))
      setMessage(`${selected.length} borrador(es) actualizados.`)
      setSelected([])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }
  const approveAltText = async () => {
    const rows = audit.filter(({ product }) => selected.includes(product.id) && product)
    if (!rows.length || !window.confirm(`Se guardarán propuestas de texto alternativo en ${rows.length} borrador(es) privados. Los textos existentes no se tocarán. ¿Continuar?`)) return
    setSaving(true)
    setMessage('')
    try {
      await Promise.all(rows.map(({ product, altItems }) => {
        const galleryAlt = Object.fromEntries(altItems.filter((item) => item.key.startsWith('gallery-')).map((item) => [item.index, proposalValue(product.id, item)]).filter(([, value]) => value.trim()))
        const main = altItems.find((item) => item.key === 'imageAlt')
        return seoDraftRepository.save('product', product.id, {
          ...(main ? { imageAlt: proposalValue(product.id, main) } : {}),
          ...(Object.keys(galleryAlt).length ? { galleryAlt } : {}),
        })
      }))
      setMessage(`${rows.length} propuesta(s) guardadas como borrador.`)
      setSelected([])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }
  const publishAltText = async () => {
    const rows = audit.filter(({ product }) => selected.includes(product.id))
    if (!rows.length || !window.confirm(`Se publicarán los textos alternativos aprobados en ${rows.length} producto(s). No se sobrescribirán textos existentes. ¿Continuar?`)) return
    setSaving(true)
    setMessage('')
    try {
      await Promise.all(rows.map(async ({ product }) => {
        const draft = await seoDraftRepository.get('product', product.id)
        const fields = draft?.fields || {}
        const next = { ...product }
        if (!next.imageAlt && fields.imageAlt) next.imageAlt = fields.imageAlt
        if (fields.galleryAlt && Array.isArray(next.gallery)) next.gallery = next.gallery.map((image, index) => {
          const normalized = typeof image === 'string' ? { src: image, category: 'Detalle del producto' } : image
          return !normalized.alt && fields.galleryAlt[index] ? { ...normalized, alt: fields.galleryAlt[index] } : image
        })
        await updateProduct(product.id, next)
        await seoDraftRepository.setStatus('product', product.id, 'published')
      }))
      setMessage(`${rows.length} producto(s) publicados. Vuelve a auditar para comprobarlos.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }
  const verify = async () => {
    const unresolved = audit.filter(({ product }) => selected.includes(product.id) && (product.image && !product.imageAlt || (product.gallery || []).some((image) => image.src && !image.alt && !image.decorative && image.category !== 'Decorativa')))
    if (unresolved.length) return setMessage('No se puede verificar: todavía hay imágenes informativas sin texto alternativo.')
    try {
      await Promise.all(selected.map((id) => seoDraftRepository.setStatus('product', id, 'verified')))
      setMessage('Productos marcados como verificados.')
    } catch (error) {
      setMessage(error.message)
    }
  }
  if (!audit.length) return <p className="seo-empty">No hay incidencias internas con el filtro seleccionado.</p>
  return <><div className="seo-audit-help"><details><summary>¿Qué significan estas incidencias?</summary><p><strong>Sin título SEO:</strong> la página no tiene un título específico y puede perder relevancia o diferenciarse peor en Google.</p><p><strong>Sin metadescripción:</strong> falta un resumen útil para el resultado de búsqueda.</p><p><strong>Imagen sin texto alternativo:</strong> una imagen informativa no explica su contenido a lectores de pantalla ni cuando no carga. Las imágenes marcadas como decorativas no se proponen.</p><p>Las propuestas usan únicamente el nombre, referencia y categoría de imagen ya guardados en el producto. No interpretan visualmente la imagen ni inventan características técnicas.</p></details></div><div className="seo-bulk-toolbar"><button className="btn btn-outline btn-sm" disabled={!selected.length || saving} onClick={approveAltText}>Guardar propuestas como borrador</button><button className="btn btn-primary btn-sm" disabled={!selected.length || saving} onClick={publishAltText}>Publicar alt text aprobado</button><button className="btn btn-outline btn-sm" disabled={!selected.length || saving} onClick={verify}>Marcar verificado</button><button className="btn btn-outline btn-sm" disabled={!selected.length || saving} onClick={applyNoindex}>Aplicar noindex al borrador</button>{message && <span>{message}</span>}</div><div className="seo-table-wrap"><table className="admin-table"><thead><tr><th>Seleccionar</th><th>Producto</th><th>Estado</th><th>Incidencias y propuestas</th><th>Acción</th></tr></thead><tbody>{audit.map(({ product, issues, altItems, resolution }) => <tr key={product.id}><td><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggle(product.id)} aria-label={`Seleccionar ${product.name}`} /></td><td><strong>{product.name}</strong><small className="seo-audit-category">{product.category || 'Sin categoría'}</small></td><td>{resolution === 'pending' ? 'Pendiente' : resolution === 'draft' ? 'Borrador' : resolution === 'published' ? 'Publicado' : 'Verificado'}</td><td><div>{issues.join(', ')}</div>{altItems.map((item) => <label className="seo-alt-proposal" key={item.key}><span>{item.label}</span><input value={proposalValue(product.id, item)} onChange={(event) => setProposal(product.id, item, event.target.value)} /></label>)}</td><td><Link className="btn btn-outline btn-sm" to={`/admin?editar=${encodeURIComponent(product.id)}&campo=${encodeURIComponent(altItems[0]?.key === 'imageAlt' ? 'imageAlt' : altItems[0]?.key || 'imageAlt')}&volver=seo`}>Editar</Link></td></tr>)}</tbody></table></div></>
}
function KeywordOpportunities({ opportunities }) { return opportunities.length ? <div className="seo-recommendations">{opportunities.map((row) => <article className="seo-recommendation seo-recommendation--medium" key={`${row.query}-${row.url}`}><span>Oportunidad</span><h4>{row.query}</h4><p>{row.impressions} impresiones, CTR {percent(row.ctr)} y posición media {format(row.position, 1)}.</p><small>{row.url || 'URL no disponible'} · Prioridad: revisar título y metadescripción</small></article>)}</div> : <p className="seo-empty">No hay consultas con suficientes impresiones y posición entre 4 y 20 para proponer una mejora fiable.</p> }
function HistorySection({ drafts, setDrafts }) { const verify = async (draft) => { await seoDraftRepository.setStatus(draft.entityType, draft.entityId, 'verified'); setDrafts((current) => current.map((item) => item.id === draft.id ? { ...item, status: 'verified' } : item)) }; return drafts.length ? <div className="seo-table-wrap"><table className="admin-table"><thead><tr><th>Entidad</th><th>Estado</th><th>Actualizado</th><th>Versiones</th><th>Acción</th></tr></thead><tbody>{drafts.map((draft) => <tr key={draft.id}><td>{draft.entityType} · {draft.entityId}</td><td>{draft.status || 'draft'}</td><td>{draft.updatedAt?.toDate ? draft.updatedAt.toDate().toLocaleString('es-ES') : 'Pendiente'}</td><td>{draft.history?.length || 0}</td><td>{draft.status === 'published' ? <button className="btn btn-outline btn-sm" onClick={() => verify(draft)}>Marcar verificado</button> : '—'}</td></tr>)}</tbody></table></div> : <p className="seo-empty">Todavía no hay borradores SEO guardados.</p> }
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
