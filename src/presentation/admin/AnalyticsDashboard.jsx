import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../application/identity/AuthContext'
import { analyticsDataConfig, canResumeAnalytics, connectAnalytics, disconnectAnalytics, fetchAnalyticsReport, isAnalyticsConnected } from '../../infrastructure/analytics/googleAnalyticsDataClient.js'

const fmt = (value) => value == null ? '—' : Number(value).toLocaleString('es-ES', { maximumFractionDigits: 1 })
const date = (offset) => { const value = new Date(); value.setDate(value.getDate() - offset); return value.toISOString().slice(0, 10) }
const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const [range, setRange] = useState({ startDate: date(27), endDate: date(0) })
  const [report, setReport] = useState(null)
  const [status, setStatus] = useState(analyticsDataConfig.isConfigured ? (isAnalyticsConnected() ? 'connected' : 'disconnected') : 'not-configured')
  const [error, setError] = useState('')
  const [sort, setSort] = useState('views')
  const resumeTried = useRef(false)

  const load = async () => {
    setStatus('loading'); setError('')
    try { const result = await fetchAnalyticsReport(range); setReport(result.data); setStatus('connected') } catch (loadError) { setStatus('error'); setError(loadError.message) }
  }
  useEffect(() => {
    if (resumeTried.current || status !== 'disconnected' || !canResumeAnalytics()) return
    resumeTried.current = true
    connectAnalytics({ loginHint: user?.email }).then(async () => {
      try { const result = await fetchAnalyticsReport(range); setReport(result.data); setStatus('connected') } catch (loadError) { setStatus('error'); setError(loadError.message) }
    }).catch((loadError) => { setStatus(loadError.code === 'consent_required' || loadError.code === 'interaction_required' ? 'requires-consent' : 'disconnected'); setError(loadError.message) })
  }, [status, user?.email, range])
  const connect = async (forceConsent = false) => {
    setStatus('authorizing'); setError('')
    try { await connectAnalytics({ loginHint: user?.email, forceConsent }); await load() } catch (connectError) { setStatus(connectError.code === 'consent_required' || connectError.code === 'interaction_required' ? 'requires-consent' : 'error'); setError(connectError.message) }
  }
  const sortedProducts = useMemo(() => [...(report?.products || [])].sort((a, b) => Number(b[sort] || 0) - Number(a[sort] || 0)), [report, sort])
  const exportCsv = () => {
    const rows = [['Producto', 'Visualizaciones', 'Eventos'], ...sortedProducts.map((row) => [row.name, row.views, row.events])]
    const blob = new Blob([rows.map((row) => row.map(csv).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'boralba-analitica-productos.csv'; link.click(); URL.revokeObjectURL(url)
  }
  const total = report?.total
  const cards = [['Visitantes', total?.activeUsers, 'Personas estimadas que han visitado la web.'], ['Nuevos', total?.newUsers, 'Visitantes que no habían iniciado sesión antes.'], ['Recurrentes', total?.recurringUsers, 'Visitantes que ya habían vuelto a la web.'], ['Sesiones', total?.sessions, 'Visitas completas, aunque una persona haga varias.'], ['Interacción media', total ? `${fmt(total.averageSessionDuration)} s` : null, 'Tiempo medio con la web activa.'], ['Páginas vistas', total?.views, 'Número total de páginas consultadas.']]
  if (status === 'not-configured') return <AnalyticsShell><State title="Analytics no configurado" text="Falta VITE_GOOGLE_OAUTH_CLIENT_ID. El panel no puede consultar Google sin un cliente OAuth." /></AnalyticsShell>
  return <AnalyticsShell>
    <header className="analytics-heading"><div><span className="admin-kicker">Medición consentida · GA4</span><h2>Analítica web</h2><p className="muted">Lectura directa de la propiedad Boralba Lighting - Web. El panel de administración no se mide.</p></div><div className="analytics-actions"><label>Desde<input type="date" value={range.startDate} onChange={(e) => setRange({ ...range, startDate: e.target.value })} /></label><label>Hasta<input type="date" value={range.endDate} onChange={(e) => setRange({ ...range, endDate: e.target.value })} /></label><button className="btn btn-primary btn-sm" onClick={load} disabled={['loading', 'authorizing'].includes(status)}>Actualizar</button><button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={!report}>CSV</button></div></header>
    <div className={`analytics-connection analytics-connection--${status}`}><strong>{({ connected: 'Conectado con Google Analytics', disconnected: 'Cuenta de Google no conectada', loading: 'Consultando datos reales…', authorizing: 'Esperando autorización de Google…', reconnecting: 'Restaurando conexión…', 'requires-consent': 'Es necesaria una autorización', error: 'No se pudo consultar Analytics' })[status]}</strong>{error && <span>{error}</span>}{['disconnected', 'error', 'requires-consent'].includes(status) && <button className="btn btn-primary btn-sm" onClick={() => connect(status === 'requires-consent')}>{status === 'requires-consent' ? 'Autorizar Analytics' : 'Conectar Analytics'}</button>}{status === 'connected' && <button className="btn btn-ghost btn-sm" onClick={() => { disconnectAnalytics(); setStatus('disconnected'); setReport(null) }}>Desconectar</button>}</div>
    {status !== 'connected' || !report ? <State title={status === 'loading' ? 'Cargando datos' : 'Conecta Google Analytics'} text={status === 'loading' ? 'Estamos consultando la API de solo lectura.' : 'Autoriza el acceso para consultar estadísticas reales, sin datos ficticios.'} /> : <>
      <section className="analytics-block"><BlockTitle title="Resumen general" /><div className="analytics-kpis">{cards.map(([title, value, help]) => <div className="analytics-kpi" key={title}><span title={help}>ⓘ {title}</span><strong>{value == null ? '—' : fmt(value)}</strong><small>{help}</small></div>)}</div></section>
      <section className="analytics-grid"><Panel title="Evolución de visitantes y sesiones"><MiniTable headers={['Fecha', 'Visitantes', 'Sesiones']} rows={(report.timeline || []).slice(-14).map((r) => [r.date, fmt(r.activeUsers), fmt(r.sessions)])} /></Panel><Panel title="Embudo de captación comercial"><div className="analytics-funnel">{[['Productos añadidos', report.funnel.addToQuote], ['Solicitudes iniciadas', report.funnel.started], ['Solicitudes enviadas', report.funnel.sent], ['Contactos enviados', report.funnel.contactSent], ['Productos eliminados', report.funnel.removed]].map(([label, value]) => <div key={label}><span>{label} <b title="Evento confirmado por la web">ⓘ</b></span><strong>{fmt(value)}</strong></div>)}</div></Panel></section>
      <section className="analytics-grid"><Panel title="Productos y categorías más populares"><div className="analytics-table-tools"><label>Ordenar <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="views">Visualizaciones</option><option value="events">Eventos</option></select></label><button className="btn btn-outline btn-sm" onClick={exportCsv}>Exportar CSV</button></div><MiniTable headers={['Producto', 'Visualizaciones', 'Eventos']} rows={sortedProducts.slice(0, 10).map((r) => [r.name, fmt(r.views), fmt(r.events)])} /></Panel><Panel title="Búsquedas del catálogo"><MiniTable headers={['Búsqueda', 'Veces']} rows={(report.searches || []).slice(0, 10).map((r) => [r.term, fmt(r.searches)])} /></Panel></section>
      <section className="analytics-grid"><Panel title="Procedencia del tráfico"><MiniTable headers={['Canal', 'Visitantes', 'Sesiones']} rows={(report.sources || []).map((r) => [r.name, fmt(r.users), fmt(r.sessions)])} /></Panel><Panel title="Ubicación geográfica"><MiniTable headers={['País / ciudad', 'Visitantes', 'Sesiones']} rows={(report.geography || []).slice(0, 10).map((r) => [`${r.country} · ${r.city}`, fmt(r.users), fmt(r.sessions)])} /></Panel></section>
      <section className="analytics-grid"><Panel title="Dispositivos"><MiniTable headers={['Dispositivo', 'Visitantes', 'Sesiones']} rows={(report.devices || []).map((r) => [r.name, fmt(r.users), fmt(r.sessions)])} /></Panel><Panel title="Páginas de entrada"><MiniTable headers={['Página', 'Sesiones', 'Visitantes']} rows={(report.landing || []).slice(0, 10).map((r) => [r.page, fmt(r.sessions), fmt(r.users)])} /></Panel></section>
      <section className="analytics-block"><BlockTitle title="Recomendaciones basadas en datos" /><p className="analytics-note">Estas sugerencias se generan solo cuando hay datos reales: revisa primero las páginas de entrada, los productos consultados y las búsquedas sin resultado antes de tomar decisiones.</p><ul className="analytics-recommendations"><li>{report.searches?.length ? `Prioriza contenido para «${report.searches[0].term}», la búsqueda más frecuente.` : 'Todavía no hay suficientes búsquedas para recomendar contenido.'}</li><li>{report.funnel.sent > 0 ? `Los productos añadidos generan ${fmt(report.funnel.sent)} solicitudes enviadas confirmadas.` : 'Aún no hay solicitudes de presupuesto enviadas confirmadas en este periodo.'}</li></ul></section>
    </>}
  </AnalyticsShell>
}
function AnalyticsShell({ children }) { return <section className="analytics-dashboard">{children}</section> }
function State({ title, text }) { return <div className="analytics-state"><strong>{title}</strong><span>{text}</span></div> }
function BlockTitle({ title }) { return <div className="analytics-block-title"><h3>{title}</h3><span title="La información se explica con palabras sencillas">ⓘ</span></div> }
function Panel({ title, children }) { return <article className="analytics-panel"><BlockTitle title={title} />{children}</article> }
function MiniTable({ headers, rows }) { return rows.length ? <div className="analytics-table-wrap"><table className="admin-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div> : <p className="analytics-empty">Sin datos en este periodo.</p> }
