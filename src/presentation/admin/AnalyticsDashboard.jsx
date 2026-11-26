import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../application/identity/AuthContext'
import { analyticsDataConfig, canResumeAnalytics, connectAnalytics, disconnectAnalytics, fetchAnalyticsReport, isAnalyticsConnected } from '../../infrastructure/analytics/googleAnalyticsDataClient.js'

const fmt = (value) => value == null ? '—' : Number(value).toLocaleString('es-ES', { maximumFractionDigits: 1 })
const date = (offset) => { const value = new Date(); value.setDate(value.getDate() - offset); return value.toISOString().slice(0, 10) }
const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
const eventLabels = { add_to_quote: 'Productos añadidos al presupuesto', quote_request_start: 'Solicitudes iniciadas', quote_request_success: 'Solicitudes enviadas', contact_form_success: 'Formularios de contacto enviados', remove_from_quote: 'Productos retirados', file_download: 'Descargas de fichas', search: 'Búsquedas internas', view_item: 'Visitas a productos', click_phone: 'Clics en teléfono', click_email: 'Clics en correo' }

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const [range, setRange] = useState({ startDate: date(27), endDate: date(0) })
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState(analyticsDataConfig.isConfigured ? (isAnalyticsConnected() ? 'connected' : 'disconnected') : 'not-configured')
  const [error, setError] = useState('')
  const [sort, setSort] = useState('views')
  const resumeTried = useRef(false)

  const load = useCallback(async () => {
    setStatus('loading'); setError('')
    try { const result = await fetchAnalyticsReport(range); setReport(result.data); setStatus('connected') } catch (loadError) { setStatus('error'); setError(loadError.message) }
  }, [range])
  useEffect(() => {
    if (resumeTried.current || status !== 'disconnected' || !canResumeAnalytics()) return
    resumeTried.current = true
    connectAnalytics({ loginHint: user?.email }).then(load).catch((loadError) => { setStatus(loadError.code === 'consent_required' || loadError.code === 'interaction_required' ? 'requires-consent' : 'disconnected'); setError(loadError.message) })
  }, [load, status, user?.email])
  const connect = async (forceConsent = false) => {
    setStatus('authorizing'); setError('')
    try { await connectAnalytics({ loginHint: user?.email, forceConsent }); await load() } catch (connectError) { setStatus(connectError.code === 'consent_required' || connectError.code === 'interaction_required' ? 'requires-consent' : 'error'); setError(connectError.message) }
  }
  const sortedProducts = useMemo(() => [...(report?.products || [])].sort((a, b) => Number(b[sort] || 0) - Number(a[sort] || 0)), [report, sort])
  const exportCsv = () => {
    const rows = [['Producto', 'Visualizaciones'], ...sortedProducts.map((row) => [row.name, row.views])]
    const blob = new Blob([rows.map((row) => row.map(csv).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'boralba-analitica-productos.csv'; link.click(); URL.revokeObjectURL(url)
  }
  if (status === 'not-configured') return <AnalyticsShell><State title="Analytics no configurado" text="Falta la configuración de conexión. No se muestran datos simulados." /></AnalyticsShell>
  return <AnalyticsShell>
    <header className="analytics-heading"><div><span className="admin-kicker">Medición consentida · GA4</span><h2>Analítica web</h2><p className="muted">Datos reales de la propiedad {analyticsDataConfig.propertyId}. El panel de administración no se mide.</p></div><div className="analytics-actions"><label>Desde<input type="date" value={range.startDate} onChange={(e) => setRange({ ...range, startDate: e.target.value })} /></label><label>Hasta<input type="date" value={range.endDate} onChange={(e) => setRange({ ...range, endDate: e.target.value })} /></label><button className="btn btn-primary btn-sm" onClick={load} disabled={['loading', 'authorizing'].includes(status)}>Actualizar</button><button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!report}>CSV</button></div></header>
    <div className={`analytics-connection analytics-connection--${status}`}><strong>{({ connected: 'Conectado con Google Analytics', disconnected: 'Cuenta de Google no conectada', loading: 'Consultando datos reales…', authorizing: 'Esperando autorización de Google…', 'requires-consent': 'Es necesaria una autorización', error: 'No se pudo consultar Analytics' })[status]}</strong>{error && <span>{error}</span>}{['disconnected', 'error', 'requires-consent'].includes(status) && <button className="btn btn-primary btn-sm" onClick={() => connect(status === 'requires-consent')}>{status === 'requires-consent' ? 'Autorizar Analytics' : 'Conectar Analytics'}</button>}{status === 'connected' && <button className="btn btn-ghost btn-sm" onClick={() => { disconnectAnalytics(); setStatus('disconnected'); setReport(null) }}>Desconectar</button>}</div>
    {status !== 'connected' || !report ? <State title={status === 'loading' ? 'Cargando datos' : 'Conecta Google Analytics'} text={status === 'loading' ? 'Estamos consultando la API de solo lectura.' : 'Autoriza el acceso para consultar estadísticas reales, sin datos ficticios.'} /> : <>
      <Section number="1" title="Resumen general"><Summary report={report} /></Section>
      <Section number="2" title="Procedencia de los visitantes"><Panel title="Canales de entrada" error={report.errors?.sources} state={report.states?.sources}><MiniTable headers={['Canal', 'Visitantes', 'Sesiones']} rows={(report.sources || []).map((r) => [r.name, fmt(r.users), fmt(r.sessions)])} /></Panel></Section>
      <Section number="3" title="Productos, categorías y páginas más visitadas"><div className="analytics-grid"><Panel title="Productos consultados" error={report.errors?.products} state={report.states?.products}><div className="analytics-table-tools"><label>Ordenar <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="views">Visualizaciones</option></select></label><button className="btn btn-outline btn-sm" onClick={exportCsv}>Exportar CSV</button></div><MiniTable headers={['Producto', 'Visitas']} rows={sortedProducts.slice(0, 10).map((r) => [r.id && r.id !== '(sin datos)' ? <Link to={`/admin?editar=${encodeURIComponent(r.id)}&volver=analytics`}>{r.name}</Link> : r.name, fmt(r.views)])} /></Panel><Panel title="Categorías más consultadas" error={report.errors?.categories} state={report.states?.categories}><MiniTable headers={['Categoría', 'Visitas']} rows={(report.categories || []).slice(0, 10).map((r) => [r.name, fmt(r.views)])} /></Panel><Panel title="Páginas de entrada" error={report.errors?.landing} state={report.states?.landing}><MiniTable headers={['Página', 'Sesiones', 'Visitantes']} rows={(report.landing || []).slice(0, 10).map((r) => [r.page, fmt(r.sessions), fmt(r.users)])} /></Panel><Panel title="Búsquedas internas" error={report.errors?.searches} state={report.states?.searches}><MiniTable headers={['Búsqueda', 'Veces']} rows={(report.searches || []).slice(0, 10).map((r) => [r.term, fmt(r.searches)])} /></Panel></div></Section>
      <Section number="4" title="Recorrido de los usuarios y conversiones comerciales"><div className="analytics-grid"><Panel title="Evolución diaria" error={report.errors?.timeline} state={report.states?.timeline}><MiniTable headers={['Fecha', 'Visitantes', 'Sesiones']} rows={(report.timeline || []).slice(-14).map((r) => [r.date, fmt(r.activeUsers), fmt(r.sessions)])} /></Panel><Panel title="Acciones comerciales" error={report.errors?.events} state={report.states?.events}><EventList events={report.events} /></Panel></div></Section>
      <Section number="5" title="Ubicación geográfica y dispositivos"><div className="analytics-grid"><Panel title="Ubicación" error={report.errors?.geography} state={report.states?.geography}><MiniTable headers={['País / ciudad', 'Visitantes', 'Sesiones']} rows={(report.geography || []).slice(0, 10).map((r) => [`${r.country} · ${r.city}`, fmt(r.users), fmt(r.sessions)])} /></Panel><Panel title="Dispositivos" error={report.errors?.devices} state={report.states?.devices}><MiniTable headers={['Dispositivo', 'Visitantes', 'Sesiones']} rows={(report.devices || []).map((r) => [r.name, fmt(r.users), fmt(r.sessions)])} /></Panel></div></Section>
      <Section number="6" title="Diagnóstico y recomendaciones de mejora"><Recommendations report={report} /></Section>
    </>}
  </AnalyticsShell>
}

function Summary({ report }) {
  const total = report.total
  const previous = report.previous
  const cards = [['Visitantes', total?.activeUsers, 'Personas que visitaron la web.'], ['Nuevos', total?.newUsers, 'Visitantes nuevos.'], ['Recurrentes', total?.recurringUsers, 'Visitantes que ya habían vuelto.'], ['Sesiones', total?.sessions, 'Visitas realizadas.'], ['Interacción media', total ? `${fmt(total.averageSessionDuration)} s` : null, 'Tiempo medio de interacción.'], ['Páginas vistas', total?.views, 'Páginas consultadas.']]
  return <><div className="analytics-kpis">{cards.map(([title, value, help]) => { const numericValue = typeof value === 'number'; const delta = numericValue && previous ? change(value, previousMetric(previous, title)) : null; return <div className="analytics-kpi" key={title}><span>{title}</span><strong>{value == null ? '—' : typeof value === 'string' ? value : fmt(value)}</strong><small>{help}</small>{delta != null && <em className={delta >= 0 ? 'is-up' : 'is-down'}>{formatChange(delta)} frente al periodo anterior</em>}</div> })}</div><Panel title="Tendencia del periodo" error={report.errors?.totals} state={report.states?.totals}><MiniTable headers={['Fecha', 'Visitantes', 'Sesiones']} rows={(report.timeline || []).slice(-14).map((r) => [r.date, fmt(r.activeUsers), fmt(r.sessions)])} /></Panel></>
}
function previousMetric(previous, title) { return ({ Visitantes: previous.activeUsers, Nuevos: previous.newUsers, Recurrentes: previous.recurringUsers, Sesiones: previous.sessions, 'Interacción media': previous.averageSessionDuration, 'Páginas vistas': previous.views })[title] }
function change(current, previous) { return previous ? ((current - previous) / previous) * 100 : 0 }
function formatChange(value) { return `${value >= 0 ? '+' : ''}${fmt(value)}%` }
function EventList({ events = {} }) { return <div className="analytics-funnel">{Object.entries(eventLabels).map(([name, label]) => <div key={name}><span>{label}</span><strong>{Object.prototype.hasOwnProperty.call(events, name) ? fmt(events[name]) : 'No observado'}</strong></div>)}</div> }
function Recommendations({ report }) {
  const recommendations = []
  const topSearch = report.searches?.[0]
  const topProduct = report.products?.[0]
  if (topSearch && topSearch.searches >= 3) recommendations.push(<li key="search">La búsqueda «{topSearch.term}» se repite {fmt(topSearch.searches)} veces. Puede indicar que ese producto o respuesta cuesta encontrarlo. Revisa esa categoría o crea un acceso más visible. <Link to="/admin?vista=categorias&volver=analytics">Revisar categorías</Link>. <b>Prioridad media.</b></li>)
  if (topProduct && topProduct.views >= 3 && report.events?.add_to_quote == null) recommendations.push(<li key="product">El producto «{topProduct.name}» recibe visitas, pero no hay registros de añadidos al presupuesto en este periodo. Comprueba que la llamada a la acción sea clara. <Link to={`/admin?editar=${encodeURIComponent(topProduct.id)}&volver=analytics`}>Editar producto</Link>. <b>Prioridad media.</b></li>)
  if (!report.events || !Object.prototype.hasOwnProperty.call(report.events, 'file_download')) recommendations.push(<li key="downloads">No hay descargas de fichas técnicas observadas. No es posible saber si las fichas ayudan hasta registrar o recibir ese evento. <Link to="/admin?vista=configuracion&volver=analytics">Revisar configuración</Link>. <b>Sin recomendación de contenido todavía.</b></li>)
  return <div className="analytics-advisor"><p className="analytics-note">Estas sugerencias solo aparecen cuando hay suficientes datos reales. Cada una indica qué se observa, por qué importa y dónde actuar.</p>{recommendations.length ? <ul className="analytics-recommendations">{recommendations}</ul> : <p className="analytics-empty">Todavía no hay datos suficientes para recomendar cambios con seguridad.</p>}</div>
}
function AnalyticsShell({ children }) { return <section id="admin-analytics-panel" data-analytics-version="ga4" className="analytics-dashboard">{children}</section> }
function Section({ number, title, children }) { return <section className="analytics-section"><div className="analytics-section-heading"><span>{number}</span><h3>{title}</h3></div>{children}</section> }
function State({ title, text }) { return <div className="analytics-state"><strong>{title}</strong><span>{text}</span></div> }
function BlockTitle({ title }) { return <div className="analytics-block-title"><h4>{title}</h4></div> }
function ErrorNote({ error }) { return <div className="analytics-error"><strong>No se pudo consultar este apartado.</strong><details><summary>Detalles técnicos</summary><code>{error.message || String(error)}{error.technical ? `\n${error.technical}` : ''}</code></details></div> }
function Panel({ title, error, state, children }) { return <article className="analytics-panel"><BlockTitle title={title} />{error ? <ErrorNote error={error} /> : state === 'empty' ? <p className="analytics-empty">No hay datos en este periodo.</p> : children}</article> }
function MiniTable({ headers, rows }) { return rows.length ? <div className="analytics-table-wrap"><table className="admin-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${String(row[0])}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div> : <p className="analytics-empty">No hay datos en este periodo.</p> }
