import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'
import { useAuth } from '../../application/identity/AuthContext'
import { analyticsDataConfig, connectAnalytics, fetchAnalyticsReport, isAnalyticsConnected } from '../../infrastructure/analytics/googleAnalyticsDataClient.js'
import { connectSearchConsole, fetchSearchConsoleReport, isSearchConsoleConnected, searchConsoleConfig } from '../../infrastructure/seo/searchConsoleClient.js'
import { optimizationHistoryRepository } from '../../infrastructure/optimization/optimizationHistoryRepository.js'
import { analyseEntity, normalizeFields } from './SeoEditor.jsx'
import { seoDraftRepository } from '../../infrastructure/seo/seoDraftRepository.js'

const period = { startDate: daysAgo(27), endDate: daysAgo(0) }
const number = (value) => value == null ? '—' : Number(value).toLocaleString('es-ES', { maximumFractionDigits: 2 })
const percent = (value) => value == null ? '—' : `${number(value * 100)}%`

function daysAgo(amount) {
  const value = new Date()
  value.setDate(value.getDate() - amount)
  return value.toISOString().slice(0, 10)
}

export default function OptimizationDashboard() {
  const { products, updateProduct } = useProducts()
  const { getCategoryPathLabel } = useCategories()
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [searchConsole, setSearchConsole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [form, setForm] = useState({ title: '', target: '', action: '', notes: '', metricType: 'analytics.sessions' })
  const [proposalTarget, setProposalTarget] = useState(null)
  const [taskStates, setTaskStates] = useState({})

  const load = useCallback(async () => {
    setLoading(true); setMessage('')
    const [analyticsResult, searchResult] = await Promise.allSettled([
      isAnalyticsConnected() ? fetchAnalyticsReport(period) : Promise.resolve(null),
      isSearchConsoleConnected() ? fetchSearchConsoleReport({ period: '28d' }) : Promise.resolve(null),
    ])
    setAnalytics(analyticsResult.status === 'fulfilled' ? analyticsResult.value?.data || null : null)
    setSearchConsole(searchResult.status === 'fulfilled' ? searchResult.value?.data || null : null)
    setLoading(false)
  }, [])

  useEffect(() => { optimizationHistoryRepository.list().then(setHistory) }, [])
  useEffect(() => { load() }, [load])

  const recommendations = useMemo(() => buildRecommendations({ analytics, searchConsole, products, getCategoryPathLabel, history }), [analytics, searchConsole, products, getCategoryPathLabel, history])
  const connectAll = async () => {
    setLoading(true); setMessage('')
    try {
      if (!isAnalyticsConnected() && analyticsDataConfig.isConfigured) await connectAnalytics({ loginHint: user?.email })
      if (!isSearchConsoleConnected() && searchConsoleConfig.isConfigured) await connectSearchConsole({ loginHint: user?.email })
      await load()
    } catch (error) { setMessage(error.message || 'No se pudo conectar una fuente de datos.') } finally { setLoading(false) }
  }
  const registerImprovement = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.action.trim()) return
    const metric = currentMetric(form.metricType, { analytics, searchConsole })
    const entry = await optimizationHistoryRepository.save({ ...form, title: form.title.trim(), target: form.target.trim() || 'General', action: form.action.trim(), notes: form.notes.trim(), baselineValue: metric.value, baselineLabel: metric.label, createdAt: new Date().toISOString() })
    setHistory((current) => [entry, ...current].slice(0, 100)); setForm({ title: '', target: '', action: '', notes: '', metricType: 'analytics.sessions' }); setMessage('Mejora registrada. No se ha cambiado ningún contenido automáticamente.')
  }

  return <section className="optimization-dashboard">
    <header className="optimization-heading"><div><span className="admin-kicker">Mejora continua · datos reales</span><h2>Asistente de mejora web</h2><p className="muted">Detecta qué merece atención y decide tú qué cambios aplicar. Esta sección nunca modifica el sitio por sí sola.</p></div><div className="optimization-actions"><button className="btn btn-primary btn-sm" onClick={connectAll} disabled={loading}>{loading ? 'Consultando…' : 'Actualizar datos'}</button><button className="btn btn-outline btn-sm" onClick={() => setShowHistory((value) => !value)}>{showHistory ? 'Ocultar historial' : 'Ver historial'}</button></div></header>
    <SourceStatus analytics={analytics} searchConsole={searchConsole} />
    {message && <p className="optimization-message" role="status">{message}</p>}
    <section className="optimization-explainer"><strong>Cómo se decide una recomendación</strong><span>Solo se muestra cuando hay una señal medible y suficiente. «Confirmado» significa que la comprobación lo demuestra; «Revisar» indica una posible causa que necesita comprobarse antes de actuar. El asistente usa reglas y datos del sitio; no necesita una cuenta de inteligencia artificial ni expone claves privadas.</span></section>
    <section className="optimization-list"><div className="optimization-section-heading"><h3>Problemas y oportunidades detectadas</h3><span>{recommendations.length} resultado{recommendations.length === 1 ? '' : 's'}</span></div>{recommendations.length ? recommendations.map((item) => <RecommendationCard key={item.id} item={item} onRegister={() => setForm({ title: item.title, target: item.target, action: item.action, notes: '', metricType: item.metricType })} onAssist={() => item.product && setProposalTarget(item.product)} />) : <p className="optimization-empty">No hay recomendaciones suficientemente justificadas con las fuentes conectadas.</p>}</section>
    <TaskPlan recommendations={recommendations} states={taskStates} setStates={setTaskStates} />
    <ImprovementForm form={form} setForm={setForm} onSubmit={registerImprovement} />
    {showHistory && <History history={history} sources={{ analytics, searchConsole }} products={products} onOpen={(product) => setProposalTarget(product)} />}
    {proposalTarget && <ProposalEditor product={proposalTarget} history={history} updateProduct={updateProduct} onHistory={(entry) => setHistory((current) => [entry, ...current])} onPublished={() => { setProposalTarget(null); setShowHistory(true); setMessage('Cambio publicado y producto reevaluado. La lista se ha actualizado automáticamente; los resultados de Google quedan en seguimiento.') }} onClose={() => setProposalTarget(null)} />}
  </section>
}

function SourceStatus({ analytics, searchConsole }) {
  return <div className="optimization-sources"><span className={analytics ? 'is-ready' : ''}><b /> Google Analytics {analytics ? 'disponible' : 'sin datos conectados'}</span><span className={searchConsole ? 'is-ready' : ''}><b /> Search Console {searchConsole ? 'disponible' : 'sin datos conectados'}</span><span className="is-ready"><b /> Comprobaciones del catálogo disponibles</span></div>
}

function buildRecommendations({ analytics, searchConsole, products, getCategoryPathLabel, history }) {
  const result = []
  const queries = searchConsole?.queries || []
  queries.filter((row) => Number(row.impressions) >= 20 && Number(row.position) >= 4 && Number(row.position) <= 20 && Number(row.ctr) < 0.05).slice(0, 8).forEach((row) => {
    const followedUp = history.some((item) => item.kind === 'content' && item.status === 'published' && targetMatches(item, row.url))
    result.push({ id: `query-${row.query}-${row.url}`, type: followedUp ? 'follow-up' : 'opportunity', confidence: followedUp ? 'follow-up' : 'confirmed', priority: followedUp ? 'low' : row.impressions >= 100 ? 'high' : 'medium', title: followedUp ? `Seguimiento de «${row.query}»` : `Mejorar el resultado para «${row.query}»`, target: row.url || 'Página no identificada', data: `${number(row.impressions)} impresiones, ${number(row.clicks)} clics, CTR ${percent(row.ctr)} y posición media ${number(row.position)}.`, explanation: followedUp ? 'El cambio ya está publicado. Search Console todavía necesita tiempo para volver a rastrear la página y mostrar si el resultado mejora.' : 'Muchas personas ven esta página en Google, pero pocas entran. Un título y un resumen más claros pueden ayudar.', action: followedUp ? 'Esperar datos nuevos y comparar después sin atribuir automáticamente cualquier variación al cambio.' : 'Revisar el título y la descripción de la página para que expliquen mejor qué ofrece.', benefit: 'Más personas podrán entender el resultado y decidir si la página responde a su búsqueda.', link: row.url?.includes('/producto/') ? productLink(row.url) : '/admin?vista=seo', metricType: 'search.impressions' })
  })
  const missing = products.filter((product) => !product.seo?.title || !(product.seo?.description || product.seoDescription) || (product.image && !product.imageAlt))
  missing.slice(0, 12).forEach((product) => {
    const issues = [!product.seo?.title && 'título SEO', !(product.seo?.description || product.seoDescription) && 'descripción SEO', product.image && !product.imageAlt && 'texto alternativo de imagen'].filter(Boolean)
    result.push({ id: `technical-${product.id}`, type: 'problem', confidence: 'confirmed', priority: issues.includes('título SEO') ? 'high' : 'medium', title: `Completar ${issues.join(', ')}`, target: `${product.name}${getCategoryPathLabel(product.category) ? ` · ${getCategoryPathLabel(product.category)}` : ''}`, data: `Comprobación del catálogo: ${issues.length} campo${issues.length === 1 ? '' : 's'} vacío${issues.length === 1 ? '' : 's'}.`, explanation: 'La ficha tiene información que puede faltar en buscadores o para personas que usan lectores de pantalla.', action: 'Revisar la ficha y guardar únicamente información real del producto.', benefit: 'La ficha será más clara y completa para visitantes y buscadores.', link: `/admin?editar=${encodeURIComponent(product.id)}&volver=optimization`, metricType: 'analytics.views', product })
  })
  if (analytics?.total?.sessions >= 100 && analytics.events && !Object.prototype.hasOwnProperty.call(analytics.events, 'quote_request_success')) result.push({ id: 'quote-event-review', type: 'review', confidence: 'needs-review', priority: 'medium', title: 'Revisar la medición de solicitudes de presupuesto', target: 'Formulario de presupuesto', data: `${number(analytics.total.sessions)} sesiones en el periodo, pero el evento de solicitud enviada no aparece.`, explanation: 'Puede que no haya solicitudes o que la confirmación no esté llegando a Analytics. No se puede concluir cuál de las dos causas es la correcta.', action: 'Comprobar manualmente un envío y revisar la configuración del evento antes de tomar decisiones comerciales.', benefit: 'Permitirá distinguir entre falta de solicitudes y un problema de medición.', codeInstructions: 'Revisión en OpenCode:\n1. Abrir src/presentation/pages/SolicitarPresupuesto.jsx.\n2. Confirmar que quote_request_success solo se envía después de una respuesta correcta del servicio.\n3. No duplicar el evento ni enviarlo al cargar la página.\n4. Probar un envío real con consentimiento y comprobarlo en DebugView de GA4.\n5. Comparar después con este informe.', link: '/admin?vista=configuracion&volver=optimization', metricType: 'analytics.sessions' })
  return result
}

function productLink(url = '') { const match = url.match(/\/producto\/([^/?#]+)/); return match ? `/admin?editar=${encodeURIComponent(match[1])}&volver=optimization` : '/admin?vista=seo' }
function targetMatches(item, url = '') { return Boolean(url && ((item.target && url === item.target) || (item.targetId && url.includes(`/producto/${item.targetId}`)))) }
function currentMetric(type, { analytics, searchConsole }) { const [source, key] = type.split('.'); const value = source === 'search' ? searchConsole?.summary?.[key] : analytics?.total?.[key]; return { value: value ?? null, label: source === 'search' ? `Search Console · ${key}` : `Google Analytics · ${key}` } }
function RecommendationCard({ item, onRegister, onAssist }) { return <article className={`optimization-card optimization-card--${item.priority}`}><div className="optimization-card-top"><span className={`optimization-badge optimization-badge--${item.confidence}`}>{item.confidence === 'confirmed' ? 'Confirmado' : 'Revisar'}</span><span className="optimization-priority">Prioridad {item.priority === 'high' ? 'alta' : item.priority === 'medium' ? 'media' : 'baja'}</span></div><h4>{item.title}</h4><p><strong>Afecta a:</strong> {item.target}</p><p><strong>Datos:</strong> {item.data}</p><p>{item.explanation}</p><p><strong>Qué hacer:</strong> {item.action}</p><p><strong>Beneficio esperado:</strong> {item.benefit}</p>{item.codeInstructions && <details className="optimization-code"><summary>Necesita revisión de código</summary><pre>{item.codeInstructions}</pre><button type="button" className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(item.codeInstructions)}>Copiar instrucciones para OpenCode</button></details>}<div className="optimization-card-actions">{onAssist && <button className="btn btn-primary btn-sm" onClick={onAssist}>Preparar solución</button>}{item.link && <Link className="btn btn-outline btn-sm" to={item.link}>Abrir edición</Link>}<button className="btn btn-ghost btn-sm" onClick={onRegister}>Registrar mejora realizada</button></div></article> }
function TaskPlan({ recommendations, states, setStates }) { return <section className="optimization-task-plan"><div className="optimization-section-heading"><h3>Plan de tareas</h3><span>Ordenado por prioridad</span></div>{recommendations.length ? <div className="optimization-task-list">{recommendations.slice(0, 20).map((item) => <div key={item.id}><span className={`optimization-priority optimization-priority--${item.priority}`}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}</span><strong>{item.title}</strong><small>Dificultad: {item.product ? 'Baja' : item.codeInstructions ? 'Media' : 'Baja'}</small><select value={states[item.id] || 'pending'} onChange={(event) => setStates((current) => ({ ...current, [item.id]: event.target.value }))}><option value="pending">Pendiente</option><option value="in_progress">En curso</option><option value="done">Completada</option><option value="rejected">Descartada</option></select><span>{item.action}</span></div>)}</div> : <p className="optimization-empty">No hay tareas justificadas por ahora.</p>}</section> }
function ProposalEditor({ product, history, updateProduct, onHistory, onPublished, onClose }) {
  const base = normalizeFields(product, product.seo || {})
  const sourceProposals = analyseEntity('product', product, base)
  const [values, setValues] = useState(() => Object.fromEntries(sourceProposals.map((item) => [item.key, item.recommended])))
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const previous = history.find((item) => item.kind === 'content' && item.targetId === product.id && item.status === 'published')
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  const fieldsForDraft = () => ({ ...values, secondaryKeywords: String(values.secondaryKeywords || '').split(',').map((item) => item.trim()).filter(Boolean) })
  const saveDraft = async () => {
    setSaving(true); setStatus('')
    try { await seoDraftRepository.save('product', product.id, fieldsForDraft()); setStatus('Propuesta guardada como borrador. Todavía no está publicada.') } catch (error) { setStatus(error.message || 'No se pudo guardar el borrador.') } finally { setSaving(false) }
  }
  const publish = async () => {
    if (!window.confirm('Se publicará esta propuesta en el catálogo. ¿Quieres continuar?')) return
    setSaving(true); setStatus('')
    const before = { seo: product.seo || {}, imageAlt: product.imageAlt || '' }
    const { imageAlt, ...seoFields } = fieldsForDraft()
    const after = { seo: { ...(product.seo || {}), ...seoFields }, imageAlt: imageAlt || '' }
    try {
      await updateProduct(product.id, { ...product, seo: after.seo, imageAlt: after.imageAlt })
      const entry = await optimizationHistoryRepository.save({ kind: 'content', status: 'published', title: 'Propuesta aplicada', target: product.name, targetId: product.id, action: 'Se publicó una propuesta revisada desde el asistente.', before, after, createdAt: new Date().toISOString() })
      onHistory(entry); setStatus('Cambio publicado. Puedes volver al estado anterior desde este asistente.'); onPublished?.()
    } catch (error) { setStatus(error.message || 'No se pudo publicar el cambio.') } finally { setSaving(false) }
  }
  const restore = async () => {
    if (!previous || !window.confirm('Se restaurará la versión anterior de esta propuesta. ¿Continuar?')) return
    setSaving(true)
    try { await updateProduct(product.id, { ...product, seo: previous.before.seo, imageAlt: previous.before.imageAlt }); setStatus('Versión anterior restaurada.'); const entry = await optimizationHistoryRepository.save({ kind: 'content', status: 'restored', title: 'Versión anterior restaurada', target: product.name, targetId: product.id, action: 'Se restauró una versión anterior desde el asistente.', createdAt: new Date().toISOString() }); onHistory(entry) } catch (error) { setStatus(error.message || 'No se pudo restaurar la versión.') } finally { setSaving(false) }
  }
  return <div className="optimization-overlay" role="dialog" aria-modal="true" aria-label={`Propuesta para ${product.name}`}><div className="optimization-proposal"><header><div><span className="admin-kicker">Asistente de mejora</span><h3>Revisar propuesta para {product.name}</h3><p>Los textos se han preparado usando únicamente el nombre, referencia, categoría y contenido existente.</p></div><button className="btn btn-ghost btn-sm" onClick={onClose}>Cerrar</button></header><div className="optimization-proposal-list">{sourceProposals.map((proposal) => <article key={proposal.key}><h4>{proposal.label}</h4><div className="optimization-comparison"><div><span>Contenido actual</span><p>{proposal.current}</p></div><div><span>Propuesta editable</span>{proposal.key === 'content' ? <textarea value={values[proposal.key] || ''} onChange={(event) => update(proposal.key, event.target.value)} /> : <input value={values[proposal.key] || ''} onChange={(event) => update(proposal.key, event.target.value)} />}</div></div><small>{proposal.reason} Beneficio esperado: {proposal.benefit}</small></article>)}</div><div className="optimization-proposal-actions"><button className="btn btn-outline btn-sm" onClick={saveDraft} disabled={saving}>Guardar borrador</button><button className="btn btn-primary btn-sm" onClick={publish} disabled={saving}>Aprobar y publicar</button>{previous && <button className="btn btn-ghost btn-sm" onClick={restore} disabled={saving}>Recuperar versión anterior</button>}<button className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>Rechazar propuesta</button></div>{status && <p className="optimization-message" role="status">{status}</p>}<p className="optimization-safety">Rechazar o cerrar no guarda nada. Publicar requiere tu confirmación explícita.</p></div></div>
}
function ImprovementForm({ form, setForm, onSubmit }) { return <section className="optimization-form"><div className="optimization-section-heading"><h3>Registrar una mejora</h3><span>Acción manual</span></div><p>Guarda qué cambiaste y el dato que quieres comparar después. Registrar no modifica productos ni configuración.</p><form onSubmit={onSubmit}><label>Qué se ha mejorado<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required placeholder="Ej.: Mejorar título de producto" /></label><label>Producto, categoría o página<input value={form.target} onChange={(event) => setForm({ ...form, target: event.target.value })} placeholder="Ej.: /producto/123" /></label><label>Cambio realizado<input value={form.action} onChange={(event) => setForm({ ...form, action: event.target.value })} required placeholder="Ej.: Se aclaró el título y se añadió la referencia" /></label><label>Dato a comparar<select value={form.metricType} onChange={(event) => setForm({ ...form, metricType: event.target.value })}><option value="analytics.sessions">GA4 · Sesiones</option><option value="analytics.activeUsers">GA4 · Visitantes</option><option value="analytics.views">GA4 · Páginas vistas</option><option value="search.impressions">Search Console · Impresiones</option><option value="search.clicks">Search Console · Clics</option><option value="search.ctr">Search Console · CTR</option></select></label><label>Notas<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label><button className="btn btn-primary btn-sm">Guardar en historial</button></form></section> }
function History({ history, sources, products, onOpen }) { return <section className="optimization-history"><div className="optimization-section-heading"><h3>Historial de mejoras</h3><span>Antes y después</span></div>{history.length ? history.map((item) => { if (item.kind === 'content') { const product = products.find((candidate) => candidate.id === item.targetId); return <article className="optimization-history-item" key={item.id}><div><strong>{item.title}</strong><span>{item.target} · {new Date(item.createdAt).toLocaleDateString('es-ES')}</span></div><p>{item.action}</p><small>Estado: <b>{item.status === 'restored' ? 'versión anterior restaurada' : 'publicado'}</b>. Google puede tardar en rastrear el cambio; la atribución del resultado requiere datos posteriores.</small><details><summary>Ver contenido anterior y nuevo</summary><div className="optimization-history-content"><span><b>Antes</b>{item.before?.seo?.title || item.before?.seo?.description || item.before?.imageAlt || 'Sin contenido guardado'}</span><span><b>Después</b>{item.after?.seo?.title || item.after?.seo?.description || item.after?.imageAlt || 'Sin contenido guardado'}</span></div></details>{product && <button className="btn btn-ghost btn-sm" onClick={() => onOpen(product)}>Ver y recuperar versión</button>}</article> } const current = currentMetric(item.metricType, sources).value; const comparable = current != null && item.baselineValue != null; return <article className="optimization-history-item" key={item.id}><div><strong>{item.title}</strong><span>{item.target} · {new Date(item.createdAt).toLocaleDateString('es-ES')}</span></div><p>{item.action}</p><small>{item.baselineLabel}: antes <b>{number(item.baselineValue)}</b>{comparable ? <> · ahora <b>{number(current)}</b> · {number(current - item.baselineValue)} de diferencia</> : ' · pendiente de datos posteriores'}</small>{item.notes && <small>{item.notes}</small>}</article> }) : <p className="optimization-empty">Todavía no hay mejoras registradas.</p>}</section> }
