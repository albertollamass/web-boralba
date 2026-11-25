import { useEffect, useMemo, useState } from 'react'
import { PROJECTS } from '../../domain/showcase/proyectos.js'
import { seoDraftRepository } from '../../infrastructure/seo/seoDraftRepository.js'
import { useProducts } from '../../application/catalog/ProductsContext'
import { useCategories } from '../../application/catalog/CategoriesContext'

const PAGES = [
  ['home', '/', 'Página principal'], ['productos', '/productos', 'Catálogo de productos'],
  ['proyectos', '/proyectos', 'Listado de proyectos'], ['servicios', '/servicios', 'Servicios'],
  ['empresa', '/empresa', 'Empresa'], ['contacto', '/contacto', 'Contacto'],
  ['disena-tu-luminaria', '/disena-tu-luminaria', 'Diseña tu luminaria'], ['outlet', '/outlet', 'Outlet'],
]
const emptyFields = (entity = {}) => ({
  title: entity.seo?.title || '', description: entity.seo?.description || '', h1: entity.seo?.h1 || '',
  focusKeyword: entity.seo?.focusKeyword || '', secondaryKeywords: (entity.seo?.secondaryKeywords || []).join(', '),
  content: entity.seo?.content || '', canonical: entity.seo?.canonical || '', noindex: Boolean(entity.seo?.noindex),
})
const fieldHelp = {
  title: ['Título SEO', 'Es el texto principal que puede aparecer en Google.', 'Describe esta página de forma concreta y diferenciada.'],
  description: ['Metadescripción', 'Resume el contenido que puede acompañar al resultado.', 'Escribe una explicación útil para la persona que busca, sin repetir palabras artificialmente.'],
  h1: ['Encabezado H1', 'Es el encabezado principal visible de la página.', 'Debe explicar claramente qué encontrará el usuario.'],
  focusKeyword: ['Palabra clave objetivo', 'Es una referencia editorial interna, no una etiqueta meta.', 'Anota la búsqueda principal que quieres trabajar cuando exista una relación real con la página.'],
  secondaryKeywords: ['Palabras secundarias', 'Ayudan a planificar el contenido relacionado.', 'Separa conceptos reales por comas y evita listas artificiales.'],
  content: ['Contenido descriptivo', 'Amplía la información útil de la página.', 'Escribe solo información comprobable y relevante para el producto o servicio.'],
  canonical: ['URL canónica', 'Indica cuál es la versión principal de una URL.', 'Déjala vacía para usar la URL normal. Cambiarla requiere una confirmación adicional.'],
}

export default function SeoEditor({ initialType = 'product', initialId = '', focusField = '' }) {
  const { products } = useProducts()
  const { categories, getCategoryPathLabel } = useCategories()
  const [type, setType] = useState(initialType)
  const [selectedId, setSelectedId] = useState(initialId)
  const [search, setSearch] = useState('')
  const [fields, setFields] = useState(emptyFields())
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const targets = useMemo(() => {
    if (type === 'product') return products.map((item) => ({ id: item.id, label: `${item.name}${item.ref ? ` · ${item.ref}` : ''}`, entity: item }))
    if (type === 'category') return categories.map((item) => ({ id: item.slug, label: getCategoryPathLabel(item.slug), entity: item }))
    if (type === 'page') return PAGES.map(([id, path, label]) => ({ id, label: `${label} · ${path}`, entity: { name: label, path } }))
    return PROJECTS.map((item) => ({ id: item.slug, label: `${item.name} · /proyectos/${item.category}/${item.slug}`, entity: item }))
  }, [categories, getCategoryPathLabel, products, type])
  const filteredTargets = targets.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
  const selected = targets.find((item) => item.id === selectedId)

  useEffect(() => {
     if (!selected) { setFields(emptyFields()); setDraft(null); return }
    let cancelled = false
    setLoading(true)
    setMessage('')
     seoDraftRepository.get(type, selected.id).then((nextDraft) => {
       if (!cancelled) {
         setDraft(nextDraft)
         setFields({ ...emptyFields(selected.entity), ...(nextDraft?.fields || {}) })
       }
    }).catch((error) => { if (!cancelled) setMessage(error.message) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [selected, type])

  useEffect(() => {
    if (!focusField) return
    const timer = window.setTimeout(() => document.querySelector(`[data-seo-field="${focusField}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
    return () => window.clearTimeout(timer)
  }, [focusField, selected])

  const set = (key) => (event) => setFields((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const save = async (event) => {
    event.preventDefault()
    if (!selected || saving) return
    if (fields.noindex && !window.confirm('Esta opción puede impedir la indexación de la página. ¿Quieres guardar el borrador con noindex?')) return
    if (fields.canonical && !window.confirm('La URL canónica afecta a cómo Google interpreta esta página. ¿Confirmas este valor?')) return
    setSaving(true); setMessage('')
    try {
       await seoDraftRepository.save(type, selected.id, { ...fields, secondaryKeywords: fields.secondaryKeywords.split(',').map((item) => item.trim()).filter(Boolean) })
       setDraft(await seoDraftRepository.get(type, selected.id))
      setMessage('Borrador SEO guardado. Todavía no modifica la página pública.')
    } catch (error) { setMessage(error.message) } finally { setSaving(false) }
  }

  return <div className="seo-editor">
    <div className="seo-editor-toolbar"><label>Tipo<select value={type} onChange={(event) => { setType(event.target.value); setSelectedId('') }}><option value="product">Productos</option><option value="category">Categorías</option><option value="project">Proyectos</option><option value="page">Páginas principales</option></select></label><label>Buscar<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre, referencia o ruta" /></label><label>Elemento<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Selecciona un elemento...</option>{filteredTargets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></div>
     {!selected ? <p className="seo-empty">Selecciona un producto, categoría, proyecto o página para editar su borrador SEO.</p> : <form className="seo-editor-layout" onSubmit={save}><div className="seo-editor-fields"><p className="seo-editor-selected">Editando: <strong>{selected.label}</strong></p>{Object.entries(fieldHelp).map(([key, help]) => <label className="seo-editor-field" data-seo-field={key} key={key}><span>{help[0]}</span><small>{help[1]} {help[2]}</small>{key === 'content' ? <textarea value={fields[key]} onChange={set(key)} rows="5" /> : <input value={fields[key]} onChange={set(key)} />}</label>)}<label className="seo-editor-check"><input type="checkbox" checked={fields.noindex} onChange={set('noindex')} /> Solicitar noindex para esta página</label><div className="seo-editor-actions"><button className="btn btn-primary" disabled={saving || loading}>{saving ? 'Guardando…' : 'Guardar borrador'}</button>{message && <span className="seo-editor-message">{message}</span>}</div>{draft?.history?.length > 0 && <DraftHistory history={draft.history} />}</div><SeoPreview fields={fields} selected={selected} /></form>}
  </div>
}

function SeoPreview({ fields, selected }) {
  const title = fields.title || selected.entity.name || selected.label
  const path = fields.canonical || selected.entity.path || `https://boralba.es/${selected.id}`
  return <aside className="seo-preview"><h3>Vista previa orientativa</h3><p className="seo-preview-note">No reproduce exactamente todos los formatos de Google.</p><div className="seo-preview-card"><strong>{title || 'Título pendiente'}</strong><span>{path}</span><p>{fields.description || 'Metadescripción pendiente'}</p></div><dl><div><dt>Título</dt><dd>{title.length} caracteres · orientativo</dd></div><div><dt>Descripción</dt><dd>{fields.description.length} caracteres · orientativo</dd></div></dl></aside>
}

function DraftHistory({ history }) {
  return <section className="seo-draft-history"><h3>Historial del borrador</h3><ol>{[...history].reverse().map((entry, index) => <li key={`${entry.savedAt}-${index}`}><strong>{new Date(entry.savedAt).toLocaleString('es-ES')}</strong><span>{entry.savedBy?.email || entry.savedBy?.uid || 'Administrador'} · {entry.status}</span></li>)}</ol></section>
}
