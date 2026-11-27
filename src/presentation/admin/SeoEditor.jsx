import { useEffect, useMemo, useState } from 'react'
import { PROJECTS } from '../../domain/showcase/proyectos.js'
import { seoDraftRepository } from '../../infrastructure/seo/seoDraftRepository.js'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'
import { productPath } from '../../domain/catalog/slug'

const PAGES = [
  ['home', '/', 'Página principal'], ['productos', '/productos', 'Catálogo de productos'],
  ['proyectos', '/proyectos', 'Listado de proyectos'], ['servicios', '/servicios', 'Servicios'],
  ['empresa', '/empresa', 'Empresa'], ['contacto', '/contacto', 'Contacto'],
  ['disena-tu-luminaria', '/disena-tu-luminaria', 'Diseña tu luminaria'], ['outlet', '/outlet', 'Outlet'],
]

export const emptyFields = (entity = {}) => ({
  title: entity.seo?.title || '',
  description: entity.seo?.description || '',
  h1: entity.seo?.h1 || '',
  focusKeyword: entity.seo?.focusKeyword || '',
  secondaryKeywords: (entity.seo?.secondaryKeywords || []).join(', '),
  content: entity.seo?.content || '',
  canonical: entity.seo?.canonical || '',
  noindex: Boolean(entity.seo?.noindex ?? entity.noindex),
  imageAlt: entity.imageAlt || '',
})
export const normalizeFields = (entity, draftFields = {}) => {
  const fields = { ...emptyFields(entity), ...draftFields }
  return { ...fields, secondaryKeywords: Array.isArray(fields.secondaryKeywords) ? fields.secondaryKeywords.join(', ') : String(fields.secondaryKeywords || '') }
}
const automaticFields = (type, entity) => {
  const name = clean(entity.name || entity.title || 'Página de Boralba')
  const title = type === 'product' ? `${name}${entity.ref ? ` ${entity.ref}` : ''} — Producto LED` : `${name} — Boralba Lighting`
  const description = firstSentence(entity.description || entity.tagline, `Información de ${name} en Boralba Lighting.`)
  return { title, description }
}

const entityPath = (type, entity) => {
  if (type === 'product') return productPath(entity)
  if (type === 'category') return `/categoria/${entity.slug}`
  return entity.path || `/proyectos/${entity.category || ''}/${entity.slug || entity.id}`
}

const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim()
const firstSentence = (value, fallback) => clean(value).split(/[.!?]/)[0] || fallback
const productFacts = (product) => [
  product.name,
  product.ref && `referencia ${product.ref}`,
  product.description,
  product.category,
  ...(Array.isArray(product.features) ? product.features : String(product.features || '').split('\n')),
  ...(Array.isArray(product.applications) ? product.applications.map((item) => typeof item === 'string' ? item : item?.title || item?.name) : []),
].filter(Boolean).map(clean)

export function analyseEntity(type, entity, fields) {
  const name = clean(entity.name || entity.title || 'Página de Boralba')
  const facts = productFacts(entity)
  const category = clean(entity.category)
  const baseDescription = firstSentence(entity.description || entity.tagline, `Información de ${name} en Boralba Lighting.`)
  const title = type === 'product'
    ? `${name}${entity.ref ? ` · ${entity.ref}` : ''} — Boralba Lighting`
    : `${name} — Boralba Lighting`
  const description = baseDescription
  const keyword = clean(`${name}${category ? ` ${category}` : ''}`)
  const secondary = [...new Set([category, entity.ref, ...facts.slice(1, 3)].filter(Boolean))].slice(0, 4)
  const imageAlt = entity.image && !entity.imageAlt ? `${name}${entity.ref ? ` ${entity.ref}` : ''} — imagen del producto` : ''
  const content = type === 'product' && !fields.content && entity.description ? clean(entity.description) : ''
  const proposals = []
  if (!entity.seo?.title) proposals.push({ key: 'title', label: 'Título SEO', current: fields.title || '(sin título específico)', recommended: title, reason: 'Diferencia la ficha y explica qué es sin añadir datos que no estén en el catálogo.', benefit: 'Mejor comprensión del resultado en Google.', priority: 'high' })
  if (!entity.seo?.description && !entity.seoDescription) proposals.push({ key: 'description', label: 'Metadescripción', current: fields.description || '(sin descripción específica)', recommended: description, reason: 'Resume información que ya existe en la ficha.', benefit: 'Ayuda a decidir si el resultado responde a la búsqueda.', priority: 'high' })
  if (!fields.focusKeyword) proposals.push({ key: 'focusKeyword', label: 'Palabra clave objetivo', current: '(sin definir)', recommended: keyword, reason: 'Se construye con el nombre y la categoría existentes.', benefit: 'Facilita mantener un objetivo editorial claro.', priority: 'medium' })
  if (!fields.secondaryKeywords) proposals.push({ key: 'secondaryKeywords', label: 'Palabras secundarias', current: '(sin definir)', recommended: secondary.join(', '), reason: 'Usa referencias y conceptos ya presentes en el producto.', benefit: 'Amplía la cobertura semántica sin crear atributos nuevos.', priority: 'medium' })
  if (content) proposals.push({ key: 'content', label: 'Contenido descriptivo', current: '(sin contenido SEO adicional)', recommended: content, reason: 'Reúne datos descriptivos reales de la ficha.', benefit: 'Aporta contexto útil para usuarios profesionales.', priority: 'medium' })
  if (imageAlt) proposals.push({ key: 'imageAlt', label: 'Texto alternativo', current: '(sin texto alternativo)', recommended: imageAlt, reason: 'Describe la imagen usando el nombre y referencia disponibles.', benefit: 'Mejora accesibilidad y comprensión de imágenes.', priority: 'medium' })
  return proposals
}

export default function SeoEditor({ initialType = 'product', initialId = '', focusField = '' }) {
  const { products, updateProduct } = useProducts()
  const { categories, getCategoryPathLabel, updateCategory } = useCategories()
  const [type, setType] = useState(initialType)
  const [selectedId, setSelectedId] = useState(initialId)
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState('all')
  const [fields, setFields] = useState(emptyFields())
  const [draft, setDraft] = useState(null)
  const [proposals, setProposals] = useState([])
  const [approved, setApproved] = useState([])
  const [batch, setBatch] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const targets = useMemo(() => {
    if (type === 'product') return products.map((item) => ({ id: item.id, label: `${item.name}${item.ref ? ` · ${item.ref}` : ''}`, entity: item }))
    if (type === 'category') return categories.map((item) => ({ id: item.slug, label: getCategoryPathLabel(item.slug), entity: item }))
    if (type === 'page') return PAGES.map(([id, path, label]) => ({ id, label: `${label} · ${path}`, entity: { name: label, path } }))
    return PROJECTS.map((item) => ({ id: item.slug, label: `${item.name} · /proyectos/${item.category}/${item.slug}`, entity: item }))
  }, [categories, getCategoryPathLabel, products, type])
  const families = useMemo(() => [...new Set(products.map((item) => getCategoryPathLabel(item.category)).filter(Boolean))].sort(), [getCategoryPathLabel, products])
  const filteredTargets = targets.filter((item) => {
    const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase())
    const matchesFamily = type !== 'product' || family === 'all' || getCategoryPathLabel(item.entity.category) === family
    return matchesSearch && matchesFamily
  })
  const selected = targets.find((item) => item.id === selectedId)

  const loadSelected = async (target = selected) => {
    if (!target) { setFields(emptyFields()); setDraft(null); setProposals([]); return }
    setLoading(true); setMessage(''); setProposals([]); setApproved([])
    try {
      const nextDraft = await seoDraftRepository.get(type, target.id)
      setDraft(nextDraft)
      setFields({ ...automaticFields(type, target.entity), ...normalizeFields(target.entity, nextDraft?.fields || {}) })
    } catch (error) { setMessage(error.message) } finally { setLoading(false) }
  }

  useEffect(() => { loadSelected() }, [selectedId, type])
  useEffect(() => {
    if (!focusField) return undefined
    const timer = window.setTimeout(() => document.querySelector(`[data-seo-field="${focusField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
    return () => window.clearTimeout(timer)
  }, [focusField, selected])

  const set = (key) => (event) => setFields((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const analyse = () => {
    if (!selected) return
    const next = analyseEntity(type, selected.entity, fields)
    setProposals(next); setApproved([]); setMessage('Propuestas generadas a partir de la información real disponible.')
  }
  const applyProposal = (proposal) => setFields((current) => ({ ...current, [proposal.key]: proposal.recommended }))
  const toggleApproval = (key) => setApproved((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])
  const approveAll = () => { setApproved(proposals.map((item) => item.key)); setMessage('Todas las propuestas están seleccionadas. Pulsa «Aprobar propuestas seleccionadas» para aplicarlas al editor.') }
  const approveSelected = () => { proposals.filter((item) => approved.includes(item.key)).forEach(applyProposal); setMessage(`${approved.length} propuesta(s) aprobada(s) y aplicada(s) al editor. Revísalas antes de guardar.`) }
  const save = async (event) => {
    event.preventDefault()
    if (!selected || saving) return
    if (fields.noindex && !window.confirm('Noindex puede impedir que Google incluya esta página. ¿Quieres guardar este borrador?')) return
    if (fields.canonical && !window.confirm('Una canonical incorrecta puede hacer que Google ignore esta página. ¿Confirmas este valor?')) return
    setSaving(true); setMessage('')
    try {
      await seoDraftRepository.save(type, selected.id, { ...fields, secondaryKeywords: fields.secondaryKeywords.split(',').map((item) => item.trim()).filter(Boolean) })
      setDraft(await seoDraftRepository.get(type, selected.id))
      setMessage('Borrador guardado en Firestore. Todavía no está publicado en la web pública.')
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }
  const publish = async () => {
    if (!selected || !draft) { setMessage('Primero guarda un borrador revisado antes de publicarlo.'); return }
    if (!window.confirm('Se publicarán los campos SEO aprobados en la fuente pública. Después será necesario desplegar para actualizar el HTML estático. ¿Continuar?')) return
    setSaving(true); setMessage('')
    try {
      const { imageAlt, ...seoFields } = fields
      const next = { ...selected.entity, imageAlt: imageAlt || '', seo: { ...(selected.entity.seo || {}), ...seoFields, secondaryKeywords: fields.secondaryKeywords.split(',').map((item) => item.trim()).filter(Boolean) } }
      if (type === 'product') await updateProduct(selected.id, next)
      else if (type === 'category') await updateCategory(selected.id, next)
      else throw new Error('Este tipo de contenido se guarda como borrador, pero su publicación requiere modificar su fuente editorial estática.')
      await seoDraftRepository.setStatus(type, selected.id, 'published')
      setDraft((current) => current ? { ...current, status: 'published' } : current)
      setMessage('Cambio publicado en Firebase. La ficha pública ya usa estos datos; Google puede tardar en volver a rastrearlos.')
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }
  const generateBatch = () => {
    const items = filteredTargets.slice(0, 50).map((item) => ({ ...item, proposals: analyseEntity(type, item.entity, emptyFields(item.entity)) }))
    setBatch(items); setMessage(`${items.length} propuesta(s) generada(s). Todavía no se ha publicado ningún cambio.`)
  }
  const saveBatch = async () => {
    if (!batch.length || !window.confirm(`Se guardarán ${batch.length} borrador(es) SEO. No se publicará ningún cambio. ¿Continuar?`)) return
    setSaving(true)
    try {
      await Promise.all(batch.map((item) => seoDraftRepository.save(type, item.id, Object.fromEntries(item.proposals.map((proposal) => [proposal.key, proposal.key === 'secondaryKeywords' ? proposal.recommended.split(',').map((value) => value.trim()) : proposal.recommended])))))
      setMessage(`${batch.length} borrador(es) guardado(s). Revísalos y publícalos individualmente.`); setBatch([])
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }
  const restore = (entry) => {
    setFields(normalizeFields(selected.entity, entry.fields || {}))
    setMessage('Versión recuperada en el editor. Pulsa «Guardar borrador» para conservarla como nueva versión.')
  }

  return <div className="seo-editor">
    <div className="seo-editor-toolbar">
      <label>Tipo de contenido<select value={type} onChange={(event) => { setType(event.target.value); setSelectedId(''); setBatch([]) }}><option value="product">Productos</option><option value="category">Categorías</option><option value="project">Proyectos</option><option value="page">Páginas principales</option></select></label>
      {type === 'product' && <label>Familia para optimización masiva<select value={family} onChange={(event) => setFamily(event.target.value)}><option value="all">Todas las familias</option>{families.map((item) => <option key={item}>{item}</option>)}</select></label>}
      <label>Buscar<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, referencia o ruta" /></label>
      <label>Elemento<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Selecciona un elemento...</option>{filteredTargets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    </div>
    {type === 'product' && <div className="seo-editor-bulk"><div><strong>Optimización masiva</strong><span>{filteredTargets.length} producto(s) en la selección actual. Se generan propuestas individualizadas usando sus datos.</span></div><button type="button" className="btn btn-outline btn-sm" onClick={generateBatch} disabled={saving || !filteredTargets.length}>Analizar selección</button>{batch.length > 0 && <button type="button" className="btn btn-primary btn-sm" onClick={saveBatch} disabled={saving}>Guardar borradores seleccionados</button>}</div>}
    {batch.length > 0 && <div className="seo-batch-list"><strong>Propuestas masivas preparadas</strong>{batch.map((item) => <span key={item.id}>{item.label}</span>)}</div>}
    {!selected ? <div className="seo-editor-empty"><strong>Selecciona un producto para empezar</strong><span>Al elegirlo cargaremos sus datos actuales, sus valores automáticos y sus borradores. Después podrás analizarlo sin inventar información.</span></div> : <form className="seo-editor-layout" onSubmit={save}>
      <div className="seo-editor-main">
        <section className="seo-editor-card seo-editor-product"><SectionTitle eyebrow="Información del producto" title={selected.label} text={loading ? 'Cargando información...' : 'Estos datos proceden del catálogo actual y sirven de base para las propuestas.'} /><div className="seo-product-facts"><Fact label="Referencia" value={selected.entity.ref || 'No indicada'} /><Fact label="Categoría" value={getCategoryPathLabel(selected.entity.category) || 'No indicada'} /><Fact label="Descripción actual" value={selected.entity.description || 'No hay descripción guardada'} /></div></section>
        <section className="seo-editor-card"><SectionTitle eyebrow="Diagnóstico SEO" title="Qué conviene revisar primero" text="No necesitas saber SEO: empieza por las prioridades marcadas." /><Diagnosis fields={fields} proposals={proposals} /></section>
        <section className="seo-editor-card"><SectionTitle eyebrow="Mejoras recomendadas" title="Asistente de optimización" text="Las propuestas se basan solo en el nombre, categoría, referencia y textos existentes." /><div className="seo-assistant-actions"><button type="button" className="btn btn-primary" onClick={analyse} disabled={loading}>Analizar y generar mejoras</button>{proposals.length > 0 && <><button type="button" className="btn btn-outline" onClick={approveAll}>Seleccionar todas</button><button type="button" className="btn btn-outline" onClick={approveSelected} disabled={!approved.length}>Aprobar propuestas seleccionadas</button></>}</div>{proposals.length > 0 && <ProposalList proposals={proposals} approved={approved} onApply={applyProposal} onApprove={toggleApproval} />}</section>
        <section className="seo-editor-card"><SectionTitle eyebrow="Título y descripción para Google" title="Mensaje del resultado" text="Puedes aceptar una propuesta o escribir una versión propia." /><Field label="Título SEO" help="Es el título que puede aparecer en Google." value={fields.title} onChange={set('title')} name="title" /><Field label="Metadescripción" help="Resume lo que encontrará la persona, usando información comprobable." value={fields.description} onChange={set('description')} name="description" multiline rows={4} /></section>
        <section className="seo-editor-card"><SectionTitle eyebrow="Palabras clave objetivo" title="Qué búsqueda quieres trabajar" text="Son notas internas de planificación. No son consultas reales de Search Console." /><Field label="Palabra clave principal" help="La propuesta usa el nombre y la categoría reales del producto." value={fields.focusKeyword} onChange={set('focusKeyword')} name="focusKeyword" /><Field label="Palabras secundarias" help="Sepáralas con comas. Utiliza solo conceptos que aparecen en la ficha." value={fields.secondaryKeywords} onChange={set('secondaryKeywords')} name="secondaryKeywords" /></section>
        <section className="seo-editor-card"><SectionTitle eyebrow="Optimización del contenido" title="Información útil para profesionales" text="Amplía la explicación sin añadir especificaciones que no estén confirmadas." /><Field label="Contenido descriptivo adicional" help="Escribe aplicaciones, contexto o ventajas que ya estén respaldados por el catálogo." value={fields.content} onChange={set('content')} name="content" multiline rows={6} /></section>
        <section className="seo-editor-card"><SectionTitle eyebrow="Imágenes y textos alternativos" title="Describe las imágenes" text="Ayuda a personas que utilizan lectores de pantalla y a buscadores de imágenes." /><Field label="Texto alternativo de la imagen principal" help="Describe qué aparece; no escribas características que la imagen no confirme." value={fields.imageAlt} onChange={set('imageAlt')} name="imageAlt" /></section>
        <section className="seo-editor-card"><SectionTitle eyebrow="Enlaces internos recomendados" title="Conectar contenidos relacionados" text="Esta primera versión muestra rutas reales disponibles para revisar manualmente." /><InternalLinks type={type} entity={selected.entity} products={products} /></section>
        <details className="seo-editor-advanced"><summary>Configuración técnica avanzada</summary><div className="seo-editor-advanced-body"><Field label="URL canonical" help="Indica la versión principal de esta página. Déjala vacía para usar la URL normal." value={fields.canonical} onChange={set('canonical')} name="canonical" /><label className="seo-checkbox"><input type="checkbox" checked={fields.noindex} onChange={set('noindex')} /> Solicitar noindex <span>Puede impedir que Google indexe esta página. Solo úsalo con una razón clara.</span></label></div></details>
        <section className="seo-editor-card seo-editor-publish"><SectionTitle eyebrow="Guardado, publicación y verificación" title="Controla cada paso" text="Guardar crea un borrador. Publicar actualiza la fuente pública. Verificar requiere comprobar la web después del despliegue." /><div className="seo-status-steps"><span className={draft ? 'is-done' : ''}>1. Borrador</span><span className={draft?.status === 'published' ? 'is-done' : ''}>2. Publicado</span><span>3. HTML desplegado</span><span>4. Verificado</span></div><div className="seo-editor-actions"><button type="submit" className="btn btn-primary" disabled={saving || loading}>{saving ? 'Guardando...' : 'Guardar borrador'}</button><button type="button" className="btn btn-outline" onClick={publish} disabled={saving || loading || !draft}>Publicar cambio aprobado</button>{message && <span className="seo-editor-message" role="status">{message}</span>}</div></section>
        {draft?.history?.length > 0 && <DraftHistory history={draft.history} onRestore={restore} />}
      </div><SeoPreview fields={fields} selected={selected} type={type} /></form>}
  </div>
}

function SectionTitle({ eyebrow, title, text }) { return <div className="seo-editor-section-title"><span>{eyebrow}</span><h3>{title}</h3>{text && <p>{text}</p>}</div> }
function Fact({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div> }
function Field({ label, help, value, onChange, name, multiline = false, rows = 3 }) { return <label className="seo-editor-field" data-seo-field={name}><span>{label}</span><small>{help}</small>{multiline ? <textarea value={value} onChange={onChange} rows={rows} /> : <input value={value} onChange={onChange} />}</label> }
function Diagnosis({ fields, proposals }) { const issues = [{ label: 'Título SEO específico', ok: Boolean(fields.title), text: fields.title ? 'Hay un título personalizado.' : 'Se usará un valor automático hasta que lo revises.' }, { label: 'Descripción para Google', ok: Boolean(fields.description), text: fields.description ? 'Hay una descripción disponible.' : 'Conviene preparar un resumen claro.' }, { label: 'Palabra objetivo', ok: Boolean(fields.focusKeyword), text: fields.focusKeyword ? 'Está definida para orientar el contenido.' : 'Todavía no se ha definido.' }, { label: 'Texto alternativo', ok: Boolean(fields.imageAlt), text: fields.imageAlt ? 'La imagen principal tiene descripción.' : 'Revisa si la imagen necesita una descripción.' }]; return <div className="seo-diagnosis">{issues.map((issue) => <div key={issue.label} className={issue.ok ? 'is-ok' : 'is-warning'}><strong>{issue.ok ? 'Correcto' : 'Pendiente'} · {issue.label}</strong><span>{issue.text}</span></div>)}{proposals.length === 0 && <p className="seo-help-callout">Pulsa «Analizar y generar mejoras» para obtener recomendaciones concretas.</p>}</div> }
function ProposalList({ proposals, approved, onApply, onApprove }) { return <div className="seo-proposal-list">{proposals.map((proposal) => <article className={`seo-proposal seo-proposal--${proposal.priority}`} key={proposal.key}><div className="seo-proposal-head"><span>{proposal.priority === 'high' ? 'Prioridad alta' : proposal.priority === 'medium' ? 'Prioridad media' : 'Revisión opcional'}</span><h4>{proposal.label}</h4></div><dl><div><dt>Actual</dt><dd>{proposal.current}</dd></div><div><dt>Recomendado</dt><dd>{proposal.recommended}</dd></div></dl><p><strong>Motivo:</strong> {proposal.reason}</p><p><strong>Beneficio:</strong> {proposal.benefit}</p><div className="seo-proposal-actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => onApply(proposal)}>Usar propuesta</button><button type="button" className={`btn btn-sm ${approved.includes(proposal.key) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => onApprove(proposal.key)}>{approved.includes(proposal.key) ? 'Aprobada' : 'Aprobar'}</button></div></article>)}</div> }
function InternalLinks({ type, entity, products }) { const links = type === 'product' ? products.filter((item) => item.id !== entity.id && item.category === entity.category).slice(0, 3) : []; return links.length ? <ul className="seo-link-list">{links.map((item) => <li key={item.id}><span>{item.name}</span><small>{productPath(item)}</small></li>)}</ul> : <p className="seo-empty">No hay enlaces relacionados suficientes para proponerlos con seguridad.</p> }
function SeoPreview({ fields, selected, type }) { const title = fields.title || selected.entity.name || selected.label; const path = fields.canonical || `https://boralba.es${entityPath(type, selected.entity)}`; const description = fields.description || selected.entity.description || 'Descripción automática pendiente de revisión.'; return <aside className="seo-editor-sidebar"><section className="seo-preview"><div className="seo-preview-brand"><img src="/favicon-32.png" alt="" /><span>Boralba Lighting</span></div><h3>Vista previa de Google</h3><p className="seo-preview-note">Orientativa: Google puede mostrar una versión diferente.</p><div className="seo-preview-card"><strong>{title}</strong><span>{path}</span><p>{description}</p></div><div className="seo-preview-meters"><Meter label="Título" value={title} /><Meter label="Descripción" value={description} /></div></section><section className="seo-side-card"><h3>Qué haría primero</h3><ol><li>Analizar la ficha.</li><li>Revisar las propuestas de prioridad alta.</li><li>Guardar el borrador.</li><li>Publicar y comprobar la web.</li></ol></section></aside> }
function Meter({ label, value }) { const length = value.length; const state = length === 0 ? 'empty' : length < 35 ? 'short' : length > 170 ? 'long' : 'ok'; return <div><span>{label}: {length} caracteres orientativos</span><i className={`seo-meter seo-meter--${state}`} /><small>{state === 'ok' ? 'Longitud razonable como referencia editorial.' : 'No es un requisito obligatorio de Google; revisa que el texto sea claro.'}</small></div> }
function DraftHistory({ history, onRestore }) { return <section className="seo-draft-history"><h3>Historial del borrador</h3><ol>{[...history].reverse().map((entry, index) => <li key={`${entry.savedAt}-${index}`}><span><strong>{new Date(entry.savedAt).toLocaleString('es-ES')}</strong><small>{entry.savedBy?.email || entry.savedBy?.uid || 'Administrador'} · {entry.status}</small></span><button type="button" className="btn btn-ghost btn-sm" onClick={() => onRestore(entry)}>Recuperar</button></li>)}</ol></section> }
