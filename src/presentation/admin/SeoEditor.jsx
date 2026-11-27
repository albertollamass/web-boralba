import { useEffect, useMemo, useState } from 'react'
import { PROJECTS } from '../../domain/showcase/proyectos.js'
import { seoDraftRepository } from '../../infrastructure/seo/seoDraftRepository.js'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'
import { productPath } from '../../domain/catalog/slug'

const PAGES = [['home', '/', 'Página principal'], ['productos', '/productos', 'Catálogo de productos'], ['proyectos', '/proyectos', 'Listado de proyectos'], ['servicios', '/servicios', 'Servicios'], ['empresa', '/empresa', 'Empresa'], ['contacto', '/contacto', 'Contacto'], ['disena-tu-luminaria', '/disena-tu-luminaria', 'Diseña tu luminaria'], ['outlet', '/outlet', 'Outlet']]
export const emptyFields = (entity = {}) => ({ title: entity.seo?.title || '', description: entity.seo?.description || '', h1: entity.seo?.h1 || '', focusKeyword: entity.seo?.focusKeyword || '', secondaryKeywords: (entity.seo?.secondaryKeywords || []).join(', '), content: entity.seo?.content || '', canonical: entity.seo?.canonical || '', noindex: Boolean(entity.seo?.noindex ?? entity.noindex), imageAlt: entity.imageAlt || '' })
export const normalizeFields = (entity, draftFields = {}) => { const fields = { ...emptyFields(entity), ...draftFields }; return { ...fields, secondaryKeywords: Array.isArray(fields.secondaryKeywords) ? fields.secondaryKeywords.join(', ') : String(fields.secondaryKeywords || '') } }
const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim()
const firstSentence = (value) => clean(value).split(/[.!?]/)[0]
const entityPath = (type, entity) => type === 'product' ? productPath(entity) : type === 'category' ? `/categoria/${entity.slug}` : entity.path || `/proyectos/${entity.category || ''}/${entity.slug || entity.id}`
const distinctWords = (values) => [...new Map(values.flatMap((value) => clean(value).split(/[,;|]/)).filter(Boolean).map((value) => [value.toLowerCase(), value])).values()]

export function analyseEntity(type, entity, fields = emptyFields(entity), searchRows = []) {
  const name = clean(entity.name || entity.title)
  if (!name) return []
  const category = clean(entity.category)
  const searchSignal = searchRows.filter((row) => Number(row.impressions || 0) >= 10).sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))[0]
  const titleParts = [name, category].filter((value, index, values) => value && values.findIndex((item) => item.toLowerCase() === value.toLowerCase()) === index)
  const title = `${titleParts.join(' · ')} | Boralba Lighting`
  const description = firstSentence(entity.description || entity.tagline)
  const proposals = []
  if (!fields.title && title) proposals.push({ key: 'title', label: 'Título SEO', current: '(sin título específico)', recommended: title, reason: 'Combina el nombre y la familia existentes sin repetir la referencia.' })
  if (!fields.description && description) proposals.push({ key: 'description', label: 'Metadescripción', current: '(sin descripción específica)', recommended: description, reason: 'Utiliza la descripción real guardada, sin inventar características.' })
  if (!fields.focusKeyword && searchSignal?.query) proposals.push({ key: 'focusKeyword', label: 'Palabra clave objetivo', current: '(sin definir)', recommended: clean(searchSignal.query), reason: `Search Console la ha mostrado ${Number(searchSignal.impressions).toLocaleString('es-ES')} veces para esta URL.` })
  if (!fields.secondaryKeywords && searchRows.length > 1) {
    const queries = distinctWords(searchRows.filter((row) => Number(row.impressions || 0) >= 10).sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0)).slice(0, 4).map((row) => row.query)).filter((value) => value.toLowerCase() !== searchSignal?.query?.toLowerCase())
    if (queries.length) proposals.push({ key: 'secondaryKeywords', label: 'Palabras secundarias', current: '(sin definir)', recommended: queries.join(', '), reason: 'Son consultas reales de Search Console con suficientes impresiones para esta URL.' })
  }
  if (type === 'product' && entity.image && !fields.imageAlt) proposals.push({ key: 'imageAlt', label: 'Texto alternativo', current: '(sin texto alternativo)', recommended: `${name} · imagen del producto`, reason: 'Describe solo lo que se conoce de la ficha, sin atribuir características a la imagen.' })
  return proposals
}

const STATUS_LABELS = { 'not-analyzed': 'Sin analizar', 'no-improvements': 'Ya optimizado', 'proposal-pending': 'Necesita mejoras', 'draft-saved': 'Borrador guardado', publishing: 'Publicación en curso', 'published-web': 'Publicado en la web', 'pending-google': 'Google todavía debe procesarlo', 'published-verified': 'Publicado en la web', 'pending-deployment': 'Pendiente del siguiente despliegue', 'publish-error': 'Error de publicación' }
const statusText = (status) => STATUS_LABELS[status] || STATUS_LABELS['not-analyzed']
const publicCheck = async (type, entity, fields) => {
  if (type !== 'product' && type !== 'category') return { verified: false, reason: 'Este contenido necesita un despliegue editorial.' }
  try {
    const response = await fetch(`${entityPath(type, entity)}?seo_verification=${Date.now()}`, { cache: 'no-store' })
    const html = await response.text()
    return { verified: response.ok && Boolean(fields.title && html.includes(fields.title)), reason: response.ok ? 'La página responde, pero el HTML público todavía no refleja todos los cambios.' : `La página respondió con ${response.status}.` }
  } catch { return { verified: false, reason: 'No se pudo comprobar el HTML público desde este navegador.' } }
}

export default function SeoEditor({ initialType = 'product', initialId = '', searchRows = [] }) {
  const { products, updateProduct } = useProducts()
  const { categories, getCategoryPathLabel, updateCategory } = useCategories()
  const [type, setType] = useState(initialType)
  const [selectedId, setSelectedId] = useState(initialId)
  const [family, setFamily] = useState('all')
  const [search, setSearch] = useState('')
  const [analyses, setAnalyses] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [persistedDrafts, setPersistedDrafts] = useState([])
  const [publicationResults, setPublicationResults] = useState([])

  const targets = useMemo(() => type === 'product' ? products.map((item) => ({ id: item.id, label: `${item.name}${item.ref ? ` · ${item.ref}` : ''}`, entity: item })) : type === 'category' ? categories.map((item) => ({ id: item.slug, label: getCategoryPathLabel(item.slug), entity: item })) : type === 'page' ? PAGES.map(([id, path, label]) => ({ id, label: `${label} · ${path}`, entity: { name: label, path } })) : PROJECTS.map((item) => ({ id: item.slug, label: `${item.name} · /proyectos/${item.category}/${item.slug}`, entity: item })), [categories, getCategoryPathLabel, products, type])
  const families = useMemo(() => [...new Set(products.map((item) => getCategoryPathLabel(item.category)).filter(Boolean))].sort(), [getCategoryPathLabel, products])
  const filtered = targets.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()) && (type !== 'product' || family === 'all' || getCategoryPathLabel(item.entity.category) === family))
  const selection = selectedId ? filtered.filter((item) => item.id === selectedId) : filtered
  const analysedCount = analyses.length
  const needingWork = analyses.filter((item) => item.proposals.length).length
  const currentStatus = (item) => item.draft?.status || (item.proposals.length ? 'proposal-pending' : 'no-improvements')
  const draftById = useMemo(() => new Map(persistedDrafts.map((draft) => [draft.entityId, draft])), [persistedDrafts])
  const statusCounts = useMemo(() => targets.reduce((counts, item) => {
    const status = draftById.get(item.id)?.status
    if (!status || status === 'not-analyzed') counts.notAnalyzed += 1
    else if (['no-improvements', 'published-web', 'published-verified', 'pending-google'].includes(status)) counts.optimized += 1
    else counts.needsWork += 1
    return counts
  }, { optimized: 0, needsWork: 0, notAnalyzed: 0 }), [draftById, targets])
  const pendingSelection = selection.filter((item) => !draftById.get(item.id)?.status || draftById.get(item.id)?.status === 'not-analyzed')

  useEffect(() => { let cancelled = false; seoDraftRepository.list().then((drafts) => { if (!cancelled) setPersistedDrafts(drafts.filter((draft) => draft.entityType === type)) }).catch(() => {}); return () => { cancelled = true } }, [type])

  const analyse = async () => {
    if (!selection.length) return
    if (!pendingSelection.length) return setMessage('Los elementos seleccionados ya están analizados. No se repite trabajo.')
    setLoading(true); setMessage('')
    try {
      const next = await Promise.all(pendingSelection.map(async (item) => { const draft = await seoDraftRepository.get(type, item.id); const fields = normalizeFields(item.entity, draft?.fields || {}); const path = entityPath(type, item.entity); const rows = searchRows.filter((row) => row.url === `https://boralba.es${path}` || row.url === path); const proposals = analyseEntity(type, item.entity, fields, rows).map((proposal) => ({ ...proposal, decision: draft?.proposalDecisions?.[proposal.key]?.decision || 'pending' })); const status = proposals.length ? 'proposal-pending' : 'no-improvements'; await seoDraftRepository.saveAnalysis(type, item.id, fields, status, { analysedAt: new Date().toISOString(), proposalCount: proposals.length }); return { ...item, fields, proposals, draft: { ...(draft || {}), status, fields } } }))
      setPersistedDrafts((current) => [...current.filter((draft) => !next.some((item) => item.id === draft.entityId)), ...next.map((item) => ({ ...item.draft, entityId: item.id, entityType: type }))])
      setAnalyses(next); setSelected(next.filter((item) => item.proposals.length).map((item) => item.id)); setMessage(`${next.length} elemento(s) pendiente(s) analizado(s): ${next.filter((item) => item.proposals.length).length} necesitan mejoras y ${next.filter((item) => !item.proposals.length).length} ya están optimizados.`)
    } catch (error) { setMessage(`No se pudo guardar el análisis en Firebase: ${error.message}`) } finally { setLoading(false) }
  }

  const decideProposal = async (item, proposal, decision) => {
    setAnalyses((current) => current.map((entry) => entry.id === item.id ? { ...entry, proposals: entry.proposals.map((candidate) => candidate.key === proposal.key ? { ...candidate, decision } : candidate) } : entry))
    try { await seoDraftRepository.recordProposalDecision(type, item.id, proposal.key, decision, proposal.recommended) } catch (error) { setMessage(`No se pudo guardar esta decisión en Firebase: ${error.message}`) }
  }

  const editProposal = (itemId, proposalKey, recommended) => setAnalyses((current) => current.map((item) => item.id === itemId ? { ...item, proposals: item.proposals.map((proposal) => proposal.key === proposalKey ? { ...proposal, recommended, decision: 'pending' } : proposal) } : item))

  const publish = async () => {
    const items = analyses.filter((item) => selected.includes(item.id) && item.proposals.some((proposal) => proposal.decision === 'accepted'))
    if (!items.length || loading) return
    if (!window.confirm(`Se modificarán ${items.length} elemento(s) y se comprobará cada publicación. ¿Continuar?`)) return
    setLoading(true); setMessage(`Publicando ${items.length} elemento(s)...`)
    const results = []
    try {
      for (const item of items) {
        const accepted = item.proposals.filter((proposal) => proposal.decision === 'accepted')
        const approvedFields = Object.fromEntries(accepted.map((proposal) => [proposal.key, proposal.recommended]))
        const fields = { ...item.fields, ...approvedFields }
        try {
          await seoDraftRepository.save(type, item.id, approvedFields, 'publishing', { fieldsUpdated: accepted.map((proposal) => proposal.label), publishingStartedAt: new Date().toISOString() })
          const entity = { ...item.entity, ...(approvedFields.imageAlt ? { imageAlt: approvedFields.imageAlt } : {}), seo: { ...(item.entity.seo || {}), ...approvedFields, ...(approvedFields.secondaryKeywords ? { secondaryKeywords: approvedFields.secondaryKeywords.split(',').map((value) => value.trim()).filter(Boolean) } : {}) } }
          if (type === 'product') await updateProduct(item.id, entity)
          else if (type === 'category') await updateCategory(item.id, entity)
          else throw new Error('Este tipo de contenido requiere un despliegue editorial.')
          const verification = await publicCheck(type, entity, fields)
          const status = verification.verified ? 'pending-google' : 'pending-deployment'
          const publishedAt = new Date().toISOString()
          await seoDraftRepository.setStatus(type, item.id, status, { fieldsUpdated: accepted.map((proposal) => proposal.label), firebaseSavedAt: publishedAt, publicVerification: verification, publishedAt, googleProcessing: { status: 'pending', explanation: 'Google todavía debe rastrear y procesar el cambio.' } })
          item.publication = { status, fieldsUpdated: accepted.map((proposal) => proposal.label), firebaseSavedAt: publishedAt, publicVerification: verification, publishedAt }
          item.publicationSummary = { id: item.id, label: item.label, firebase: 'Guardado', web: verification.verified ? 'Reflejado en la web pública' : `Pendiente de despliegue: ${verification.reason}`, google: 'Pendiente de procesamiento por Google' }
        } catch (error) {
          await seoDraftRepository.setStatus(type, item.id, 'publish-error', { publishError: error.message, failedAt: new Date().toISOString() }).catch(() => {})
          throw error
        }
        results.push({ ...item, fields, proposals: [], draft: { ...(item.publication || {}), status: item.publication?.status }, publicationSummary: item.publicationSummary })
      }
      setAnalyses((current) => current.map((item) => results.find((result) => result.id === item.id) || item)); setPersistedDrafts((current) => current.map((draft) => { const result = results.find((item) => item.id === draft.entityId); return result?.draft ? { ...draft, ...result.draft } : draft })); setSelected([])
      setPublicationResults(results.map((item) => item.publicationSummary).filter(Boolean))
      setMessage(`Proceso terminado para ${results.length} elemento(s). Firebase, la web pública y Google tienen estados diferenciados abajo.`)
    } catch (error) { setMessage(`La publicación se detuvo: ${error.message}. El elemento afectado queda marcado para revisión.`) } finally { setLoading(false) }
  }

  return <div className="seo-editor seo-flow">
    <header className="seo-flow-intro"><div><span className="admin-kicker">Optimización guiada</span><h3>Mejora el catálogo en tres pasos</h3><p>Selecciona productos o una familia, revisa recomendaciones escritas con datos reales y publica solo lo que apruebes.</p></div><div className="seo-flow-legend"><span><b>1</b> Seleccionar</span><span><b>2</b> Analizar y preparar</span><span><b>3</b> Revisar y publicar</span></div></header>
     <section className="seo-editor-card seo-selection"><SectionTitle eyebrow="Paso 1 · Seleccionar" title="¿Qué quieres optimizar?" text="Selecciona una familia o un producto. Solo se analizarán los elementos que todavía no tengan un análisis guardado." /><div className="seo-editor-toolbar"><label>Tipo<select value={type} onChange={(event) => { setType(event.target.value); setSelectedId(''); setAnalyses([]) }}><option value="product">Productos</option><option value="category">Categorías</option><option value="project">Proyectos</option><option value="page">Páginas principales</option></select></label>{type === 'product' && <label>Familia<select value={family} onChange={(event) => { setFamily(event.target.value); setSelectedId('') }}><option value="all">Todas las familias</option>{families.map((item) => <option key={item}>{item}</option>)}</select></label>}<label>Producto concreto (opcional)<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Toda la selección filtrada</option>{filtered.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Buscar<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre o referencia" /></label></div><p className="seo-selection-count">Se analizarán <strong>{selection.length}</strong> elemento(s); quedan pendientes <strong>{pendingSelection.length}</strong>.</p><div className="seo-analysis-summary"><span><strong>{statusCounts.optimized}</strong> ya optimizados</span><span><strong>{statusCounts.needsWork}</strong> necesitan mejoras</span><span><strong>{statusCounts.notAnalyzed}</strong> sin analizar</span></div><div className="seo-status-groups">{[['optimized', 'Ya optimizados'], ['needsWork', 'Necesitan mejoras'], ['notAnalyzed', 'Sin analizar']].map(([key, label]) => { const items = targets.filter((item) => { const status = draftById.get(item.id)?.status; return key === 'notAnalyzed' ? !status || status === 'not-analyzed' : key === 'optimized' ? ['no-improvements', 'published-web', 'published-verified', 'pending-google'].includes(status) : status }) ; return <details key={key}><summary>{label} ({items.length})</summary><span>{items.length ? items.map((item) => item.label).join(' · ') : 'Ninguno'}</span></details>})}</div></section>
     <section className="seo-editor-card"><SectionTitle eyebrow="Paso 2 · Analizar y preparar" title="Obtén una explicación sencilla de lo que conviene mejorar" text="El análisis se guarda automáticamente en Firebase. Los productos ya analizados no se vuelven a consultar." /><button type="button" className="btn btn-primary" onClick={analyse} disabled={loading || !pendingSelection.length}>{loading ? 'Analizando pendientes...' : 'Analizar pendientes'}</button>{message && <p className="seo-editor-message" role="status">{message}</p>}{persistedDrafts.length > 0 && <p className="seo-persistence-note">Firebase conserva los estados y el historial de {persistedDrafts.length} elemento(s).</p>}{analysedCount > 0 && <div className="seo-analysis-summary"><strong>{analysedCount} en esta revisión</strong><span>{needingWork} necesitan mejoras</span><span>{analysedCount - needingWork} ya están optimizados</span></div>}</section>
     {analyses.length > 0 && <section className="seo-editor-card seo-review"><SectionTitle eyebrow="Paso 3 · Revisar, aprobar y publicar" title="Revisa los cambios antes de aplicarlos" text="Edita cada propuesta y acepta o rechaza cada una. Solo se publicarán las propuestas aceptadas." /><div className="seo-review-list">{analyses.map((item) => <article key={item.id} className={`seo-review-item seo-review-item--${currentStatus(item)}`}><label className="seo-review-check"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} disabled={!item.proposals.some((proposal) => proposal.decision === 'accepted') || loading} /><span><strong>{item.label}</strong><small>{statusText(currentStatus(item))}</small></span></label>{item.proposals.length ? <details open={analyses.length < 6}><summary>{item.proposals.length} propuesta(s) · {item.proposals.filter((proposal) => proposal.decision === 'accepted').length} aceptada(s)</summary><div className="seo-proposal-list">{item.proposals.map((proposal) => <div className={`seo-proposal seo-proposal--${proposal.decision}`} key={proposal.key}><strong>{proposal.label}</strong><span>Antes: {proposal.current}</span><label>Editar propuesta<textarea value={proposal.recommended} onChange={(event) => editProposal(item.id, proposal.key, event.target.value)} rows={2} /></label><small>{proposal.reason}</small><div className="seo-proposal-actions"><button type="button" className={`btn btn-sm ${proposal.decision === 'accepted' ? 'btn-primary' : 'btn-outline'}`} onClick={() => decideProposal(item, proposal, 'accepted')} disabled={loading}>Aceptar</button><button type="button" className={`btn btn-sm ${proposal.decision === 'rejected' ? 'btn-danger' : 'btn-ghost'}`} onClick={() => decideProposal(item, proposal, 'rejected')} disabled={loading}>Rechazar</button></div></div>)}</div></details> : <p className="seo-no-improvement">No se han detectado campos pendientes con la información disponible.</p>}</article>)}</div>{publicationResults.length > 0 && <div className="seo-publication-results"><strong>Resultado detallado de la publicación</strong>{publicationResults.map((result) => <article key={result.id}><b>{result.label}</b><span>Firebase: {result.firebase}</span><span>Web pública: {result.web}</span><span>Google: {result.google}</span></article>)}</div>}<div className="seo-publish-bar"><span>{selected.filter((id) => analyses.some((item) => item.id === id && item.proposals.some((proposal) => proposal.decision === 'accepted'))).length} elemento(s) listo(s) para publicar</span><button type="button" className="btn btn-primary" onClick={publish} disabled={loading || !selected.some((id) => analyses.some((item) => item.id === id && item.proposals.some((proposal) => proposal.decision === 'accepted')))}>{loading ? 'Publicando...' : 'Aprobar y publicar'}</button></div></section>}
  </div>
}

function SectionTitle({ eyebrow, title, text }) { return <div className="seo-editor-section-title"><span>{eyebrow}</span><h3>{title}</h3>{text && <p>{text}</p>}</div> }
