import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'
import { connectSearchConsole, disconnectSearchConsole, fetchSearchConsoleReport, inspectSearchConsoleUrl, isSearchConsoleConnected, searchConsoleConfig } from '../../infrastructure/seo/searchConsoleClient.js'

const EMPTY = null
const periodOptions = [['7d', 'Últimos 7 días'], ['28d', 'Últimos 28 días'], ['90d', 'Últimos 90 días'], ['6m', 'Últimos 6 meses'], ['12m', 'Últimos 12 meses'], ['custom', 'Fechas personalizadas']]
const format = (value, digits = 0) => value == null ? '—' : Number(value).toLocaleString('es-ES', { maximumFractionDigits: digits })
const percent = (value) => value == null ? '—' : `${format(value * 100, 2)}%`

export default function SeoDashboard() {
  const { products } = useProducts()
  const { getCategoryPathLabel } = useCategories()
  const [period, setPeriod] = useState('28d')
  const [dates, setDates] = useState({ startDate: '', endDate: '' })
  const [report, setReport] = useState(EMPTY)
  const [connected, setConnected] = useState(isSearchConsoleConnected())
  const [status, setStatus] = useState(searchConsoleConfig.isConfigured ? 'disconnected' : 'not-configured')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('clicks')
  const [auditFilter, setAuditFilter] = useState('all')
  const [inspection, setInspection] = useState(null)
  const [inspectionStatus, setInspectionStatus] = useState('idle')

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

  const connect = async () => {
    setStatus('authorizing')
    setError('')
    try {
      await connectSearchConsole()
      setConnected(true)
      await load(true)
    } catch (connectError) {
      setStatus('error')
      setError(connectError.message)
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
      setInspection(await inspectSearchConsoleUrl(url))
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
    const issues = []
    if (!product.seoTitle && !product.name) issues.push('Sin título SEO')
    if (!product.seoDescription && !product.description) issues.push('Sin metadescripción')
    if (!product.image || !product.imageAlt) issues.push('Imagen sin texto alternativo')
    return { product, issues }
  }).filter(({ issues }) => auditFilter === 'all' ? issues.length : issues.includes(auditFilter)), [products, auditFilter])

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
    <div className="seo-toolbar"><label>Periodo<select value={period} onChange={(event) => setPeriod(event.target.value)}>{periodOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{period === 'custom' && <><label>Desde<input type="date" value={dates.startDate} onChange={(event) => setDates({ ...dates, startDate: event.target.value })} /></label><label>Hasta<input type="date" value={dates.endDate} onChange={(event) => setDates({ ...dates, endDate: event.target.value })} /></label></>}<button className="btn btn-primary btn-sm" onClick={load}>Actualizar</button></div>
    <ConnectionStatus status={status} error={error} lastSync={report?.lastSync} onConnect={connect} onDisconnect={disconnect} />
    <div className="seo-stats">{metricCards.map(([label, value, explanation]) => <div className="seo-stat" key={label} title={explanation} tabIndex="0"><span>{label} <small aria-hidden="true">ⓘ</small></span><strong>{value}</strong></div>)}</div>
    <div className="seo-meta-row"><span>Última sincronización: <strong>{report?.lastSync ? new Date(report.lastSync).toLocaleString('es-ES') : 'Pendiente'}</strong></span><span>Sitemap: <strong>{report?.sitemap?.status || 'Pendiente de sincronización'}</strong></span><span>Errores de sitemap: <strong>{report?.sitemap?.errors == null ? 'Pendiente' : report.sitemap.errors}</strong></span></div>
    <Panel title="Evolución" note="Las series se muestran únicamente cuando la API devuelve datos del periodo seleccionado."><div className="seo-chart-grid">{[['clicks', 'Clics'], ['impressions', 'Impresiones'], ['ctr', 'CTR'], ['position', 'Posición media'], ['indexed', 'Indexación']].map(([key, label]) => <Chart key={key} data={report?.timeline} metric={key} label={label} />)}</div></Panel>
    <Panel title="Palabras clave" action={<button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!queries.length}>Exportar CSV</button>}>
      <div className="seo-table-tools"><input placeholder="Buscar consulta..." value={query} onChange={(event) => setQuery(event.target.value)} /><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="clicks">Ordenar por clics</option><option value="impressions">Ordenar por impresiones</option><option value="position">Ordenar por posición</option></select></div>
      <DataTable rows={queries} /></Panel>
    <Panel title="Posicionamiento de productos" note="La relación se hace con las URLs devueltas por Search Console; no se asignan métricas por aproximación."><ProductTable products={products} rows={report?.pages || []} getCategoryPathLabel={getCategoryPathLabel} /></Panel>
    <Panel title="Control de indexación" note="Recuentos de inspecciones individuales. No representan el informe global de cobertura de Google."><Inspection inspection={inspection} onInspect={inspect} status={inspectionStatus} /></Panel>
    <Panel title="Auditoría SEO interna" note="Comprobaciones locales sobre Firestore. Son independientes de Google Search Console."><div className="seo-table-tools"><select value={auditFilter} onChange={(event) => setAuditFilter(event.target.value)}><option value="all">Todas las incidencias</option><option>Sin título SEO</option><option>Sin metadescripción</option><option>Imagen sin texto alternativo</option></select></div>{audit.length ? <table className="admin-table"><thead><tr><th>Producto</th><th>Familia</th><th>Incidencias</th><th>Acción</th></tr></thead><tbody>{audit.map(({ product, issues }) => <tr key={product.id}><td>{product.name}</td><td>{getCategoryPathLabel(product.category)}</td><td>{issues.join(', ')}</td><td><Link to={`/admin?editar=${product.id}`}>Editar</Link></td></tr>)}</tbody></table> : <p className="seo-empty">No hay incidencias internas con el filtro seleccionado.</p>}</Panel>
    <Recommendations report={report} />
  </section>
}

function ConnectionStatus({ status, error, lastSync, onConnect, onDisconnect }) { const labels = { loading: 'Sincronizando...', authorizing: 'Esperando autorización de Google...', connected: 'Conectado con Google Search Console', disconnected: 'Cuenta de Google no conectada', 'not-configured': 'OAuth no configurado', unauthenticated: 'Sesión no válida', error: 'No se pudo sincronizar' }; return <div className={`seo-connection seo-connection--${status}`}><span className="seo-dot" /> <strong>{labels[status]}</strong>{error && <span>{error}</span>}{['disconnected', 'error', 'unauthenticated'].includes(status) && <button className="btn btn-primary btn-sm" onClick={onConnect}>{status === 'disconnected' ? 'Conectar con Google Search Console' : 'Volver a conectar'}</button>}{status === 'connected' && <button className="btn btn-ghost btn-sm" onClick={onDisconnect}>Desconectar</button>}{status === 'not-configured' && <span>Configura VITE_GOOGLE_OAUTH_CLIENT_ID para autorizar la cuenta.</span>}{lastSync && <span>Última respuesta: {new Date(lastSync).toLocaleString('es-ES')}</span>}</div> }
function Panel({ title, note, action, children }) { return <section className="seo-panel"><div className="seo-panel-heading"><div><h3>{title}</h3>{note && <p>{note}</p>}</div>{action}</div>{children}</section> }
function Chart({ data, metric, label }) { if (!data?.length) return <div className="seo-chart"><strong>{label}</strong><p className="seo-empty">Sin datos</p></div>; const max = Math.max(...data.map((point) => Number(point[metric] ?? 0)), 1); return <div className="seo-chart" role="img" aria-label={`Evolución de ${label}`}><strong>{label}</strong><div className="seo-chart-bars">{data.map((point) => <div className="seo-chart-point" style={{ height: `${Math.max(4, (Number(point[metric] ?? 0) / max) * 100)}%` }} title={`${point.date}: ${point[metric] ?? '—'}`} key={point.date} />)}</div><div className="seo-chart-labels"><span>{data[0].date}</span><span>{data[data.length - 1].date}</span></div></div> }
function DataTable({ rows }) { if (!rows.length) return <p className="seo-empty">No hay consultas disponibles para este periodo.</p>; return <div className="seo-table-wrap"><table className="admin-table"><thead><tr><th>Palabra clave</th><th>Clics</th><th>Impresiones</th><th>CTR</th><th>Posición</th><th>Variación</th><th>URL</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row.query}-${row.url}`}><td><strong>{row.query}</strong></td><td>{format(row.clicks)}</td><td>{format(row.impressions)}</td><td>{percent(row.ctr)}</td><td>{format(row.position, 1)}</td><td>{row.variation == null ? '—' : format(row.variation, 1)}</td><td>{row.url ? <a href={row.url} target="_blank" rel="noreferrer">Ver ↗</a> : '—'}</td></tr>)}</tbody></table></div> }
function ProductTable({ products, rows, getCategoryPathLabel }) { const byUrl = new Map(rows.map((row) => [row.url, row])); const visible = products.map((product) => ({ product, row: rows.find((item) => item.url?.includes(`/producto/${product.id}`)) || byUrl.get(product.publicUrl) })).filter(({ row }) => row); if (!visible.length) return <p className="seo-empty">No hay páginas de producto devueltas por la API en este periodo.</p>; return <div className="seo-table-wrap"><table className="admin-table"><thead><tr><th>Producto</th><th>Referencia</th><th>Familia</th><th>Clics</th><th>Impresiones</th><th>CTR</th><th>Posición</th><th>Indexación</th></tr></thead><tbody>{visible.map(({ product, row }) => <tr key={product.id}><td><div className="seo-product"><img src={product.image || 'images/placeholder.svg'} alt={product.imageAlt || product.name} /><strong>{product.name}</strong></div></td><td>{product.ref || '—'}</td><td>{getCategoryPathLabel(product.category)}</td><td>{format(row.clicks)}</td><td>{format(row.impressions)}</td><td>{percent(row.ctr)}</td><td>{format(row.position, 1)}</td><td>{row.indexingStatus || 'Pendiente de inspección'}</td></tr>)}</tbody></table></div> }
function Inspection({ inspection, onInspect, status }) { const [url, setUrl] = useState('https://boralba.es/'); return <div className="seo-inspection"><form className="seo-inspection-form" onSubmit={(event) => { event.preventDefault(); onInspect(url) }}><label>Inspeccionar URL<input type="url" value={url} onChange={(event) => setUrl(event.target.value)} /></label><button className="btn btn-primary btn-sm" disabled={status === 'loading'}>{status === 'loading' ? 'Comprobando…' : 'Comprobar URL'}</button></form>{inspection?.error && <p className="seo-inline-error">{inspection.error}</p>}{inspection && !inspection.error && <div className="seo-inspection-result"><strong>{inspection.verdict || 'Sin veredicto'}</strong><span>{inspection.coverageState || 'Estado de cobertura no disponible'}</span><span>Indexación: {inspection.indexingState || '—'}</span><span>Último rastreo: {inspection.lastCrawlTime ? new Date(inspection.lastCrawlTime).toLocaleString('es-ES') : '—'}</span><span>Canónica Google: {inspection.googleCanonical || '—'}</span></div>}<a href="https://search.google.com/search-console?resource_id=https%3A%2F%2Fboralba.es%2F" target="_blank" rel="noreferrer">Abrir informes y solicitar indexación en Search Console ↗</a></div> }
function Recommendations({ report }) { const recommendations = report?.recommendations || []; return <Panel title="Recomendaciones de mejora" note="Solo se muestran recomendaciones calculadas por el backend a partir de datos reales.">{recommendations.length ? <div className="seo-recommendations">{recommendations.map((item) => <article className={`seo-recommendation seo-recommendation--${item.priority}`} key={`${item.url}-${item.title}`}><span>{item.priority}</span><h4>{item.title}</h4><p>{item.problem}</p><small>{item.url} · Métrica: {item.metric}</small></article>)}</div> : <p className="seo-empty">No hay recomendaciones disponibles sin datos reales suficientes.</p>}</Panel> }
const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
